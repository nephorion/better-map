import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'

function shortGitHash() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
  } catch {
    return 'dev'
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(shortGitHash()),
  },
  server: {
    host: '127.0.0.1',
    port: 5212,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8112',
        changeOrigin: true,
      },
    },
  },
})
