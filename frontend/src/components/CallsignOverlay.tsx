// SPDX-License-Identifier: AGPL-3.0-only
type CallsignOverlayProps = {
  callsign: string | null
  onEdit: () => void
}

export function CallsignOverlay({ callsign, onEdit }: CallsignOverlayProps) {
  return (
    <button type="button" className="overlay-panel callsign-overlay" onClick={onEdit}>
      <span>{callsign ? 'Active callsign' : 'No callsign'}</span>
      <strong>{callsign ?? 'Set Callsign'}</strong>
    </button>
  )
}
