import { STATUSES, STATUS_STYLE } from '../lib/constants'

// The signature element: a three-stage track (Open > In Progress > Resolved).
// Stages already passed are tinted, the current stage is solid, future stages are plain.
export default function StatusTrack({ value, onChange, readOnly = false, label = 'Status' }) {
  const current = STATUSES.indexOf(value)
  const style = STATUS_STYLE[value] || STATUS_STYLE.Open

  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex w-full overflow-hidden rounded-full border border-ink-200 bg-white text-xs font-semibold sm:w-auto"
    >
      {STATUSES.map((s, idx) => {
        const active = idx === current
        const passed = idx < current
        const tone = active
          ? style.solid
          : passed
            ? style.soft
            : 'text-ink-500 hover:bg-ink-50 disabled:hover:bg-transparent'
        return (
          <button
            key={s}
            type="button"
            aria-pressed={active}
            disabled={readOnly}
            onClick={() => !active && onChange?.(s)}
            className={`flex-1 whitespace-nowrap px-3.5 py-1.5 transition-colors sm:flex-none ${
              idx > 0 ? 'border-l border-ink-200' : ''
            } ${tone}`}
          >
            {s}
          </button>
        )
      })}
    </div>
  )
}
