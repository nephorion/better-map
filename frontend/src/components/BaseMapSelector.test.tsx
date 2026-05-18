// SPDX-License-Identifier: AGPL-3.0-only
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BaseMapSelector } from './BaseMapSelector'

test('renders required layers and changes active base map', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  const onToggle = vi.fn()
  render(<BaseMapSelector activeLayerId="osm-standard" onChange={onChange} open onToggle={onToggle} />)

  await user.click(screen.getByRole('button', { name: /opentopomap/i }))
  expect(onChange).toHaveBeenCalledWith('opentopomap')
  expect(onToggle).toHaveBeenCalled()
  expect(screen.queryByLabelText(/map attribution/i)).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: /carto positron/i })).toBeInTheDocument()
})

test('dismisses base map choices explicitly and on outside click', async () => {
  const user = userEvent.setup()
  const onToggle = vi.fn()
  render(
    <div>
      <button type="button">Outside</button>
      <BaseMapSelector activeLayerId="osm-standard" onChange={vi.fn()} open onToggle={onToggle} />
    </div>,
  )

  await user.click(screen.getByRole('button', { name: /dismiss/i }))
  expect(onToggle).toHaveBeenCalledTimes(1)

  await user.click(screen.getByRole('button', { name: /outside/i }))
  expect(onToggle).toHaveBeenCalledTimes(2)
})

test('keeps base map choices closed behind the icon', async () => {
  const user = userEvent.setup()
  const onToggle = vi.fn()
  render(<BaseMapSelector activeLayerId="carto-dark-matter" onChange={vi.fn()} open={false} onToggle={onToggle} />)

  expect(screen.queryByRole('dialog', { name: /base map choices/i })).not.toBeInTheDocument()
  expect(screen.queryByLabelText(/map attribution/i)).not.toBeInTheDocument()
  expect(screen.getByRole('tooltip', { name: /base map/i })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /choose base map/i }))
  expect(onToggle).toHaveBeenCalled()
})
