// One helper for every request to the Flask backend.
// On failure it throws an Error with the server's message and the HTTP status.
export async function api(path, method = 'GET', body) {
  const options = { method, headers: {}, credentials: 'same-origin' }
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  let res
  try {
    res = await fetch(path, options)
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.')
  }

  let data = {}
  try {
    data = await res.json()
  } catch {
    /* empty or non-JSON body */
  }

  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong. Please try again.')
    err.status = res.status
    throw err
  }
  return data
}
