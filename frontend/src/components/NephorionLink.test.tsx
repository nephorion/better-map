// SPDX-License-Identifier: AGPL-3.0-only
import { render, screen } from '@testing-library/react'
import { NephorionLink } from './NephorionLink'
import { NEPHORION_URL } from '../services/supportLinks'

test('renders subtle external Nephorion link with safe new-tab attributes', () => {
  render(<NephorionLink />)

  const link = screen.getByRole('link', { name: /visit nephorion main site/i })
  expect(screen.getByText(/built by/i)).toBeInTheDocument()
  expect(link).toHaveAttribute('href', NEPHORION_URL)
  expect(link).toHaveAttribute('target', '_blank')
  expect(link).toHaveAttribute('rel', 'noreferrer')
})
