import { useState } from 'react'
import Modal from './Modal'
import { Icon, CATEGORY_ICON } from './Icons'
import { BTN_PRIMARY, BTN_SECONDARY, CATEGORIES, INPUT } from '../lib/constants'

const EMPTY = { title: '', category: 'Electrical', location: '', description: '' }

// Used for both "Report an issue" (issue = null) and "Edit report" (issue = the report).
export default function IssueModal({ issue, onSubmit, onClose }) {
  const [form, setForm] = useState(
    issue
      ? {
          title: issue.title,
          category: issue.category || 'Other',
          location: issue.location || '',
          description: issue.description,
        }
      : EMPTY,
  )
  const [saving, setSaving] = useState(false)
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await onSubmit(form)
    setSaving(false)
  }

  return (
    <Modal title={issue ? `Edit report #${issue.id}` : 'Report an issue'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="issue-title" className="text-sm font-semibold">
            Title
          </label>
          <input
            id="issue-title"
            className={INPUT}
            value={form.title}
            onChange={set('title')}
            required
            maxLength={120}
            placeholder="e.g. Broken light in library corridor"
            autoFocus
          />
        </div>

        <div>
          <span id="issue-category" className="text-sm font-semibold">
            Category
          </span>
          <div className="mt-1.5 flex flex-wrap gap-2" role="group" aria-labelledby="issue-category">
            {CATEGORIES.map((c) => {
              const on = form.category === c
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setForm({ ...form, category: c })}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    on
                      ? 'border-ink-950 bg-ink-950 text-white'
                      : 'border-ink-200 bg-white text-ink-700 hover:border-ink-400'
                  }`}
                >
                  <Icon name={CATEGORY_ICON[c]} className="size-4" />
                  {c}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label htmlFor="issue-location" className="text-sm font-semibold">
            Location
          </label>
          <input
            id="issue-location"
            className={INPUT}
            value={form.location}
            onChange={set('location')}
            maxLength={120}
            placeholder="e.g. Library, 1st floor"
          />
        </div>

        <div>
          <label htmlFor="issue-description" className="text-sm font-semibold">
            Description
          </label>
          <textarea
            id="issue-description"
            className={`${INPUT} min-h-28 resize-y`}
            value={form.description}
            onChange={set('description')}
            required
            placeholder="What is wrong, and since when?"
          />
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className={BTN_PRIMARY}>
            {saving ? 'Saving…' : issue ? 'Save changes' : 'Submit report'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
