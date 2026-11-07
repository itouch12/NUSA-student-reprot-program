import { useEffect, useId, useRef } from 'react'
import { Icon } from './Icons'

// Bottom sheet on phones, centred dialog on larger screens.
// Closes on Escape, on backdrop click and with the X button. Locks page scroll while open.
export default function Modal({ title, onClose, children, width = 'sm:max-w-lg' }) {
  const titleId = useId()
  const closeRef = useRef(onClose)

  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeRef.current()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 animate-fade bg-ink-950/60"
        onClick={() => closeRef.current()}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative max-h-[92dvh] w-full animate-pop overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl ${width}`}
      >
        <div className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-6">
          <h2 id={titleId} className="font-display text-xl font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900"
          >
            <Icon name="x" />
          </button>
        </div>
        <div className="px-5 pb-5 pt-3 sm:px-6 sm:pb-6">{children}</div>
      </div>
    </div>
  )
}
