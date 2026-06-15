const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sequelize, Product } = require(path.join(__dirname, '../src/models'));
(async () => {
  await sequelize.authenticate();
  const [simple, variable, variant] = await Promise.all([
    Product.count({ where: { productType: 'simple' } }),
    Product.count({ where: { productType: 'variable' } }),
    Product.count({ where: { productType: 'variant' } }),
  ]);
  console.log(`simple: ${simple} | variable (parents): ${variable} | variant: ${variant} | total: ${simple+variable+variant}`);
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
