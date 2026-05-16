import { useState, type FormEvent } from 'react'
import { isValidCallsign, normalizeCallsign } from '../services/callsign'

type CallsignSearchProps = {
  onSearch: (callsign: string) => void
  disabled?: boolean
}

export function CallsignSearch({ onSearch, disabled = false }: CallsignSearchProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const callsign = normalizeCallsign(value)
    if (!isValidCallsign(callsign)) {
      setError('Use 3-12 letters, numbers, or /.')
      return
    }
    setError('')
    onSearch(callsign)
  }

  return (
    <form className="callsign-search" onSubmit={handleSubmit} aria-label="Callsign search">
      <label htmlFor="callsign">Callsign</label>
      <div className="callsign-row">
        <input
          id="callsign"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="VK2DJJ"
          aria-describedby={error ? 'callsign-error' : 'callsign-help'}
          disabled={disabled}
        />
        <button type="submit" disabled={disabled}>
          Search
        </button>
      </div>
      <p id="callsign-help" className="field-help">
        Enter 3-12 letters, numbers, or /.
      </p>
      {error ? (
        <p id="callsign-error" className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}
