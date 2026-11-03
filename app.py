import os
from functools import wraps

import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from flask import Flask, jsonify, request, session
from flask import Flask, jsonify, request, session, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

app = Flask(__name__)
app.secret_key = os.environ["SECRET_KEY"]
app.config.update(SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SAMESITE="Lax")

VALID_STATUSES = ["Open", "In Progress", "Resolved"]
VALID_CATEGORIES = ["Electrical", "Plumbing", "Furniture", "Network", "Other"]
SINGLE_VIEW = True


def get_connection():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def run_query(sql, params=(), fetch=None):
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, params)
            result = None
            if fetch == "all":
                result = cur.fetchall()
            elif fetch == "one":
                result = cur.fetchone()
        conn.commit()
        return result
    finally:
        conn.close()


# ---------- helpers ----------

def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Please log in to continue."}), 401
        return f(*args, **kwargs)
    return wrapper


def is_staff():
    return SINGLE_VIEW or session.get("role") == "staff"


def can_modify(issue):
    return is_staff() or issue["user_id"] == session.get("user_id")


def validate_issue(data):
    errors = []
    if not str(data.get("title") or "").strip():
        errors.append("Title is required.")
    if not str(data.get("description") or "").strip():
        errors.append("Description is required.")
    category = data.get("category")
    if category and category not in VALID_CATEGORIES:
        errors.append("Category must be one of: " + ", ".join(VALID_CATEGORIES) + ".")
    return errors


@app.errorhandler(psycopg2.Error)
def handle_db_error(e):
    return jsonify({"error": "A database error occurred. Please try again."}), 500


@app.route("/")

def home():
    return send_from_directory(os.path.join(BASE_DIR, "public"), "index.html")

# ---------- authentication ----------

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username") or "").strip().lower()
    password = str(data.get("password") or "")

    if len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters."}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    if run_query("SELECT id FROM users WHERE username = %s", (username,), fetch="one"):
        return jsonify({"error": "That username is already taken."}), 409

    user = run_query(
        "INSERT INTO users (username, password_hash) VALUES (%s, %s) RETURNING id, username, role",
        (username, generate_password_hash(password)),
        fetch="one",
    )
    session.clear()
    session["user_id"] = user["id"]
    session["username"] = user["username"]
    session["role"] = user["role"]
    return jsonify({"message": "Account created. You are now logged in.", "user": user}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username") or "").strip().lower()
    password = str(data.get("password") or "")

    user = run_query("SELECT * FROM users WHERE username = %s", (username,), fetch="one")
    # same message for both cases so attackers can't tell which part was wrong
    if user is None or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid username or password."}), 401

    session.clear()
    session["user_id"] = user["id"]
    session["username"] = user["username"]
    session["role"] = user["role"]
    return jsonify({
        "message": "Logged in successfully.",
        "user": {"id": user["id"], "username": user["username"], "role": user["role"]},
    })


@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out."})


@app.route("/me", methods=["GET"])
def me():
    if "user_id" not in session:
        return jsonify({"user": None})
    return jsonify({"user": {
        "id": session["user_id"],
        "username": session["username"],
        "role": session["role"],
    }})


# ---------- issues (CRUD) ----------

@app.route("/issues", methods=["GET"])
@login_required
def list_issues():
    rows = run_query("SELECT * FROM issues ORDER BY id DESC", fetch="all")
    return jsonify(rows)


@app.route("/issues/<int:issue_id>", methods=["GET"])
@login_required
def get_issue(issue_id):
    row = run_query("SELECT * FROM issues WHERE id = %s", (issue_id,), fetch="one")
    if row is None:
        return jsonify({"error": "Issue not found."}), 404
    return jsonify(row)


@app.route("/issues", methods=["POST"])
@login_required
def create_issue():
    data = request.get_json(silent=True) or {}
    errors = validate_issue(data)
    if errors:
        return jsonify({"error": " ".join(errors)}), 400
    row = run_query(
        """INSERT INTO issues (title, description, category, location, reporter_name, user_id)
           VALUES (%s, %s, %s, %s, %s, %s) RETURNING *""",
        (
            data["title"].strip(),
            data["description"].strip(),
            data.get("category") or "Other",
            (data.get("location") or "").strip(),
            session["username"],      # taken from the login, not from the form
            session["user_id"],
        ),
        fetch="one",
    )
    return jsonify({"message": "Issue reported successfully.", "issue": row}), 201


@app.route("/issues/<int:issue_id>", methods=["PUT"])
@login_required
def update_issue(issue_id):
    existing = run_query("SELECT * FROM issues WHERE id = %s", (issue_id,), fetch="one")
    if existing is None:
        return jsonify({"error": "Issue not found."}), 404
    if not can_modify(existing):
        return jsonify({"error": "You can only edit your own reports."}), 403

    data = request.get_json(silent=True) or {}
    errors = validate_issue(data)
    if errors:
        return jsonify({"error": " ".join(errors)}), 400

    row = run_query(
        """UPDATE issues SET title = %s, description = %s, category = %s, location = %s
           WHERE id = %s RETURNING *""",
        (
            data["title"].strip(),
            data["description"].strip(),
            data.get("category") or "Other",
            (data.get("location") or "").strip(),
            issue_id,
        ),
        fetch="one",
    )
    return jsonify({"message": "Issue updated successfully.", "issue": row})


@app.route("/issues/<int:issue_id>/status", methods=["PATCH"])
@login_required
def update_status(issue_id):
    if not is_staff():
        return jsonify({"error": "Only staff can change the status."}), 403
    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if status not in VALID_STATUSES:
        return jsonify({"error": "Status must be one of: " + ", ".join(VALID_STATUSES) + "."}), 400
    row = run_query(
        "UPDATE issues SET status = %s WHERE id = %s RETURNING *",
        (status, issue_id),
        fetch="one",
    )
    if row is None:
        return jsonify({"error": "Issue not found."}), 404
    return jsonify({"message": "Status changed to " + status + ".", "issue": row})


@app.route("/issues/<int:issue_id>", methods=["DELETE"])
@login_required
def delete_issue(issue_id):
    existing = run_query("SELECT * FROM issues WHERE id = %s", (issue_id,), fetch="one")
    if existing is None:
        return jsonify({"error": "Issue not found."}), 404
    if not can_modify(existing):
        return jsonify({"error": "You can only delete your own reports."}), 403
    run_query("DELETE FROM issues WHERE id = %s", (issue_id,))
    return jsonify({"message": "Issue deleted successfully."})


if __name__ == "__main__":
    app.run(debug=True)