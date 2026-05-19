// SPDX-License-Identifier: AGPL-3.0-only
import './App.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiClientError } from './services/apiClient'
import { fetchWsprActivity, type ActivityLookupResult } from './services/wsprActivity'
import { WsprMap } from './components/WsprMap'
import { CallsignOverlay } from './components/CallsignOverlay'
import { BaseMapSelector } from './components/BaseMapSelector'
import { DonationPane } from './components/DonationPane'
import { NephorionLink } from './components/NephorionLink'
import { RefreshCountdown } from './components/RefreshCountdown'
import { clearCallsign, readStoredCallsign, saveCallsign } from './services/callsign'
import { readUserConfig, saveUserConfig, type UserConfig } from './services/userConfig'
import { nextRefreshAt, remainingRefreshSeconds } from './services/refreshState'
import { readStoredBaseMapLayer, saveBaseMapLayer, type BaseMapLayer } from './services/baseMapLayers'
import { loadVersionMetadata, type VersionMetadata } from './services/versionMetadata'
import { SOURCE_REPOSITORY_URL, SUPPORT_LINK_LABELS } from './services/supportLinks'

const INITIAL_STATUS = ''

function App() {
  const [initialStorage] = useState(() => {
    const callsignStorage = readStoredCallsign()
    const configStorage = readUserConfig(callsignStorage.callsign ?? '')
    return {
      callsign: configStorage.config.callsign,
      config: configStorage.config,
      warning: [callsignStorage.warning, configStorage.warning].filter(Boolean).join(' '),
    }
  })
  const [result, setResult] = useState<ActivityLookupResult | null>(null)
  const [status, setStatus] = useState(initialStorage.warning ?? INITIAL_STATUS)
  const [callsign, setCallsign] = useState<string | null>(initialStorage.callsign)
  const [userConfig, setUserConfig] = useState<UserConfig>(initialStorage.config)
  const [configOpen, setConfigOpen] = useState(!initialStorage.callsign)
  const [loading, setLoading] = useState(false)
  const [nextRefresh, setNextRefresh] = useState(nextRefreshAt())
  const [remainingSeconds, setRemainingSeconds] = useState(remainingRefreshSeconds(nextRefresh))
  const [baseLayerId, setBaseLayerId] = useState<BaseMapLayer['id']>(readStoredBaseMapLayer)
  const [baseMapOpen, setBaseMapOpen] = useState(false)
  const [version, setVersion] = useState<VersionMetadata | null>(null)
  const [donationOpen, setDonationOpen] = useState(false)
  const [donationFailed, setDonationFailed] = useState(false)
  const activeRequest = useRef<string | null>(null)

  const loadActivity = useCallback(async (activeCallsign: string | null, config: UserConfig) => {
    const requestKey = `${activeCallsign || '__general__'}:${config.requestWindow.amount}:${config.requestWindow.unit}`
    /* v8 ignore next -- Refresh controls are disabled while a matching request is active. */
    if (activeRequest.current === requestKey) return
    activeRequest.current = requestKey
    setLoading(true)
    setStatus(activeCallsign ? `Loading WSPR activity for ${activeCallsign}...` : 'Loading general WSPR activity...')
    try {
      const lookup = await fetchWsprActivity(activeCallsign, config.requestWindow)
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
  }, [])

  function saveConfiguration(config: UserConfig) {
    const savedConfig = saveUserConfig(config)
    const nextCallsign = savedConfig.config.callsign || null
    const callsignWarning = nextCallsign ? saveCallsign(nextCallsign).warning : clearCallsign()
    setUserConfig(savedConfig.config)
    setCallsign(nextCallsign)
    setConfigOpen(false)
    setResult(null)
    setNextRefresh(nextRefreshAt())
    setStatus([savedConfig.warning, callsignWarning].filter(Boolean).join(' '))
    void loadActivity(nextCallsign, savedConfig.config)
  }

  function changeBaseMap(id: BaseMapLayer['id']) {
    setBaseLayerId(id)
    saveBaseMapLayer(id)
  }

  function toggleBaseMap() {
    setDonationOpen(false)
    setBaseMapOpen((open) => !open)
  }

  function openDonation() {
    setBaseMapOpen(false)
    setDonationOpen(true)
  }

  useEffect(() => {
    const startupCallsign = initialStorage.callsign || null
    window.setTimeout(() => void loadActivity(startupCallsign, initialStorage.config), 0)
    void loadVersionMetadata().then(setVersion)
  }, [initialStorage.callsign, initialStorage.config, loadActivity])

  useEffect(() => {
    const timer = window.setInterval(() => {
      const remaining = remainingRefreshSeconds(nextRefresh)
      setRemainingSeconds(remaining)
      if (remaining === 0 && callsign && !loading) void loadActivity(callsign, userConfig)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [callsign, loadActivity, loading, nextRefresh, userConfig])

  return (
    <main className="app-shell" aria-label="WSPR activity map">
      <WsprMap
        features={result?.features ?? []}
        truncated={result?.truncated ?? false}
        baseLayerId={baseLayerId}
        activeCallsign={callsign}
        userConfig={userConfig}
        configOpen={configOpen}
        firstRunConfig={!initialStorage.callsign}
        onOpenConfig={() => setConfigOpen(true)}
        onCloseConfig={() => setConfigOpen(false)}
        onSaveConfig={saveConfiguration}
      />
      <div className="overlay-stack top-left">
        {callsign ? (
          <RefreshCountdown
            remainingSeconds={remainingSeconds}
            refreshing={loading}
            onRefresh={() => callsign && void loadActivity(callsign, userConfig)}
          />
        ) : null}
        <CallsignOverlay callsign={callsign} onEdit={() => setConfigOpen(true)} />
      </div>
      <BaseMapSelector
        activeLayerId={baseLayerId}
        open={baseMapOpen}
        onChange={changeBaseMap}
        onToggle={toggleBaseMap}
      />
      <div className="donation-controls" aria-label="Project donation link">
        <DonationPane
          open={donationOpen}
          failed={donationFailed}
          onOpen={openDonation}
          onDismiss={() => setDonationOpen(false)}
          /* v8 ignore next -- iframe error events are not reliable in jsdom. */
          onLoadError={() => setDonationFailed(true)}
        />
      </div>
      <NephorionLink />
      {status || version?.error ? (
        <p className="status-message overlay-panel" role="status" aria-live="polite" key={[status, version?.error].filter(Boolean).join(' ')}>
          {[status, version?.error].filter(Boolean).join(' ')}
        </p>
      ) : null}
      <a className="version-hash" href={SOURCE_REPOSITORY_URL} target="_blank" rel="noreferrer" aria-label={`${SUPPORT_LINK_LABELS.source}; frontend version hash ${version?.frontend ?? 'dev'}`}>
        {version?.frontend ?? 'dev'}
      </a>
    </main>
  )
}

export default App
