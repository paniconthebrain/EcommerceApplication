module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/env.setup.js'],
  globalSetup: '<rootDir>/tests/globalSetup.js',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  testTimeout: 15000,
  // Tests hit a real Postgres database (not mocks) — parallel workers would
  // race on shared tables via the same TRUNCATE-between-tests strategy.
  maxWorkers: 1,
};
