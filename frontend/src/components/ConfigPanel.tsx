// SPDX-License-Identifier: AGPL-3.0-only
import { useState } from 'react'
import {
  BAND_OPTIONS,
  MIXED_SELECTION,
  MODE_OPTIONS,
  type BandId,
  type ModeId,
  type Selection,
  type UserConfig,
  isValidMaidenhead,
  normalizeBandSelection,
  normalizeMaidenhead,
  normalizeModeSelection,
  normalizeOptionalCallsign,
  normalizeRequestWindow,
  normalizeTimeZone,
  validateOptionalCallsign,
  isValidTimeZone,
  type RequestWindowUnit,
} from '../services/userConfig'

type ConfigPanelProps = {
  value: UserConfig
  firstRun?: boolean
  onSave: (config: UserConfig) => void
  onClose: () => void
}

function selectionToInput<T extends string>(selection: Selection<T>) {
  return selection.kind === 'mixed' ? [MIXED_SELECTION] : selection.values
}

function toggleSelection(values: string[], value: string) {
  if (value === MIXED_SELECTION) return [MIXED_SELECTION]
  const withoutMixed = values.filter((item) => item !== MIXED_SELECTION)
  return withoutMixed.includes(value) ? withoutMixed.filter((item) => item !== value) : [...withoutMixed, value]
}

type OptionGroupProps<T extends string> = {
  legend: string
  name: string
  options: readonly { id: T; label: string }[]
  values: string[]
  onChange: (values: string[]) => void
}

