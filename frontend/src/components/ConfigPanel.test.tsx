// SPDX-License-Identifier: AGPL-3.0-only
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigPanel } from './ConfigPanel'
import { defaultUserConfig } from '../services/userConfig'

test('renders accessible configuration dialog and saves optional callsign', async () => {
  const user = userEvent.setup()
  const onSave = vi.fn()
  render(<ConfigPanel value={defaultUserConfig()} firstRun onSave={onSave} onClose={vi.fn()} />)

  expect(screen.getByRole('dialog', { name: /map configuration/i })).toBeInTheDocument()
  await user.type(screen.getByRole('textbox', { name: /callsign/i }), 'vk2djj')
  await user.click(screen.getByRole('button', { name: /save configuration/i }))

  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ callsign: 'VK2DJJ' }))
})

test('allows empty callsign and validates invalid callsigns', async () => {
  const user = userEvent.setup()
  const onSave = vi.fn()
  render(<ConfigPanel value={defaultUserConfig()} onSave={onSave} onClose={vi.fn()} />)

  await user.type(screen.getByRole('textbox', { name: /callsign/i }), '?')
  expect(screen.getByText(/enter a valid callsign/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /save configuration/i })).toBeDisabled()
  await user.clear(screen.getByRole('textbox', { name: /callsign/i }))
  await user.click(screen.getByRole('button', { name: /save configuration/i }))
  expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ callsign: '' }))
})

test('validates empty, 4-character, 6-character, and invalid Maidenhead grid values', async () => {
  const user = userEvent.setup()
  const onSave = vi.fn()
  render(<ConfigPanel value={defaultUserConfig()} onSave={onSave} onClose={vi.fn()} />)
  const grid = screen.getByRole('textbox', { name: /maidenhead grid/i })

  await user.type(grid, 'qf56')
  await user.click(screen.getByRole('button', { name: /save configuration/i }))
  expect(onSave).toHaveBeenLastCalledWith(expect.objectContaining({ locationGrid: 'QF56' }))

  await user.clear(grid)
  await user.type(grid, 'QF56OD')
  await user.click(screen.getByRole('button', { name: /save configuration/i }))
  expect(onSave).toHaveBeenLastCalledWith(expect.objectContaining({ locationGrid: 'QF56OD' }))

  await user.clear(grid)
  await user.type(grid, 'bad')
  expect(screen.getByText(/4-character Maidenhead grid/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /save configuration/i })).toBeDisabled()
})

test('supports Mixed-exclusive band and mode multi-select', async () => {
  const user = userEvent.setup()
  const onSave = vi.fn()
  render(<ConfigPanel value={defaultUserConfig()} onSave={onSave} onClose={vi.fn()} />)

  await user.click(screen.getByRole('checkbox', { name: '20 m' }))
  await user.click(screen.getByRole('checkbox', { name: '40 m' }))
  await user.click(screen.getByRole('checkbox', { name: 'WSPR' }))
  await user.click(screen.getByRole('checkbox', { name: 'FT8' }))
  await user.click(screen.getByRole('button', { name: /save configuration/i }))

  expect(onSave).toHaveBeenLastCalledWith(expect.objectContaining({
    bandSelection: { kind: 'specific', values: ['20m', '40m'] },
    modeSelection: { kind: 'specific', values: ['wspr', 'ft8'] },
  }))

  await user.click(screen.getAllByRole('checkbox', { name: 'Mixed' })[0])
  await user.click(screen.getAllByRole('checkbox', { name: 'Mixed' })[1])
  await user.click(screen.getByRole('button', { name: /save configuration/i }))
  expect(onSave).toHaveBeenLastCalledWith(expect.objectContaining({
    bandSelection: { kind: 'mixed', values: [] },
    modeSelection: { kind: 'mixed', values: [] },
  }))
})

test('saves WSPR request window in hours or days', async () => {
  const user = userEvent.setup()
  const onSave = vi.fn()
  render(<ConfigPanel value={defaultUserConfig()} onSave={onSave} onClose={vi.fn()} />)

  await user.clear(screen.getByLabelText(/last/i))
  await user.type(screen.getByLabelText(/last/i), '6')
  await user.selectOptions(screen.getByLabelText(/unit/i), 'hours')
  await user.click(screen.getByRole('button', { name: /save configuration/i }))

  expect(onSave).toHaveBeenLastCalledWith(expect.objectContaining({
    requestWindow: { amount: 6, unit: 'hours' },
  }))
})

