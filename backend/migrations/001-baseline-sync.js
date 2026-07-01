// Baseline migration — creates any tables that don't exist yet, matching exactly
// what `sequelize.sync()` already did on every cold start before migrations existed.
// This is intentionally a no-op for tables that already exist (sync() without
// `alter`/`force` never touches existing tables), so running this against the
// live production database for the first time is safe and changes nothing there.
// All schema changes from now on belong in a new migration file, not here.
module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.sync();
  },
  down: async () => {
    // Not reversible — this represents the pre-migration schema state.
  },
};
