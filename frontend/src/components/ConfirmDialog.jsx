import { useState } from 'react'
import Modal from './Modal'
import { BTN_SECONDARY } from '../lib/constants'

// Replaces the browser's confirm() popup for deleting a report.
export default function ConfirmDialog({ issue, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false)

  async function handleConfirm() {
    setBusy(true)
    await onConfirm()
    setBusy(false)
  }

  return (
    <Modal title="Delete this report?" onClose={onClose} width="sm:max-w-md">
      <p className="text-ink-600">
        <strong className="text-ink-900">{issue.title}</strong> will be removed for everyone. This
        cannot be undone.
      </p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className={BTN_SECONDARY}>
          Keep report
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={busy}
          className="inline-flex items-center justify-center rounded-lg bg-open px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-open/90 disabled:opacity-60"
        >
          {busy ? 'Deleting…' : 'Delete report'}
        </button>
      </div>
    </Modal>
  )
}
