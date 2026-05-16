import './App.css'
import { useState } from 'react'
import { ApiClientError } from './services/apiClient'
import { fetchWsprActivity, type ActivityLookupResult } from './services/wsprActivity'
import { CallsignSearch } from './components/CallsignSearch'
import { WsprMap } from './components/WsprMap'

const INITIAL_STATUS = 'Search a callsign to load recent WSPR paths.'

function App() {
  const [result, setResult] = useState<ActivityLookupResult | null>(null)
  const [status, setStatus] = useState(INITIAL_STATUS)
  const [loading, setLoading] = useState(false)

  async function handleSearch(callsign: string) {
    setLoading(true)
    setStatus(`Loading WSPR activity for ${callsign}...`)
    try {
      const lookup = await fetchWsprActivity(callsign)
      setResult(lookup)
      if (lookup.count === 0) {
        setStatus(`No recent WSPR activity found for ${callsign}.`)
      } else if (lookup.truncated) {
        setStatus(`Showing the most recent 1,000 WSPR paths for ${callsign}.`)
      } else {
        setStatus(`Showing ${lookup.count} WSPR paths for ${callsign}.`)
      }
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : 'The WSPR lookup failed. Try again.'
      setStatus(`${message} Previous successful results are preserved.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-panel" aria-labelledby="app-title">
        <p className="eyebrow">Better Map</p>
        <h1 id="app-title">WSPR callsign activity map</h1>
        <p className="intro">
          Search a HAM radio callsign to explore recent WSPR activity as
          transmitter-to-receiver paths on an interactive map.
        </p>
        <CallsignSearch onSearch={handleSearch} disabled={loading} />
        <p className="status-message" role="status" aria-live="polite">
          {status}
        </p>
      </section>
      <section className="map-panel" aria-label="WSPR activity map">
        <WsprMap features={result?.features ?? []} truncated={result?.truncated ?? false} />
      </section>
    </main>
  )
}

export default App
