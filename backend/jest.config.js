/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testMatch: ['**/*.spec.ts'],

  // Levanta un MongoDB en memoria para toda la suite.
  globalSetup: '<rootDir>/test/global-setup.ts',
  globalTeardown: '<rootDir>/test/global-teardown.ts',
  setupFiles: ['<rootDir>/test/env.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/setup-db.ts'],

  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.spec.ts',
    '!**/*.d.ts',
    '!test/**',
    '!scripts/**',
    '!server.ts',
  ],
  coverageDirectory: '../coverage',
  coverageReporters: ['text-summary', 'lcov'],
  coverageThreshold: {
    global: { statements: 70, branches: 60, functions: 70, lines: 70 },
  },

  clearMocks: true,
  testTimeout: 30000,
};
