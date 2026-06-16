/**
 * UAT Data Reset Script
 * Clears all data EXCEPT admin@gogopantry.com and staff@gogopantry.com users.
 * Run: node reset-data.js
 */

const { sequelize, User, Shop, Supplier, Category, Department,
        Product, Inventory, PurchaseOrder, StockTransfer, Order, Customer } = require('./src/models');

async function reset() {
  console.log('\n⚠️  Starting UAT data reset...\n');

  try {
    await sequelize.authenticate();
    console.log('✓ Database connected');

    // Delete in FK-safe order (children before parents)

    // Orders and related
    const orders = await Order.destroy({ where: {} });
    console.log(`✓ Deleted ${orders} orders`);

    const customers = await Customer.destroy({ where: {} });
    console.log(`✓ Deleted ${customers} customers`);

    // Stock transfers
    const transfers = await StockTransfer.destroy({ where: {} });
    console.log(`✓ Deleted ${transfers} stock transfers`);

    // Inventory
    const inventory = await Inventory.destroy({ where: {} });
    console.log(`✓ Deleted ${inventory} inventory records`);

    // Purchase orders
    const pos = await PurchaseOrder.destroy({ where: {} });
    console.log(`✓ Deleted ${pos} purchase orders`);

    // Products (variants first, then parents)
    const variants = await Product.destroy({ where: { productType: 'variant' } });
    console.log(`✓ Deleted ${variants} product variants`);
    const products = await Product.destroy({ where: {} });
    console.log(`✓ Deleted ${products} products`);

    // Categories and departments
    const categories = await Category.destroy({ where: {} });
    console.log(`✓ Deleted ${categories} categories`);

    const departments = await Department.destroy({ where: {} });
    console.log(`✓ Deleted ${departments} departments`);

    // Suppliers
    const suppliers = await Supplier.destroy({ where: {} });
    console.log(`✓ Deleted ${suppliers} suppliers`);

    // Users: delete all except admin and staff
    const { Op } = require('sequelize');
    const deletedUsers = await User.destroy({
      where: {
        email: { [Op.notIn]: ['admin@gogopantry.com', 'staff@gogopantry.com'] }
      }
    });
    console.log(`✓ Deleted ${deletedUsers} users (kept admin + staff)`);

    // Null out shopId on kept users (shops are being deleted)
    await User.update({ shopId: null }, {
      where: { email: { [Op.in]: ['admin@gogopantry.com', 'staff@gogopantry.com'] } }
    });
    console.log('✓ Cleared shopId on admin and staff users');

    // Shops
    const shops = await Shop.destroy({ where: {} });
    console.log(`✓ Deleted ${shops} shops`);

    console.log('\n✅ Reset complete. Database is clean for UAT.\n');
    console.log('Kept users:');
    const kept = await User.findAll({ attributes: ['email', 'userType', 'name'] });
    kept.forEach(u => console.log(`  - ${u.email} (${u.userType})`));
    console.log('');

  } catch (err) {
    console.error('\n❌ Reset failed:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

reset();
