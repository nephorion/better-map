export type ApiErrorCode =
  | 'invalid_request'
  | 'provider_rate_limited'
  | 'provider_unavailable'
  | 'provider_invalid_data'
  | 'provider_timeout'
  | 'unknown_error'

export class ApiClientError extends Error {
  readonly code: ApiErrorCode
  readonly status: number

  constructor(code: ApiErrorCode, status: number, message: string) {
    super(message)
    this.name = 'ApiClientError'
    this.code = code
    this.status = status
  }
}
