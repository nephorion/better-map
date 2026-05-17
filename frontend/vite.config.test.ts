import { resolveAppVersion, shortHash } from './version'

test('shortens version values to twelve characters', () => {
  expect(shortHash('abcdef1234567890')).toBe('abcdef123456')
})

test('resolves explicit and Railway version metadata before git', () => {
  const exec = vi.fn(() => 'gitsha')

  expect(resolveAppVersion({ BETTER_MAP_VERSION: 'explicit123456789' }, exec)).toBe('explicit1234')
  expect(resolveAppVersion({ RAILWAY_GIT_COMMIT_SHA: 'railwayabcdef123' }, exec)).toBe('railwayabcde')
  expect(resolveAppVersion({ RAILWAY_GIT_COMMIT: 'legacyrailway123' }, exec)).toBe('legacyrailwa')
  expect(exec).not.toHaveBeenCalled()
})

test('falls back to git and then dev', () => {
  expect(resolveAppVersion({}, vi.fn(() => 'gitabcdef\n'))).toBe('gitabcdef')
  expect(resolveAppVersion({}, vi.fn(() => { throw new Error('missing git') }))).toBe('dev')
})
