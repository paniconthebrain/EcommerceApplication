/**
 * Auto-group products whose names contain " - " into variable + variant structure.
 * Products without " - " stay as 'simple'.
 *
 * Run: node backend/scripts/autogroup_variants.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sequelize, Product } = require(path.join(__dirname, '../src/models'));

async function main() {
  await sequelize.authenticate();
  // Sync schema so parent_id column is created
  await sequelize.sync({ alter: true });
  console.log('Schema synced\n');

  // Fetch all current products
  const all = await Product.findAll({ raw: true });
  console.log(`Total products: ${all.length}`);

  // Separate products with " - " from those without
  const withDash   = all.filter(p => p.name.includes(' - '));
  const withoutDash = all.filter(p => !p.name.includes(' - '));

  // Mark products without " - " as simple (if not already set)
  const simpleIds = withoutDash.map(p => p.id);
  if (simpleIds.length) {
    await Product.update({ productType: 'simple', parent_id: null }, { where: { id: simpleIds } });
    console.log(`${simpleIds.length} products marked as simple`);
  }

  // Group products with " - " by prefix (the part before the first " - ")
  const groups = {};
  for (const p of withDash) {
    const idx    = p.name.indexOf(' - ');
    const prefix = p.name.slice(0, idx).trim();
    const label  = p.name.slice(idx + 3).trim();
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push({ ...p, _variantLabel: label });
  }

  const prefixes = Object.keys(groups);
  console.log(`${prefixes.length} unique parent groups found from " - " products\n`);

  let parentsCreated = 0;
  let variantsLinked = 0;

  for (const [prefix, variants] of Object.entries(groups)) {
    const first = variants[0];

    // Create the parent product
    const parentId = `par_${first.id}`;
    const existing = await Product.findByPk(parentId);

    let parent;
    if (existing) {
      parent = existing;
    } else {
      parent = await Product.create({
        id:           parentId,
        name:         prefix,
        categoryId:   first.category_id  || first.categoryId,
        supplierId:   first.supplier_id  || first.supplierId,
        unit:         first.unit || 'each',
        par:          0,
        price:        null,
        productType:  'variable',
        status:       first.status || 'active',
        featuredImage: first.featured_image || first.featuredImage || null,
        parentId:     null,
      });
      parentsCreated++;
    }

    // Update each variant: rename to label, link to parent
    for (const v of variants) {
      await Product.update(
        { name: v._variantLabel, productType: 'variant', parentId: parent.id },
        { where: { id: v.id } }
      );
      variantsLinked++;
    }
  }

  console.log(`Parents created : ${parentsCreated}`);
  console.log(`Variants linked : ${variantsLinked}`);
  console.log('\nDone!');
  process.exit(0);
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
