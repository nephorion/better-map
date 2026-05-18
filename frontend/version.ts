// SPDX-License-Identifier: AGPL-3.0-only
import { execSync } from 'node:child_process'

const VERSION_ENV_KEYS = ['BETTER_MAP_VERSION', 'RAILWAY_GIT_COMMIT_SHA', 'RAILWAY_GIT_COMMIT'] as const

export function shortHash(value: string) {
  return value.trim().slice(0, 12)
}

export function resolveAppVersion(env: NodeJS.ProcessEnv = process.env, exec = execSync) {
  for (const key of VERSION_ENV_KEYS) {
    const value = env[key]
    if (value) return shortHash(value)
  }

  try {
    return shortHash(exec('git rev-parse --short HEAD', { encoding: 'utf8' }).toString())
  } catch {
    return 'dev'
  }
}
