const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sequelize, Product, Inventory } = require(path.join(__dirname, '../src/models'));

const DEMO_IDS = ['p1','p2','p3','p4','p5','p6','p7','p8','p9','p10','p11','p12'];

(async () => {
  await sequelize.authenticate();
  const invDel  = await Inventory.destroy({ where: { productId: DEMO_IDS } });
  const prodDel = await Product.destroy({ where: { id: DEMO_IDS } });
  console.log('Inventory records removed:', invDel);
  console.log('Products removed:', prodDel);
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
