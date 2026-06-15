const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sequelize, Product } = require(path.join(__dirname, '../src/models'));
(async () => {
  await sequelize.authenticate();
  const all = await Product.findAll({ raw: true, attributes: ['id','name','productType','parent_id'] });
  const matches = all.filter(p => p.name.toLowerCase().includes('spirit'));
  console.log(`Total products: ${all.length}`);
  console.log(`American Spirit matches (${matches.length}):`);
  matches.forEach(p => console.log(`  [${p.productType}] ${p.id} — ${p.name} (parent: ${p.parent_id || 'none'})`));
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
