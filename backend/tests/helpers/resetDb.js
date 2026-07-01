const { sequelize } = require('../../src/models');

// Wipes all app data between tests, but keeps the schema (and SequelizeMeta,
// so migrations aren't re-run per test). CASCADE is safe here — it's test-only
// cleanup, not a production data operation.
async function resetDb() {
  const allTables = await sequelize.getQueryInterface().showAllTables();
  const names = allTables.filter(t => t !== 'SequelizeMeta').map(t => `"${t}"`).join(', ');
  if (names) {
    await sequelize.query(`TRUNCATE TABLE ${names} RESTART IDENTITY CASCADE`);
  }
}

module.exports = { resetDb };
