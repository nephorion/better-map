// SPDX-License-Identifier: AGPL-3.0-only
import { useState } from 'react'
import { isValidCallsign, normalizeCallsign } from '../services/callsign'

type CallsignPromptProps = {
  initialValue?: string
  onConfirm: (callsign: string) => void
  onDismiss: () => void
}

export function CallsignPrompt({ initialValue = '', onConfirm, onDismiss }: CallsignPromptProps) {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState('')

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = normalizeCallsign(value)
    if (!isValidCallsign(normalized)) {
      setError('Enter a valid callsign using 3-12 letters, numbers, or /.')
      return
    }
    setError('')
    onConfirm(normalized)
  }

  return (
    <div className="overlay-panel callsign-prompt" role="dialog" aria-label="Choose callsign">
      <form onSubmit={submit}>
        <label htmlFor="callsign-prompt-input">Callsign</label>
        <input
          id="callsign-prompt-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete="off"
          autoFocus
        />
        {error ? <p className="field-error">{error}</p> : <p className="field-help">Used only in this browser.</p>}
        <div className="button-row">
          <button type="submit">Set Callsign</button>
          <button type="button" className="secondary-button" onClick={onDismiss}>Dismiss</button>
        </div>
      </form>
    </div>
  )
}
