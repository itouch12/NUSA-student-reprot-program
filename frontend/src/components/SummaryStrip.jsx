// One strip, four cells. Click a cell to filter the list by that status.
export default function SummaryStrip({ issues, loading, active, onPick }) {
  const count = (s) => issues.filter((i) => i.status === s).length
  const cells = [
    { label: 'All reports', value: issues.length, status: '', bar: 'bg-ink-900' },
    { label: 'Open', value: count('Open'), status: 'Open', bar: 'bg-open' },
    { label: 'In progress', value: count('In Progress'), status: 'In Progress', bar: 'bg-working' },
    { label: 'Resolved', value: count('Resolved'), status: 'Resolved', bar: 'bg-done' },
  ]

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-4">
      {cells.map((c) => {
        const on = active === c.status
        return (
          <button
            key={c.label}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(c.status)}
            className={`relative px-5 pb-4 pt-5 text-left transition-colors hover:bg-ink-50 ${
              on ? 'bg-ink-50' : 'bg-white'
            }`}
          >
            <span
              className={`absolute inset-x-0 top-0 h-1 ${c.bar} ${on ? 'opacity-100' : 'opacity-35'}`}
            />
            <span className="font-display block text-4xl font-extrabold tabular-nums text-ink-950">
              {loading ? '–' : c.value}
            </span>
            <span className="mt-0.5 block text-sm text-ink-600">{c.label}</span>
          </button>
        )
      })}
    </div>
  )
}
