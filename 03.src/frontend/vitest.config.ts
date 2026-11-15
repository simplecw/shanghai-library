import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    testTimeout: 20000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', '**/*.test.ts', '**/*.test.tsx'],
      thresholds: {
        lines: 100,
        statements: 100,
        functions: 100,
        branches: 100
      },
      reporter: ['text', 'text-summary']
    }
  }
})
