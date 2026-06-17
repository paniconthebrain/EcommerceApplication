/**
 * UAT data reset — deletes everything except admin users.
 * Run from the backend/ directory: node clear-for-uat.js
 */
require('dotenv').config();
const { sequelize, Order, StockTransfer, PurchaseOrder, Inventory, Customer, Product, Supplier, Category, Department, Shop, User, EmailTemplate } = require('./src/models');
const { Op } = require('sequelize');

async function main() {
  await sequelize.authenticate();
  console.log('Connected to database.\n');

  const steps = [
    ['Orders',         () => Order.destroy({ where: {} })],
    ['StockTransfers', () => StockTransfer.destroy({ where: {} })],
    ['PurchaseOrders', () => PurchaseOrder.destroy({ where: {} })],
    ['Inventory',      () => Inventory.destroy({ where: {} })],
    ['Customers',      () => Customer.destroy({ where: {} })],
    ['Products',       () => Product.destroy({ where: {} })],
    ['Suppliers',      () => Supplier.destroy({ where: {} })],
    ['Categories',     () => Category.destroy({ where: {} })],
    ['Departments',    () => Department.destroy({ where: {} })],
    ['Staff users',    () => User.destroy({ where: { userType: 'staff' } })],
    ['Fix shop_id constraint', () => sequelize.query('ALTER TABLE users ALTER COLUMN shop_id DROP NOT NULL')],
    ['Unlink admin shop_id', () => sequelize.query('UPDATE users SET shop_id = NULL WHERE user_type = \'admin\'')],
    ['Shops',          () => Shop.destroy({ where: {} })],
    ['EmailTemplates', () => EmailTemplate.destroy({ where: {} })],
  ];

  for (const [label, fn] of steps) {
    const count = await fn();
    console.log(`  ✓ ${label}: ${count} row(s) deleted`);
  }

  const remaining = await User.findAll({ attributes: ['id', 'email', 'name', 'userType'] });
  console.log('\nRemaining users (admin only):');
  remaining.forEach(u => console.log(`  - ${u.email}  (${u.name})`));

  console.log('\nDone. Database is clean for UAT.');
  await sequelize.close();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
