import { Icon, Logo } from './Icons'

export default function Header({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-30 bg-ink-950 text-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Logo className="size-8 shrink-0" />
          <span className="font-display truncate text-lg font-bold">Campus Issue Tracker</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 pr-2 sm:flex">
            <span
              className="grid size-8 place-items-center rounded-full bg-signal text-sm font-bold text-ink-950"
              aria-hidden="true"
            >
              {user.username.slice(0, 1).toUpperCase()}
            </span>
            <span className="max-w-40 truncate text-sm font-medium">{user.username}</span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-100 transition-colors hover:bg-white/10 focus-visible:outline-signal"
          >
            <Icon name="logout" className="size-4" />
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}
