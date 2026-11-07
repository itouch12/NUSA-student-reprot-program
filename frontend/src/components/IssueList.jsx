import { Icon, CATEGORY_ICON } from './Icons'
import StatusTrack from './statustrack'
import { BTN_PRIMARY, CATEGORIES, IS_STAFF, fullDate, timeAgo } from '../lib/constants'

const NO_FILTERS = { status: '', category: '', term: '' }

export default function IssueList({
  issues,
  loading,
  user,
  filters,
  setFilters,
  onNew,
  onEdit,
  onDelete,
  onStatus,
}) {
  const { status, category, term } = filters
  const q = term.trim().toLowerCase()
  const filtering = Boolean(status || category || q)

  const shown = issues.filter((i) => {
    if (status && i.status !== status) return false
    if (category && i.category !== category) return false
    if (q) {
      const text = [i.title, i.description, i.location, i.category, i.reporter_name]
        .join(' ')
        .toLowerCase()
      if (!text.includes(q)) return false
    }
    return true
  })

  const clear = () => setFilters(NO_FILTERS)

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex items-baseline justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <h2 className="font-display text-xl font-bold">Reports</h2>
        <p className="text-sm text-ink-500" aria-live="polite">
          {loading ? 'Loading…' : `Showing ${shown.length} of ${issues.length}`}
        </p>
      </div>

      <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="relative flex-1">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400"
          />
          <input
            type="search"
            aria-label="Search reports"
            placeholder="Search by title, place or person"
            value={term}
            onChange={(e) => setFilters({ ...filters, term: e.target.value })}
            className="w-full rounded-lg border border-ink-200 bg-white py-2.5 pl-10 pr-3 text-sm placeholder:text-ink-400"
          />
        </div>
        <select
          aria-label="Filter by category"
          value={category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        {filtering && (
          <button
            type="button"
            onClick={clear}
            className="self-start text-sm font-semibold text-ink-900 underline underline-offset-4 sm:self-auto"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <ul aria-hidden="true">
          {[0, 1, 2].map((n) => (
            <li key={n} className="flex animate-pulse gap-4 border-b border-line p-5 last:border-0">
              <div className="size-11 shrink-0 rounded-lg bg-ink-100" />
              <div className="flex-1 space-y-2.5 pt-1">
                <div className="h-4 w-1/2 rounded bg-ink-100" />
                <div className="h-3 w-3/4 rounded bg-ink-100" />
                <div className="h-3 w-1/3 rounded bg-ink-100" />
              </div>
            </li>
          ))}
        </ul>
      ) : shown.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-ink-100 text-ink-500">
            <Icon name="inbox" className="size-7" />
          </div>
          <h3 className="font-display mt-4 text-lg font-bold">
            {issues.length === 0 ? 'No reports yet' : 'No reports match your filters'}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink-600">
            {issues.length === 0
              ? 'When something breaks on campus, report it here so it gets fixed.'
              : 'Try a different search, or clear the filters to see every report.'}
          </p>
          <button
            type="button"
            onClick={issues.length === 0 ? onNew : clear}
            className={`${BTN_PRIMARY} mt-5`}
          >
            {issues.length === 0 ? 'Report an issue' : 'Clear filters'}
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {shown.map((i) => {
            const canModify = IS_STAFF || i.user_id === user.id
            return (
              <li
                key={i.id}
                className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between lg:gap-6"
              >
                <div className="flex min-w-0 gap-4">
                  <div
                    className="grid size-11 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-700"
                    title={i.category}
                  >
                    <Icon name={CATEGORY_ICON[i.category] || 'dots'} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display break-words text-base font-bold text-ink-950">
                      {i.title}
                    </h3>
                    <p className="mt-0.5 line-clamp-2 break-words text-sm text-ink-600">
                      {i.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                      <span className="font-semibold text-ink-700">{i.category}</span>
                      {i.location && (
                        <span className="inline-flex items-center gap-1">
                          <Icon name="pin" className="size-3.5" />
                          {i.location}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Icon name="user" className="size-3.5" />
                        {i.reporter_name}
                      </span>
                      <time dateTime={i.created_at} title={fullDate(i.created_at)}>
                        {timeAgo(i.created_at)}
                      </time>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:shrink-0">
                  <StatusTrack
                    value={i.status}
                    readOnly={!IS_STAFF}
                    label={`Status of ${i.title}`}
                    onChange={(s) => onStatus(i.id, s)}
                  />
                  {canModify && (
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(i)}
                        aria-label={`Edit ${i.title}`}
                        title="Edit"
                        className="grid size-9 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
                      >
                        <Icon name="edit" className="size-[18px]" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(i)}
                        aria-label={`Delete ${i.title}`}
                        title="Delete"
                        className="grid size-9 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-open-soft hover:text-open"
                      >
                        <Icon name="trash" className="size-[18px]" />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
