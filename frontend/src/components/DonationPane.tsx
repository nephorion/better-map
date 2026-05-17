import { useEffect, useRef } from 'react'
import { KO_FI_EMBED_URL, KO_FI_PAGE_URL, SUPPORT_LINK_LABELS } from '../services/supportLinks'

type DonationPaneProps = {
  open: boolean
  failed: boolean
  onOpen: () => void
  onDismiss: () => void
  onLoadError: () => void
}

export function DonationPane({ open, failed, onOpen, onDismiss, onLoadError }: DonationPaneProps) {
  const controlRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    function closeOnOutsideClick(event: MouseEvent) {
      if (!controlRef.current?.contains(event.target as Node)) onDismiss()
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [onDismiss, open])

  return (
    <div ref={controlRef} className="donation-control">
      <button
        type="button"
        className="support-link donation-button"
        aria-label="Donate"
        aria-expanded={open}
        aria-controls="ko-fi-donation-pane"
        title="Donate"
        onClick={onOpen}
      >
        $
        <span className="control-tooltip" role="tooltip">Donate</span>
      </button>
      {open ? (
        <section id="ko-fi-donation-pane" className="overlay-panel donation-pane" aria-label={SUPPORT_LINK_LABELS.donation}>
          <div className="support-panel-header">
            <h2>Support Better Map</h2>
            <button type="button" onClick={onDismiss}>Dismiss</button>
          </div>
          {failed ? (
            <p>
              Ko-fi could not load here.{' '}
              <a href={KO_FI_PAGE_URL} target="_blank" rel="noreferrer">
                Open Ko-fi in a new tab
              </a>
              .
            </p>
          ) : (
            <iframe
              title="Ko-fi donation pane for Better Map"
              src={KO_FI_EMBED_URL}
              loading="lazy"
              onError={onLoadError}
            />
          )}
        </section>
      ) : null}
    </div>
  )
}
