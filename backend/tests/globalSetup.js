// Jest globalSetup runs once, in its own process, before any test file. It
// doesn't share process.env with test workers automatically, so it re-derives
// the same test DB name independently and makes sure that database exists and
// is migrated before any test tries to connect to it.
const { Client } = require('pg');

module.exports = async () => {
  require('dotenv').config();
  const baseName = process.env.DB_NAME || 'gogopantry';
  const testDbName = `${baseName}_test`;

  const admin = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
    ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false,
  });
  await admin.connect();

  // Always start from a clean slate — drop and recreate rather than reusing a
  // possibly stale test DB from a previous interrupted/failed run.
  await admin.query(`
    SELECT pg_terminate_backend(pid) FROM pg_stat_activity
    WHERE datname = $1 AND pid != pg_backend_pid()
  `, [testDbName]).catch(() => {});
  await admin.query(`DROP DATABASE IF EXISTS "${testDbName}"`);
  await admin.query(`CREATE DATABASE "${testDbName}"`);
  await admin.end();

  // Now point env at the test DB and run migrations against it.
  process.env.NODE_ENV = 'test';
  process.env.DB_NAME = testDbName;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-only-secret-not-used-in-production';

  delete require.cache[require.resolve('../src/config/database')];
  delete require.cache[require.resolve('../src/models')];
  delete require.cache[require.resolve('../src/migrator')];
  const { runMigrations } = require('../src/migrator');
  await runMigrations();
};
