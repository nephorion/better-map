import { API_BASE_URL } from './config'

test('uses a local backend URL by default', () => {
  expect(API_BASE_URL).toBe('')
})
