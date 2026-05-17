import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CallsignPrompt } from './CallsignPrompt'

test('validates and confirms callsign prompt input', async () => {
  const user = userEvent.setup()
  const onConfirm = vi.fn()
  render(<CallsignPrompt onConfirm={onConfirm} onDismiss={vi.fn()} />)

  await user.type(screen.getByRole('textbox', { name: /callsign/i }), '?')
  await user.click(screen.getByRole('button', { name: /set callsign/i }))
  expect(screen.getByText(/enter a valid callsign/i)).toBeInTheDocument()

  await user.clear(screen.getByRole('textbox', { name: /callsign/i }))
  await user.type(screen.getByRole('textbox', { name: /callsign/i }), 'vk2djj')
  await user.click(screen.getByRole('button', { name: /set callsign/i }))
  expect(onConfirm).toHaveBeenCalledWith('VK2DJJ')
})

test('dismisses callsign prompt', async () => {
  const user = userEvent.setup()
  const onDismiss = vi.fn()
  render(<CallsignPrompt initialValue="VK2DJJ" onConfirm={vi.fn()} onDismiss={onDismiss} />)

  await user.click(screen.getByRole('button', { name: /dismiss/i }))
  expect(onDismiss).toHaveBeenCalled()
})
