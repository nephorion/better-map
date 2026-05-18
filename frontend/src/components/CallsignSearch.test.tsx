// SPDX-License-Identifier: AGPL-3.0-only
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CallsignSearch } from './CallsignSearch'
import { isValidCallsign, normalizeCallsign } from '../services/callsign'

test('normalizes and validates callsigns', () => {
  expect(normalizeCallsign(' vk2djj ')).toBe('VK2DJJ')
  expect(isValidCallsign('VK2DJJ')).toBe(true)
  expect(isValidCallsign('VK')).toBe(false)
})

test('submits a valid callsign with keyboard operation', async () => {
  const user = userEvent.setup()
  const onSearch = vi.fn()
  render(<CallsignSearch onSearch={onSearch} />)

  await user.type(screen.getByRole('textbox', { name: /^callsign$/i }), 'vk2djj{Enter}')

  expect(onSearch).toHaveBeenCalledWith('VK2DJJ')
})

test('shows accessible validation messaging for invalid input', async () => {
  const user = userEvent.setup()
  render(<CallsignSearch onSearch={vi.fn()} />)

  await user.type(screen.getByRole('textbox', { name: /^callsign$/i }), 'no{Enter}')

  expect(screen.getByRole('alert')).toHaveTextContent('Use 3-12 letters, numbers, or /.')
})
