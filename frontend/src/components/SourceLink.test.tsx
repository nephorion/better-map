// SPDX-License-Identifier: AGPL-3.0-only
// SPDX-License-Identifier: AGPL-3.0-only

import { render, screen } from '@testing-library/react'
import { SOURCE_REPOSITORY_URL, SUPPORT_LINK_LABELS } from '../services/supportLinks'
import { SourceLink } from './SourceLink'

test('renders safe source repository link for AGPL users', () => {
  render(<SourceLink />)

  const link = screen.getByRole('link', { name: SUPPORT_LINK_LABELS.source })
  expect(link).toHaveTextContent('Source')
  expect(link).toHaveAttribute('href', SOURCE_REPOSITORY_URL)
  expect(link).toHaveAttribute('target', '_blank')
  expect(link).toHaveAttribute('rel', 'noreferrer')
})
