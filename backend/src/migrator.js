const path = require('path');
const { Umzug, SequelizeStorage } = require('umzug');
// Must come from ./models (not ./config/database directly) — requiring ./models
// is what defines every model class and association on the shared Sequelize
// instance. Migration 001 calls sequelize.sync(), which has nothing to create
// if no models have been registered on this instance yet.
const { sequelize } = require('./models');

// Schema changes from here on go through migrations/*.js, not sequelize.sync()
// or hand-appended ALTER statements in index.js. Applied migrations are tracked
// in the "SequelizeMeta" table so each one runs exactly once per environment.
const umzug = new Umzug({
  migrations: {
    // Glob patterns need forward slashes even on Windows — path.join() would
    // produce backslashes here, which silently match zero files.
    glob: path.join(__dirname, '..', 'migrations', '*.js').split(path.sep).join('/'),
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize, tableName: 'SequelizeMeta' }),
  logger: console,
});

async function runMigrations() {
  const pending = await umzug.pending();
  if (pending.length) {
    console.log(`Running ${pending.length} pending migration(s): ${pending.map(m => m.name).join(', ')}`);
  }
  await umzug.up();
}

module.exports = { umzug, runMigrations };
