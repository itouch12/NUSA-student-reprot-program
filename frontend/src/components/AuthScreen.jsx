import { useState } from 'react'
import { Icon, Logo } from './Icons'
import StatusTrack from './StatusTrack'
import { BTN_PRIMARY, INPUT } from '../lib/constants'

export default function AuthScreen({ onSubmit }) {
  const [register, setRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    await onSubmit(register ? 'register' : 'login', username, password)
    setBusy(false)
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.15fr_1fr]">
      <aside className="flex flex-col justify-between gap-8 bg-ink-950 px-6 py-8 text-white sm:px-10 lg:min-h-screen lg:px-14 lg:py-12">
        <div className="flex items-center gap-3">
          <Logo className="size-9" />
          <span className="font-display text-lg font-bold">Campus Issue Tracker</span>
        </div>

        <div>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            Something broken on campus? Report it and watch it get fixed.
          </h1>
          <p className="mt-5 hidden max-w-md text-ink-200 sm:block">
            Students report the problem. Maintenance staff move it through three stages, and
            everyone can see where it stands.
          </p>
        </div>

        <div className="hidden lg:block">
          <StatusTrack value="In Progress" readOnly label="Example of a report in progress" />
          <p className="mt-3 text-sm text-ink-300">
            Every report moves from Open to In Progress to Resolved.
          </p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-3xl font-extrabold">
            {register ? 'Create your account' : 'Log in'}
          </h2>
          <p className="mt-1 text-ink-600">
            {register
              ? 'Pick a username and password to start reporting.'
              : 'Log in to report an issue or check on one.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="auth-username" className="text-sm font-semibold">
                Username
              </label>
              <input
                id="auth-username"
                className={INPUT}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="text-sm font-semibold">
                Password
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  className={`${INPUT} pr-11`}
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={register ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                  className="absolute right-1.5 top-1/2 mt-0.5 grid size-9 -translate-y-1/2 place-items-center rounded-md text-ink-500 hover:text-ink-900"
                >
                  <Icon name={show ? 'eyeOff' : 'eye'} className="size-5" />
                </button>
              </div>
              {register && <p className="mt-1.5 text-xs text-ink-500">At least 6 characters.</p>}
            </div>

            <button type="submit" disabled={busy} className={`${BTN_PRIMARY} w-full py-3 text-base`}>
              {busy ? 'Please wait…' : register ? 'Create account' : 'Log in'}
            </button>
          </form>

          <p className="mt-6 text-sm text-ink-600">
            {register ? 'Already have an account?' : 'No account yet?'}{' '}
            <button
              type="button"
              onClick={() => setRegister(!register)}
              className="font-semibold text-ink-900 underline underline-offset-4"
            >
              {register ? 'Log in' : 'Register'}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}
