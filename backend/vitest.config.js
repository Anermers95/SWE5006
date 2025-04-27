import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
      globals : true,
      coverage: {
        all: true,
        exclude: [
          'src/index.js',
          'src/server.js',
          'vitest.config.js',
          'tests/**',
          'src/models/**',
          'src/middlewares/**',
        ]
      }
    },
  })