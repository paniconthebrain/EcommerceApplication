const request = require('supertest');
const app = require('../src/index');
const { Order, Inventory } = require('../src/models');
const { resetDb } = require('./helpers/resetDb');
const { closeDb } = require('./helpers/teardown');
const { makeShop, makeProduct, makeInventory, makeCustomer, makeStaff, makeAdmin } = require('./helpers/factories');

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await closeDb();
});

describe('POST /api/orders', () => {
  test('creates a real order and deducts inventory', async () => {
    const shop = await makeShop();
    const product = await makeProduct({ price: 5 });
    await makeInventory({ shopId: shop.id, productId: product.id, stock: 10 });
    const { customer, token } = await makeCustomer();

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        shopId: shop.id,
        items: [{ productId: product.id, qty: 3 }],
        orderType: 'pickup',
        timeSlot: 'Today, 9-11am',
      });

    expect(res.status).toBe(201);
    expect(res.body.orderId).toBeTruthy();

    const order = await Order.findByPk(res.body.orderId);
    expect(order).not.toBeNull();
    expect(order.customerId).toBe(customer.id);
    expect(order.shopId).toBe(shop.id);
    expect(order.status).toBe('new');

    const inventory = await Inventory.findOne({ where: { shopId: shop.id, productId: product.id } });
    expect(inventory.stock).toBe(7); // 10 - 3
  });

  test('rejects an order for more than available stock and leaves inventory untouched', async () => {
    const shop = await makeShop();
    const product = await makeProduct({ price: 5 });
    await makeInventory({ shopId: shop.id, productId: product.id, stock: 2 });
    const { token } = await makeCustomer();

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        shopId: shop.id,
        items: [{ productId: product.id, qty: 5 }],
        orderType: 'pickup',
        timeSlot: 'Today, 9-11am',
      });

    expect(res.status).toBe(409);

    const inventory = await Inventory.findOne({ where: { shopId: shop.id, productId: product.id } });
    expect(inventory.stock).toBe(2); // unchanged — transaction rolled back

    const orderCount = await Order.count();
    expect(orderCount).toBe(0);
  });

  test('requires customer authentication', async () => {
    const shop = await makeShop();
    const product = await makeProduct();
    await makeInventory({ shopId: shop.id, productId: product.id, stock: 10 });

    const res = await request(app)
      .post('/api/orders')
      .send({ shopId: shop.id, items: [{ productId: product.id, qty: 1 }], orderType: 'pickup', timeSlot: 'x' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/orders/:orderId and PATCH /:orderId/status — shop scoping', () => {
  test('staff from a different shop cannot view another shop\'s order', async () => {
    const shopA = await makeShop();
    const shopB = await makeShop();
    const product = await makeProduct();
    await makeInventory({ shopId: shopA.id, productId: product.id, stock: 10 });
    const { token: customerToken } = await makeCustomer();

    const createRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ shopId: shopA.id, items: [{ productId: product.id, qty: 1 }], orderType: 'pickup', timeSlot: 'x' });
    const orderId = createRes.body.orderId;

    const { token: staffBToken } = await makeStaff({ shopId: shopB.id });
    const blocked = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${staffBToken}`);
    expect(blocked.status).toBe(403);

    const { token: staffAToken } = await makeStaff({ shopId: shopA.id });
    const allowed = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${staffAToken}`);
    expect(allowed.status).toBe(200);

    const patchBlocked = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${staffBToken}`)
      .send({ status: 'picking' });
    expect(patchBlocked.status).toBe(403);
  });

  test('admin can view any shop\'s order', async () => {
    const shop = await makeShop();
    const product = await makeProduct();
    await makeInventory({ shopId: shop.id, productId: product.id, stock: 10 });
    const { token: customerToken } = await makeCustomer();

    const createRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ shopId: shop.id, items: [{ productId: product.id, qty: 1 }], orderType: 'pickup', timeSlot: 'x' });

    const { token: adminToken } = await makeAdmin();
    const res = await request(app)
      .get(`/api/orders/${createRes.body.orderId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});

describe('GET /api/orders/customers/:customerId', () => {
  test('is reachable and returns the customer\'s own orders (route-ordering fix)', async () => {
    const shop = await makeShop();
    const product = await makeProduct();
    await makeInventory({ shopId: shop.id, productId: product.id, stock: 10 });
    const { customer, token } = await makeCustomer();

    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ shopId: shop.id, items: [{ productId: product.id, qty: 1 }], orderType: 'pickup', timeSlot: 'x' });

    const res = await request(app)
      .get(`/api/orders/customers/${customer.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });
});
