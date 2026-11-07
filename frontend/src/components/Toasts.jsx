import { Icon } from './Icons'

export default function Toasts({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed inset-x-4 top-4 z-60 flex flex-col gap-2 sm:left-auto sm:right-4 sm:w-96">
      {toasts.map((t) => {
        const error = t.type === 'error'
        return (
          <div
            key={t.id}
            role={error ? 'alert' : 'status'}
            className={`pointer-events-auto flex animate-drop items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
              error
                ? 'border-open/30 bg-open-soft text-open'
                : 'border-ink-950 bg-ink-950 text-white'
            }`}
          >
            <Icon
              name={error ? 'alert' : 'check'}
              className={`mt-0.5 size-5 shrink-0 ${error ? '' : 'text-signal'}`}
            />
            <p className="flex-1">{t.text}</p>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss"
              className="-m-1 grid size-7 shrink-0 place-items-center rounded-md opacity-70 hover:opacity-100"
            >
              <Icon name="x" className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
