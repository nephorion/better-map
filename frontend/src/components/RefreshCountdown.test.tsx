import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RefreshCountdown } from './RefreshCountdown'

test('shows subtle progress bar and triggers manual refresh', async () => {
  const user = userEvent.setup()
  const onRefresh = vi.fn()
  render(<RefreshCountdown remainingSeconds={125} refreshing={false} onRefresh={onRefresh} />)

  expect(screen.getByRole('tooltip')).toHaveTextContent('Refresh in 2:05')
  expect(screen.getByRole('button', { name: /refresh wspr activity/i })).not.toHaveAttribute('title')
  await user.click(screen.getByRole('button', { name: /refresh wspr activity/i }))
  expect(onRefresh).toHaveBeenCalled()
})

test('drains the countdown bar as refresh approaches', () => {
  const { rerender } = render(<RefreshCountdown remainingSeconds={300} refreshing={false} onRefresh={vi.fn()} />)
  const progress = screen.getByRole('button', { name: /refresh wspr activity/i }).firstElementChild

  expect(progress).toHaveStyle({ '--refresh-progress': '1' })
  rerender(<RefreshCountdown remainingSeconds={150} refreshing={false} onRefresh={vi.fn()} />)
  expect(progress).toHaveStyle({ '--refresh-progress': '0.5' })
})

test('pulses during the final thirty seconds before refresh', () => {
  const { rerender } = render(<RefreshCountdown remainingSeconds={31} refreshing={false} onRefresh={vi.fn()} />)

  expect(screen.getByRole('button', { name: /refresh wspr activity/i })).not.toHaveClass('near-refresh')
  rerender(<RefreshCountdown remainingSeconds={30} refreshing={false} onRefresh={vi.fn()} />)
  expect(screen.getByRole('button', { name: /refresh wspr activity/i })).toHaveClass('near-refresh')
  rerender(<RefreshCountdown remainingSeconds={0} refreshing onRefresh={vi.fn()} />)
  expect(screen.getByRole('button', { name: /refresh wspr activity/i })).not.toHaveClass('near-refresh')
})

test('shows refreshing state while remaining clickable', async () => {
  const user = userEvent.setup()
  const onRefresh = vi.fn()
  const { rerender } = render(<RefreshCountdown remainingSeconds={0} refreshing onRefresh={vi.fn()} />)

  expect(screen.getByRole('tooltip')).toHaveTextContent('Refreshing WSPR activity')
  rerender(<RefreshCountdown remainingSeconds={0} refreshing onRefresh={onRefresh} />)
  await user.click(screen.getByRole('button', { name: /refresh wspr activity/i }))
  expect(onRefresh).toHaveBeenCalled()
})
