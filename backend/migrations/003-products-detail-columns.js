// Historical change, previously applied via hand-appended
// "ADD COLUMN IF NOT EXISTS" statements in index.js on every cold start (added
// after the initial launch, which caused a real production outage —
// SequelizeDatabaseError: column Product.barcode does not exist — before this
// was patched). Recorded here as a real migration for an accurate schema history.
const COLUMNS = [
  ['barcode', 'VARCHAR(50)'],
  ['ingredients', 'TEXT'],
  ['nutrition_facts', 'JSONB'],
  ['allergens', 'JSON'],
  ['country_of_origin', 'VARCHAR(100)'],
  ['storage_instructions', 'VARCHAR(500)'],
];

module.exports = {
  up: async ({ context: queryInterface }) => {
    for (const [col, type] of COLUMNS) {
      await queryInterface.sequelize
        .query(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "${col}" ${type}`)
        .catch(() => {});
    }
  },
  down: async ({ context: queryInterface }) => {
    for (const [col] of COLUMNS) {
      await queryInterface.sequelize
        .query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "${col}"`)
        .catch(() => {});
    }
  },
};
