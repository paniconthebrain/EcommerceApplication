// Historical change, previously applied via a hand-appended ALTER in index.js on
// every cold start. Recorded here as a real migration so it only runs once and
// the schema history is accurate. Safe to re-run: dropping a constraint that's
// already dropped is a no-op in Postgres, not an error, but we guard anyway
// since this exact statement already shipped to production before migrations existed.
module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize
      .query('ALTER TABLE "categories" ALTER COLUMN "department_id" DROP NOT NULL')
      .catch(() => {});
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize
      .query('ALTER TABLE "categories" ALTER COLUMN "department_id" SET NOT NULL')
      .catch(() => {});
  },
};
