export const STATUSES = ['Open', 'In Progress', 'Resolved']
export const CATEGORIES = ['Electrical', 'Plumbing', 'Furniture', 'Network', 'Other']

// Same behaviour as your old index.html: everyone can edit, delete and change status.
// Set to false to let people modify only their own reports (and make status read-only).
export const IS_STAFF = true

// Full class names are written out so Tailwind can find them.
export const STATUS_STYLE = {
  'Open': { solid: 'bg-open text-white', soft: 'bg-open-soft text-open', bar: 'bg-open', text: 'text-open' },
  'In Progress': { solid: 'bg-working text-white', soft: 'bg-working-soft text-working', bar: 'bg-working', text: 'text-working' },
  'Resolved': { solid: 'bg-done text-white', soft: 'bg-done-soft text-done', bar: 'bg-done', text: 'text-done' },
}

export const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-sm font-bold text-ink-950 transition-colors hover:bg-signal-deep disabled:opacity-60'
export const BTN_SECONDARY =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-50 disabled:opacity-60'
export const INPUT =
  'mt-1.5 w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-base text-ink-900 placeholder:text-ink-400 focus:border-ink-900'

export function timeAgo(value) {
  const date = new Date(value)
  if (isNaN(date)) return ''
  const seconds = Math.round((date.getTime() - Date.now()) / 1000)
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
  }
  return 'just now'
}

export function fullDate(value) {
  const date = new Date(value)
  return isNaN(date) ? '' : date.toLocaleString()
}