test('saves and validates timezone override', async () => {
  const user = userEvent.setup()
  const onSave = vi.fn()
  render(<ConfigPanel value={defaultUserConfig()} onSave={onSave} onClose={vi.fn()} />)

  await user.clear(screen.getByRole('textbox', { name: /time zone/i }))
  await user.type(screen.getByRole('textbox', { name: /time zone/i }), 'Australia/Sydney')
  await user.click(screen.getByRole('button', { name: /save configuration/i }))
  expect(onSave).toHaveBeenLastCalledWith(expect.objectContaining({ timeZone: 'Australia/Sydney' }))

  await user.clear(screen.getByRole('textbox', { name: /time zone/i }))
  await user.type(screen.getByRole('textbox', { name: /time zone/i }), 'bad/timezone')
  expect(screen.getByText(/valid IANA time zone/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /save configuration/i })).toBeDisabled()
})

test('saves spot and heard visibility toggles', async () => {
  const user = userEvent.setup()
  const onSave = vi.fn()
  render(<ConfigPanel value={defaultUserConfig()} onSave={onSave} onClose={vi.fn()} />)

  expect(screen.getByRole('checkbox', { name: /show spots/i })).toBeChecked()
  expect(screen.getByRole('checkbox', { name: /show heard/i })).toBeChecked()
  await user.click(screen.getByRole('checkbox', { name: /show spots/i }))
  await user.click(screen.getByRole('checkbox', { name: /show heard/i }))
  await user.click(screen.getByRole('checkbox', { name: /show heard/i }))
  await user.click(screen.getByRole('button', { name: /save configuration/i }))

  expect(onSave).toHaveBeenLastCalledWith(expect.objectContaining({
    activityVisibility: { showSpots: false, showHeard: true },
  }))
})

test('requires a positive WSPR request window', async () => {
  const user = userEvent.setup()
  render(<ConfigPanel value={defaultUserConfig()} onSave={vi.fn()} onClose={vi.fn()} />)

  await user.clear(screen.getByLabelText(/last/i))
  await user.type(screen.getByLabelText(/last/i), '0')

  expect(screen.getByText(/at least 1 hour or day/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /save configuration/i })).toBeDisabled()
})

test('restores specific selections and can clear them back to Mixed', async () => {
  const user = userEvent.setup()
  const onSave = vi.fn()
  render(<ConfigPanel value={{
    ...defaultUserConfig(),
    bandSelection: { kind: 'specific', values: ['20m'] },
    modeSelection: { kind: 'specific', values: ['wspr'] },
  }} onSave={onSave} onClose={vi.fn()} />)

  expect(screen.getByRole('checkbox', { name: '20 m' })).toBeChecked()
  expect(screen.getByRole('checkbox', { name: 'WSPR' })).toBeChecked()
  await user.click(screen.getByRole('checkbox', { name: '20 m' }))
  await user.click(screen.getByRole('button', { name: /save configuration/i }))

  expect(onSave).toHaveBeenLastCalledWith(expect.objectContaining({
    bandSelection: { kind: 'mixed', values: [] },
  }))
})

test('does not save when an invalid form is submitted programmatically', () => {
  const onSave = vi.fn()
  render(<ConfigPanel value={defaultUserConfig()} onSave={onSave} onClose={vi.fn()} />)

  fireEvent.change(screen.getByRole('textbox', { name: /callsign/i }), { target: { value: '?' } })
  fireEvent.submit(screen.getByRole('button', { name: /save configuration/i }).closest('form')!)

  expect(onSave).not.toHaveBeenCalled()
})

test('dismisses configuration panel', async () => {
  const user = userEvent.setup()
  const onClose = vi.fn()
  render(<ConfigPanel value={defaultUserConfig()} onSave={vi.fn()} onClose={onClose} />)

  await user.click(screen.getByRole('button', { name: /dismiss/i }))
  expect(onClose).toHaveBeenCalled()
})
