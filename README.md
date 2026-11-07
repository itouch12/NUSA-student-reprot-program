# Campus Issue Tracker

A web application for reporting and tracking problems around campus, such as broken lights, leaking taps, damaged walkways or faulty Wi-Fi. Students submit issue reports, and every report shows a clear status as it moves from **Open** to **In Progress** to **Resolved**.

**Live demo:** [https://nusa-student-reprot-program.vercel.app]

**Test login:** username '[Amaka],' password `[test password]`  (i lowkey dont remem,ber all of these so just register
(You can also register your own account from the login page.)

## Problem

Students notice problems around campus, but there is often no simple, visible way to report them or to see whether anything has been done, so reports get lost in chats and conversations.

## Solution

A single web app where students log in, report an issue with a title, category, location and description, and see its status. Campus maintenance or administrative staff can review reports and update their status. For this assessment, one user view can do everything.

## Features

- **Create:** a form to submit a new issue report (title, category, location, description)
- **Read:** a list of all reports showing title, category, location, status, reporter and date
- **Update:** edit an existing report to correct or add details
- **Update status:** change a report's status between Open, In Progress and Resolved
- **Delete:** remove a report, for example a duplicate
- **Messages:** clear success and error messages for every operation
- **Login:** register and log in with a username and password (passwords are stored hashed, never as plain text)
- **Extras:** summary counts, filter by status and category, keyword search

## Example user journey

1. Amaka notices a broken light in a library corridor.
2. She logs in and fills in the Report an Issue form: title, category Electrical, location and description.
3. She sees a success message, and the report appears in the list with the status **Open**.
4. Later she edits the report to add more detail.
5. When the fault is fixed, the status is changed to **Resolved**.
6. A duplicate report is deleted from the list.

## Tech stack

| Part | Technology |
|---|---|
| Backend | Python, Flask |
| Database | PostgreSQL (hosted on Supabase) |
| Frontend | HTML, CSS and JavaScript |
| Authentication | Flask sessions, Werkzeug password hashing |
| Hosting | Vercel |

## Database

**`issues` table**

| Field | Type | Notes |
|---|---|---|
| id | Serial | Unique identifier (primary key) |
| title | Text | Required |
| description | Text | Required |
| category | Text | Electrical, Plumbing, Furniture, Network or Other |
| location | Text | Where the issue is on campus |
| status | Text | Open, In Progress or Resolved. Default: Open |
| reporter_name | Text | Set from the logged-in username |
| created_at | Timestamp | Set automatically when created |
| user_id | Integer | Links the report to the user who created it |

**`users` table:** id, username (unique), password_hash, role, created_at.

## API endpoints

| Method | Route | Purpose |
|---|---|---|
| POST | `/register` | Create an account |
| POST | `/login` | Log in |
| POST | `/logout` | Log out |
| GET | `/me` | Current logged-in user |
| GET | `/issues` | List all reports |
| GET | `/issues/<id>` | Get one report |
| POST | `/issues` | Create a report |
| PUT | `/issues/<id>` | Edit a report |
| PATCH | `/issues/<id>/status` | Change a report's status |
| DELETE | `/issues/<id>` | Delete a report |

All issue routes require login and return clear JSON error messages with the right status codes (400 invalid input, 401 not logged in, 404 not found).

## Run it locally

1. Clone the repository and open the folder.
2. Create and activate a virtual environment, then install the packages:
   ```
   python -m venv env
   env\Scripts\activate
   pip install -r requirements.txt
   ```
3. Create a PostgreSQL database (for example on Supabase) and run the SQL for the `users` and `issues` tables.
4. Create a `.env` file in the project root:
   ```
   DATABASE_URL=your_postgres_connection_string
   SECRET_KEY=a_long_random_string
   ```
5. Start the app:
   ```
   python app.py
   ```
6. Open `http://127.0.0.1:5000`.

## Deployment

Deployed on Vercel from this GitHub repository. `DATABASE_URL` and `SECRET_KEY` are set as environment variables in the Vercel project settings. The `.env` file is never committed.

## Project structure

```
app.py              Flask app: routes, validation, database access
public/index.html   Frontend page (HTML, CSS, JavaScript)
requirements.txt    Python dependencies
```

## Author

Irabor Aire
