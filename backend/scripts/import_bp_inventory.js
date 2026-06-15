/**
 * Import BP Inventory into GoGO Pantry DB
 *
 * Run AFTER extract_bp_inventory.py has been executed:
 *   node backend/scripts/import_bp_inventory.js
 *
 * By default seeds inventory into 'msn' shop only.
 * Pass --all-shops to seed (with same stock) into all 4 shops.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { sequelize, Category, Supplier, Product, Inventory } =
  require(path.join(__dirname, '../src/models'));

const DATA_FILE = path.join(__dirname, 'bp_inventory_data.json');
const ALL_SHOPS = process.argv.includes('--all-shops');
const SHOP_IDS  = ALL_SHOPS ? ['msn', 'psl', 'wkr', 'scg'] : ['msn'];

async function main() {
  const data = require(DATA_FILE);
  await sequelize.authenticate();
  console.log('Connected to database\n');

  // ── Categories ──────────────────────────────────────────────
  for (const cat of data.categories) {
    const [, created] = await Category.findOrCreate({
      where: { id: cat.id },
      defaults: cat,
    });
    console.log(`${created ? '+ Created' : '  Exists '} category: ${cat.name}`);
  }

  // ── Suppliers ────────────────────────────────────────────────
  for (const sup of data.suppliers) {
    const [, created] = await Supplier.findOrCreate({
      where: { id: sup.id },
      defaults: sup,
    });
    console.log(`${created ? '+ Created' : '  Exists '} supplier: ${sup.name}`);
  }

  // ── Products ─────────────────────────────────────────────────
  let prodCreated = 0;
  let prodExists  = 0;
  for (const prod of data.products) {
    const [, created] = await Product.findOrCreate({
      where: { id: prod.id },
      defaults: prod,
    });
    created ? prodCreated++ : prodExists++;
  }
  console.log(`\nProducts: ${prodCreated} created, ${prodExists} already existed`);

  // ── Inventory ─────────────────────────────────────────────────
  // Build a map: productId -> stock (from the msn inventory in the JSON)
  const stockMap = {};
  for (const inv of data.inventory) {
    stockMap[inv.productId] = { stock: inv.stock, par: inv.par };
  }

  let invCreated = 0;
  let invExists  = 0;

  for (const shopId of SHOP_IDS) {
    for (const prod of data.products) {
      const s = stockMap[prod.id] || { stock: 0, par: prod.par };
      // For non-primary shops, start stock at 0
      const stock = shopId === 'msn' ? s.stock : 0;

      const [, created] = await Inventory.findOrCreate({
        where: { shopId, productId: prod.id },
        defaults: { shopId, productId: prod.id, stock, par: s.par, lastReceived: new Date() },
      });
      created ? invCreated++ : invExists++;
    }
  }

  const shops = SHOP_IDS.join(', ');
  console.log(`Inventory: ${invCreated} created, ${invExists} already existed (shops: ${shops})`);
  console.log('\nDone!');

  process.exit(0);
}

main().catch(err => {
  console.error('Import failed:', err.message);
  process.exit(1);
});
