import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DonationPane } from './DonationPane'
import { KO_FI_EMBED_URL, KO_FI_PAGE_URL } from '../services/supportLinks'

test('opens with a custom subtle button and renders Ko-fi pane content', async () => {
  const user = userEvent.setup()
  const onOpen = vi.fn()
  render(<DonationPane open={false} failed={false} onOpen={onOpen} onDismiss={vi.fn()} onLoadError={vi.fn()} />)

  await user.click(screen.getByRole('button', { name: /donate/i }))

  expect(onOpen).toHaveBeenCalled()
  expect(screen.getByRole('tooltip', { name: /donate/i })).toBeInTheDocument()
  expect(screen.queryByLabelText(/support better map on ko-fi/i)).not.toBeInTheDocument()
})

test('dismisses the in-page pane without using modal semantics', async () => {
  const user = userEvent.setup()
  const onDismiss = vi.fn()
  render(<DonationPane open failed={false} onOpen={vi.fn()} onDismiss={onDismiss} onLoadError={vi.fn()} />)

  expect(screen.getByLabelText(/support better map on ko-fi/i)).toBeInTheDocument()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByTitle(/ko-fi donation pane/i)).toHaveAttribute('src', KO_FI_EMBED_URL)
  await user.click(screen.getByRole('button', { name: /dismiss/i }))

  expect(onDismiss).toHaveBeenCalled()
})

test('shows non-blocking fallback when Ko-fi cannot load', () => {
  render(<DonationPane open failed onOpen={vi.fn()} onDismiss={vi.fn()} onLoadError={vi.fn()} />)

  expect(screen.getByText(/could not load/i)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /open ko-fi/i })).toHaveAttribute('href', KO_FI_PAGE_URL)
})

test('dismisses the pane on outside clicks', async () => {
  const user = userEvent.setup()
  const onDismiss = vi.fn()
  render(
    <div>
      <button type="button">Map canvas</button>
      <DonationPane open failed={false} onOpen={vi.fn()} onDismiss={onDismiss} onLoadError={vi.fn()} />
    </div>,
  )

  await user.click(screen.getByRole('button', { name: /map canvas/i }))

  expect(onDismiss).toHaveBeenCalled()
})
