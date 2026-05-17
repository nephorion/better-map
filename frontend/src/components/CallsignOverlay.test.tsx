import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CallsignOverlay } from './CallsignOverlay'

test('shows active callsign and reopens editing', async () => {
  const user = userEvent.setup()
  const onEdit = vi.fn()
  render(<CallsignOverlay callsign="VK2DJJ" onEdit={onEdit} />)

  await user.click(screen.getByRole('button', { name: /active callsign/i }))
  expect(onEdit).toHaveBeenCalled()
})

test('shows set callsign state when inactive', () => {
  render(<CallsignOverlay callsign={null} onEdit={vi.fn()} />)

  expect(screen.getByRole('button', { name: /set callsign/i })).toBeInTheDocument()
})
