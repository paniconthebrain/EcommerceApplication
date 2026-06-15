const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sequelize, Product } = require(path.join(__dirname, '../src/models'));
const { QueryTypes } = require('sequelize');

const SPIRIT_IDS = [
  'bp_cig_410','bp_cig_411','bp_cig_412','bp_cig_413','bp_cig_414',
  'bp_cig_415','bp_cig_416','bp_cig_417','bp_cig_544','bp_cig_545','bp_cig_546',
];

(async () => {
  await sequelize.authenticate();

  // Count what will be deleted
  const [{ count }] = await sequelize.query(
    `SELECT COUNT(*) AS count FROM products WHERE id NOT IN (:ids)`,
    { replacements: { ids: SPIRIT_IDS }, type: QueryTypes.SELECT }
  );
  console.log(`Products to delete: ${count}`);

  // Delete inventory records first (FK constraint)
  const [, invMeta] = await sequelize.query(
    `DELETE FROM inventory WHERE product_id NOT IN (:ids)`,
    { replacements: { ids: SPIRIT_IDS } }
  );
  console.log(`Inventory records deleted: ${invMeta?.rowCount ?? '?'}`);

  // Delete the products
  const [, prodMeta] = await sequelize.query(
    `DELETE FROM products WHERE id NOT IN (:ids)`,
    { replacements: { ids: SPIRIT_IDS } }
  );
  console.log(`Products deleted: ${prodMeta?.rowCount ?? '?'}`);

  // Confirm what's left
  const remaining = await Product.findAll({ raw: true, attributes: ['id','name'] });
  console.log(`\nRemaining products (${remaining.length}):`);
  remaining.forEach(p => console.log(`  ${p.id} — ${p.name}`));

  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
