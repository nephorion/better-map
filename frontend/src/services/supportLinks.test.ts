import { KO_FI_EMBED_URL, KO_FI_PAGE_URL, NEPHORION_URL, SUPPORT_LINK_LABELS } from './supportLinks'

test('defines canonical support destinations and labels', () => {
  expect(KO_FI_PAGE_URL).toBe('https://ko-fi.com/museofnephorion')
  expect(KO_FI_EMBED_URL).toBe('https://ko-fi.com/museofnephorion/?hidefeed=true&widget=true&embed=true')
  expect(NEPHORION_URL).toBe('https://nephorion.com')
  expect(SUPPORT_LINK_LABELS.donation).toMatch(/ko-fi/i)
  expect(SUPPORT_LINK_LABELS.nephorion).toMatch(/nephorion/i)
})
