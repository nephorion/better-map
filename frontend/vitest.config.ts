import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        branches: 0,
        functions: 100,
        lines: 100,
        statements: 100,
      },
      exclude: [
        'dist/**',
        'coverage/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'vite.config.ts',
        'vitest.config.ts',
      ],
    },
  },
})
