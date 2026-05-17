import './App.css'
import { useEffect, useRef, useState } from 'react'
import { ApiClientError } from './services/apiClient'
import { fetchWsprActivity, type ActivityLookupResult } from './services/wsprActivity'
import { WsprMap } from './components/WsprMap'
import { CallsignPrompt } from './components/CallsignPrompt'
import { CallsignOverlay } from './components/CallsignOverlay'
import { BaseMapSelector } from './components/BaseMapSelector'
import { RefreshCountdown } from './components/RefreshCountdown'
import { readStoredCallsign, saveCallsign } from './services/callsign'
import { nextRefreshAt, remainingRefreshSeconds } from './services/refreshState'
import { readStoredBaseMapLayer, saveBaseMapLayer, type BaseMapLayer } from './services/baseMapLayers'
import { loadVersionMetadata, type VersionMetadata } from './services/versionMetadata'

const INITIAL_STATUS = ''

function App() {
  const [initialStorage] = useState(readStoredCallsign)
  const [result, setResult] = useState<ActivityLookupResult | null>(null)
  const [status, setStatus] = useState(initialStorage.warning ?? INITIAL_STATUS)
  const [callsign, setCallsign] = useState<string | null>(initialStorage.callsign)
  const [promptOpen, setPromptOpen] = useState(!initialStorage.callsign)
  const [loading, setLoading] = useState(false)
  const [nextRefresh, setNextRefresh] = useState(nextRefreshAt())
  const [remainingSeconds, setRemainingSeconds] = useState(remainingRefreshSeconds(nextRefresh))
  const [baseLayerId, setBaseLayerId] = useState<BaseMapLayer['id']>(readStoredBaseMapLayer)
  const [baseMapOpen, setBaseMapOpen] = useState(false)
  const [version, setVersion] = useState<VersionMetadata | null>(null)
  const activeRequest = useRef<string | null>(null)

  async function loadActivity(activeCallsign: string) {
    /* v8 ignore next -- Refresh controls are disabled while a matching request is active. */
    if (activeRequest.current === activeCallsign) return
    activeRequest.current = activeCallsign
    setLoading(true)
    setStatus(`Loading WSPR activity for ${activeCallsign}...`)
    try {
      const lookup = await fetchWsprActivity(activeCallsign)
      setResult(lookup)
      setStatus('')
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : 'The WSPR lookup failed. Try again.'
      setStatus(`${message} Previous successful results are preserved.`)
    } finally {
      setNextRefresh(nextRefreshAt())
      setLoading(false)
      activeRequest.current = null
    }
  }

  function confirmCallsign(value: string) {
    const saved = saveCallsign(value)
    /* v8 ignore next 3 -- CallsignPrompt validates before confirming. */
    if (!saved.callsign) {
      setStatus(saved.warning ?? 'Enter a valid callsign.')
      return
    }
    setCallsign(saved.callsign)
    setPromptOpen(false)
    setResult(null)
    setNextRefresh(nextRefreshAt())
    if (saved.warning) setStatus(saved.warning)
    void loadActivity(saved.callsign)
  }

  function changeBaseMap(id: BaseMapLayer['id']) {
    setBaseLayerId(id)
    saveBaseMapLayer(id)
  }

  useEffect(() => {
    const startupCallsign = initialStorage.callsign
    if (startupCallsign) window.setTimeout(() => void loadActivity(startupCallsign), 0)
    void loadVersionMetadata().then(setVersion)
  }, [initialStorage.callsign])

  useEffect(() => {
    const timer = window.setInterval(() => {
      const remaining = remainingRefreshSeconds(nextRefresh)
      setRemainingSeconds(remaining)
      if (remaining === 0 && callsign && !loading) void loadActivity(callsign)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [callsign, loading, nextRefresh])

  return (
    <main className="app-shell" aria-label="WSPR activity map">
      <WsprMap
        features={result?.features ?? []}
        truncated={result?.truncated ?? false}
        baseLayerId={baseLayerId}
        activeCallsign={callsign}
      />
      <div className="overlay-stack top-left">
        {callsign ? (
          <RefreshCountdown
            remainingSeconds={remainingSeconds}
            refreshing={loading}
            onRefresh={() => callsign && void loadActivity(callsign)}
          />
        ) : null}
        <CallsignOverlay callsign={callsign} onEdit={() => setPromptOpen(true)} />
      </div>
      <BaseMapSelector
        activeLayerId={baseLayerId}
        open={baseMapOpen}
        onChange={changeBaseMap}
        onToggle={() => setBaseMapOpen((open) => !open)}
      />
      {promptOpen ? (
        <CallsignPrompt initialValue={callsign ?? ''} onConfirm={confirmCallsign} onDismiss={() => setPromptOpen(false)} />
      ) : null}
      {!callsign && !promptOpen ? (
        <button type="button" className="overlay-panel set-callsign" onClick={() => setPromptOpen(true)}>
          Set Callsign
        </button>
      ) : null}
      {status || version?.error ? (
        <p className="status-message overlay-panel" role="status" aria-live="polite">
          {[status, version?.error].filter(Boolean).join(' ')}
        </p>
      ) : null}
      <p className="version-hash" aria-label="Frontend version hash">
        {version?.frontend ?? 'dev'}
      </p>
    </main>
  )
}

export default App
