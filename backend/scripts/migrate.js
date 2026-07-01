// Manual/CI entry point: `npm run migrate`. Cold starts also run pending
// migrations automatically (see src/index.js), so this is mainly for running
// migrations ahead of a deploy or checking status locally.
require('dotenv').config();
const { runMigrations } = require('../src/migrator');

runMigrations()
  .then(() => {
    console.log('✓ Migrations complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
