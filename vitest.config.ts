import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['./tests/setup/testSetup.ts'],
    globalSetup: ['./tests/setup/globalSetup.ts'],
    globalTeardown: ['./tests/setup/globalTeardown.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/index.ts',
        'src/main.ts',
        'src/api/**',
        'src/types/**',
      ],
    },
  },
});
