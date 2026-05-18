// SPDX-License-Identifier: AGPL-3.0-only
import { KO_FI_EMBED_URL, KO_FI_PAGE_URL, NEPHORION_URL, SOURCE_REPOSITORY_URL, SUPPORT_LINK_LABELS } from './supportLinks'

test('defines canonical support destinations and labels', () => {
  expect(KO_FI_PAGE_URL).toBe('https://ko-fi.com/museofnephorion')
  expect(KO_FI_EMBED_URL).toBe('https://ko-fi.com/museofnephorion/?hidefeed=true&widget=true&embed=true')
  expect(NEPHORION_URL).toBe('https://nephorion.com')
  expect(SOURCE_REPOSITORY_URL).toBe('https://github.com/nephorion/better-map')
  expect(SUPPORT_LINK_LABELS.donation).toMatch(/ko-fi/i)
  expect(SUPPORT_LINK_LABELS.nephorion).toMatch(/nephorion/i)
  expect(SUPPORT_LINK_LABELS.source).toMatch(/source code/i)
})
