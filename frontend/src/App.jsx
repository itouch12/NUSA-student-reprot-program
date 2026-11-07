import { useCallback, useEffect, useState } from 'react'
import { api } from './api'
import Header from './components/Header'
import AuthScreen from './components/AuthScreen'
import SummaryStrip from './components/SummaryStrip'
import IssueList from './components/IssueList'
import IssueModal from './components/IssueModal'
import ConfirmDialog from './components/ConfirmDialog'
import Toasts from './components/Toasts'
import { Icon, Logo } from './components/Icons'
import { BTN_PRIMARY } from './lib/constants'

const NO_FILTERS = { status: '', category: '', term: '' }

export default function App() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true) // true until /me has answered
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true) // true while the issue list is loading
  const [filters, setFilters] = useState(NO_FILTERS)
  const [modal, setModal] = useState(null) // null, or { issue: report | null }
  const [toDelete, setToDelete] = useState(null) // report waiting for delete confirmation
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])
  const notify = useCallback(
    (text, type = 'success') => {
      const id = Date.now() + Math.random()
      setToasts((t) => [...t.slice(-2), { id, text, type }])
      setTimeout(() => dismiss(id), 5000)
    },
    [dismiss],
  )

  const reload = useCallback(async () => setIssues(await api('/issues')), [])

  // On first load: is someone already logged in?
  useEffect(() => {
    api('/me')
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setChecking(false))
  }, [])

  // Whenever the user changes, load (or clear) their issues
  useEffect(() => {
    if (!user) {
      setIssues([])
      setLoading(true)
      return
    }
    let cancelled = false
    api('/issues')
      .then((d) => !cancelled && setIssues(d))
      .catch((e) => !cancelled && notify(e.message, 'error'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [user, notify])

  // Runs an action; shows the server's message on success or the error on failure.
  async function run(action) {
    try {
      const data = await action()
      if (data?.message) notify(data.message)
      return true
    } catch (err) {
      if (err.status === 401) setUser(null) // session expired
      notify(err.message, 'error')
      return false
    }
  }

  const handleAuth = (mode, username, password) =>
    run(async () => {
      const data = await api(mode === 'register' ? '/register' : '/login', 'POST', {
        username,
        password,
      })
      setUser(data.user)
      return data
    })

  async function handleLogout() {
    try {
      await api('/logout', 'POST')
    } catch {
      /* ignore: we log out locally either way */
    }
    setUser(null)
    setModal(null)
    setToDelete(null)
    setFilters(NO_FILTERS)
    notify('You have been logged out.')
  }

  async function saveIssue(payload) {
    const editing = modal?.issue
    const ok = await run(async () => {
      const data = editing
        ? await api('/issues/' + editing.id, 'PUT', payload)
        : await api('/issues', 'POST', payload)
      await reload()
      return data
    })
    if (ok) setModal(null)
    return ok
  }

  async function changeStatus(id, status) {
    // Update the screen immediately, then confirm with the server.
    setIssues((list) => list.map((i) => (i.id === id ? { ...i, status } : i)))
    const ok = await run(() => api(`/issues/${id}/status`, 'PATCH', { status }))
    reload().catch(() => {})
    return ok
  }

  async function confirmDelete() {
    const id = toDelete.id
    const ok = await run(async () => {
      const data = await api('/issues/' + id, 'DELETE')
      await reload()
      return data
    })
    if (ok) setToDelete(null)
  }

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Logo className="size-12 animate-pulse" />
      </div>
    )
  }

  const openCount = issues.filter((i) => i.status === 'Open').length
  const workingCount = issues.filter((i) => i.status === 'In Progress').length

  return (
    <div className="min-h-screen">
      {user ? (
        <>
          <Header user={user} onLogout={handleLogout} />

          <main className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:pt-10">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Campus issues</h1>
                <p className="mt-1 text-ink-600">
                  {loading
                    ? 'Loading reports…'
                    : `${openCount} open, ${workingCount} in progress.`}
                </p>
              </div>
              <button type="button" onClick={() => setModal({ issue: null })} className={BTN_PRIMARY}>
                <Icon name="plus" className="size-4" />
                Report an issue
              </button>
            </div>

            <SummaryStrip
              issues={issues}
              loading={loading}
              active={filters.status}
              onPick={(status) =>
                setFilters((f) => ({ ...f, status: f.status === status ? '' : status }))
              }
            />

            <div className="mt-6">
              <IssueList
                issues={issues}
                loading={loading}
                user={user}
                filters={filters}
                setFilters={setFilters}
                onNew={() => setModal({ issue: null })}
                onEdit={(issue) => setModal({ issue })}
                onDelete={setToDelete}
                onStatus={changeStatus}
              />
            </div>
          </main>

          {modal && (
            <IssueModal
              key={modal.issue?.id ?? 'new'}
              issue={modal.issue}
              onSubmit={saveIssue}
              onClose={() => setModal(null)}
            />
          )}
          {toDelete && (
            <ConfirmDialog
              issue={toDelete}
              onConfirm={confirmDelete}
              onClose={() => setToDelete(null)}
            />
          )}
        </>
      ) : (
        <AuthScreen onSubmit={handleAuth} />
      )}

      <Toasts toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
