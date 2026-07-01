// Runs before any test module is required. Forces a separate test database so
// the suite never touches the real dev/production database, regardless of
// what .env or other tooling has already injected into process.env.
require('dotenv').config();

process.env.NODE_ENV = 'test';
// globalSetup.js already points DB_NAME at the "_test" database and that
// mutation is inherited here — only append the suffix if it's somehow missing,
// so this never double-appends into "..._test_test".
const baseName = process.env.DB_NAME || 'gogopantry';
process.env.DB_NAME = baseName.endsWith('_test') ? baseName : `${baseName}_test`;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-only-secret-not-used-in-production';
process.env.CORS_ORIGIN = '*';
