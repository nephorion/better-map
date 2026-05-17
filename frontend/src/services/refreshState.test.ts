import { formatRemainingTime, nextRefreshAt, remainingRefreshSeconds } from './refreshState'

test('computes and formats refresh countdown state', () => {
  expect(nextRefreshAt(1_000, 10)).toBe(11_000)
  expect(remainingRefreshSeconds(11_000, 1_001)).toBe(10)
  expect(remainingRefreshSeconds(11_000, 11_500)).toBe(0)
  expect(formatRemainingTime(300)).toBe('5:00')
  expect(formatRemainingTime(9)).toBe('0:09')
})
