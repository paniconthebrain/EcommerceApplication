const { Shop, Category, Supplier, Product, Inventory, User, Customer } = require('../../src/models');
const { generateToken } = require('../../src/utils/jwt');

let counter = 0;
function uid(prefix) {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}

async function makeShop(overrides = {}) {
  return Shop.create({
    id: uid('shop'),
    name: 'Test Shop',
    city: 'Testville',
    code: uid('CODE').toUpperCase(),
    ...overrides,
  });
}

async function makeSupplier(overrides = {}) {
  return Supplier.create({
    id: uid('supplier'),
    name: 'Test Supplier',
    type: 'General',
    leadTime: '2 days',
    email: `${uid('supplier')}@example.com`,
    phone: '555-0100',
    contactName: 'Test Contact',
    ...overrides,
  });
}

async function makeCategory(overrides = {}) {
  return Category.create({
    id: uid('cat'),
    name: 'Test Category',
    hue: 100,
    ...overrides,
  });
}

async function makeProduct({ categoryId, supplierId, ...overrides } = {}) {
  const category = categoryId ? { id: categoryId } : await makeCategory();
  const supplier = supplierId ? { id: supplierId } : await makeSupplier();
  return Product.create({
    id: uid('product'),
    name: 'Test Product',
    categoryId: category.id,
    supplierId: supplier.id,
    price: 9.99,
    unit: 'each',
    par: 10,
    status: 'active',
    ...overrides,
  });
}

async function makeInventory({ shopId, productId, stock = 20, par = 10 }) {
  return Inventory.create({ shopId, productId, stock, par });
}

async function makeStaff({ shopId = null, userType = 'staff', ...overrides } = {}) {
  const user = await User.create({
    email: overrides.email || `${uid('staff')}@example.com`,
    password: overrides.password || 'TestPassword123!',
    name: overrides.name || 'Test Staff',
    userType,
    shopId,
    status: 'active',
    ...overrides,
  });
  const token = generateToken(user, 'staff');
  return { user, token };
}

async function makeAdmin(overrides = {}) {
  return makeStaff({ userType: 'admin', shopId: null, ...overrides });
}

async function makeCustomer(overrides = {}) {
  const customer = await Customer.create({
    email: overrides.email || `${uid('customer')}@example.com`,
    password: overrides.password || 'TestPassword123!',
    name: overrides.name || 'Test Customer',
    ...overrides,
  });
  const token = generateToken(customer, 'customer');
  return { customer, token };
}

module.exports = {
  uid,
  makeShop,
  makeSupplier,
  makeCategory,
  makeProduct,
  makeInventory,
  makeStaff,
  makeAdmin,
  makeCustomer,
};
