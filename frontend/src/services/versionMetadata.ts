// SPDX-License-Identifier: AGPL-3.0-only
declare const __APP_VERSION__: string | undefined

export type VersionMetadata = {
  frontend: string
  backend: string | null
  mismatch: boolean
  error: string | null
}

export function frontendVersion() {
  return typeof __APP_VERSION__ === 'string' && __APP_VERSION__.length > 0 ? __APP_VERSION__ : 'dev'
}

export async function loadVersionMetadata(): Promise<VersionMetadata> {
  const frontend = frontendVersion()
  try {
    const response = await fetch('/api/version')
    if (!response.ok) throw new Error('Version endpoint unavailable')
    const payload = (await response.json()) as { short_hash?: string }
    const backend = payload.short_hash || null
    return {
      frontend,
      backend,
      mismatch: Boolean(backend && backend !== frontend),
      error: backend && backend !== frontend ? 'Frontend and backend versions do not match.' : null,
    }
  } catch {
    return { frontend, backend: null, mismatch: false, error: null }
  }
}
