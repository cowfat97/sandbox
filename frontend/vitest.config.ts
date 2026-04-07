import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    testTimeout: 60000,
    hookTimeout: 60000,
    isolate: false,
    fileParallelism: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})