function OptionGroup<T extends string>({ legend, name, options, values, onChange }: OptionGroupProps<T>) {
  return (
    <fieldset className="config-option-group">
      <legend>{legend}</legend>
      <label className="config-check">
        <input
          type="checkbox"
          checked={values.includes(MIXED_SELECTION)}
          onChange={() => onChange(toggleSelection(values, MIXED_SELECTION))}
        />
        <span>Mixed</span>
      </label>
      <div className="config-option-grid" role="group" aria-label={`${legend} options`}>
        {options.map((option) => (
          <label className="config-check" key={option.id}>
            <input
              type="checkbox"
              name={name}
              value={option.id}
              checked={values.includes(option.id)}
              onChange={() => onChange(toggleSelection(values, option.id))}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function ConfigPanel({ value, firstRun = false, onSave, onClose }: ConfigPanelProps) {
  const [callsign, setCallsign] = useState(value.callsign)
  const [locationGrid, setLocationGrid] = useState(value.locationGrid)
  const [timeZone, setTimeZone] = useState(value.timeZone)
  const [requestWindowAmount, setRequestWindowAmount] = useState(String(value.requestWindow.amount))
  const [requestWindowUnit, setRequestWindowUnit] = useState<RequestWindowUnit>(value.requestWindow.unit)
  const [showSpots, setShowSpots] = useState(value.activityVisibility.showSpots)
  const [showHeard, setShowHeard] = useState(value.activityVisibility.showHeard)
  const [bandValues, setBandValues] = useState<string[]>(() => selectionToInput(value.bandSelection))
  const [modeValues, setModeValues] = useState<string[]>(() => selectionToInput(value.modeSelection))
  const normalizedGrid = normalizeMaidenhead(locationGrid)
  const callsignValid = validateOptionalCallsign(callsign)
  const gridValid = isValidMaidenhead(locationGrid)
  const timeZoneValid = isValidTimeZone(timeZone)
  const requestWindowAmountNumber = Number(requestWindowAmount)
  const requestWindowValid = Number.isInteger(requestWindowAmountNumber) && requestWindowAmountNumber >= 1
  const canSave = callsignValid && gridValid && timeZoneValid && requestWindowValid

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSave) return
    onSave({
      callsign: normalizeOptionalCallsign(callsign),
      locationGrid: normalizedGrid,
      timeZone: normalizeTimeZone(timeZone),
      requestWindow: normalizeRequestWindow({ amount: requestWindowAmountNumber, unit: requestWindowUnit }),
      activityVisibility: { showSpots, showHeard },
      bandSelection: normalizeBandSelection(bandValues),
      modeSelection: normalizeModeSelection(modeValues),
    })
  }

  return (
    <div className="overlay-panel config-panel" role="dialog" aria-label="Map configuration">
      <form onSubmit={submit}>
        <div className="config-panel-header">
          <div>
            <p className="eyebrow">{firstRun ? 'First run setup' : 'Map preferences'}</p>
            <h2>Configuration</h2>
          </div>
          <button type="button" className="base-map-dismiss" onClick={onClose}>Dismiss</button>
        </div>

        <label className="config-field" htmlFor="config-callsign">
          <span>Callsign optional</span>
          <input
            id="config-callsign"
            value={callsign}
            onChange={(event) => setCallsign(event.target.value)}
            autoComplete="off"
            autoFocus
          />
        </label>
        {!callsignValid ? <p className="field-error">Enter a valid callsign using 3-12 letters, numbers, or /, or leave it empty.</p> : null}

        <label className="config-field" htmlFor="config-grid">
          <span>Maidenhead grid optional</span>
          <input
            id="config-grid"
            value={locationGrid}
            onChange={(event) => setLocationGrid(event.target.value)}
            placeholder="QF56 or QF56OD"
            autoComplete="off"
          />
        </label>
        {!gridValid ? <p className="field-error">Use empty, 4-character Maidenhead grid, or 6-character Maidenhead grid such as QF56 or QF56OD.</p> : null}

        <label className="config-field" htmlFor="config-time-zone">
          <span>Time zone</span>
          <input
            id="config-time-zone"
            value={timeZone}
            onChange={(event) => setTimeZone(event.target.value)}
            placeholder="Australia/Sydney"
            autoComplete="off"
          />
        </label>
        {!timeZoneValid ? <p className="field-error">Enter a valid IANA time zone such as Australia/Sydney or UTC.</p> : null}

        <fieldset className="config-option-group config-window-group">
          <legend>WSPR request window</legend>
          <div className="config-window-controls">
            <label className="config-field" htmlFor="config-window-amount">
              <span>Last</span>
              <input
                id="config-window-amount"
                type="number"
                min="1"
                step="1"
                value={requestWindowAmount}
                onChange={(event) => setRequestWindowAmount(event.target.value)}
              />
            </label>
            <label className="config-field" htmlFor="config-window-unit">
              <span>Unit</span>
              <select
                id="config-window-unit"
                value={requestWindowUnit}
                onChange={(event) => setRequestWindowUnit(event.target.value as RequestWindowUnit)}
              >
                <option value="hours">hours</option>
                <option value="days">days</option>
              </select>
            </label>
          </div>
          {!requestWindowValid ? <p className="field-error">Enter at least 1 hour or day.</p> : null}
        </fieldset>

        <fieldset className="config-option-group">
          <legend>WSPR activity</legend>
          <label className="config-check">
            <input
              type="checkbox"
              checked={showSpots}
              onChange={(event) => setShowSpots(event.target.checked)}
            />
            <span>Show spots</span>
          </label>
          <label className="config-check">
            <input
              type="checkbox"
              checked={showHeard}
              onChange={(event) => setShowHeard(event.target.checked)}
            />
            <span>Show heard</span>
          </label>
        </fieldset>

        <OptionGroup<BandId> legend="Bands" name="config-bands" options={BAND_OPTIONS} values={bandValues} onChange={setBandValues} />
        <OptionGroup<ModeId> legend="Modes" name="config-modes" options={MODE_OPTIONS} values={modeValues} onChange={setModeValues} />

        <div className="button-row">
          <button type="submit" disabled={!canSave}>Save configuration</button>
        </div>
      </form>
    </div>
  )
}
