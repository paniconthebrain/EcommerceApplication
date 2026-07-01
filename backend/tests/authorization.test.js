const request = require('supertest');
const app = require('../src/index');
const { resetDb } = require('./helpers/resetDb');
const { closeDb } = require('./helpers/teardown');
const { makeShop, makeProduct, makeSupplier, makeInventory, makeStaff, makeAdmin } = require('./helpers/factories');

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await closeDb();
});

describe('Dashboard shop-scoping', () => {
  test('staff cannot load another shop\'s dashboard', async () => {
    const shopA = await makeShop();
    const shopB = await makeShop();
    const { token } = await makeStaff({ shopId: shopA.id });

    const res = await request(app)
      .get(`/api/shops/${shopB.id}/dashboard`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  test('a nonexistent shop id returns 404, not a silent empty success', async () => {
    const { token } = await makeAdmin();
    const res = await request(app)
      .get('/api/shops/does-not-exist/dashboard')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

describe('Inventory across-shops — admin only', () => {
  test('staff is rejected', async () => {
    const shop = await makeShop();
    const product = await makeProduct();
    await makeInventory({ shopId: shop.id, productId: product.id, stock: 5 });
    const { token } = await makeStaff({ shopId: shop.id });

    const res = await request(app)
      .get(`/api/inventory/${product.id}/across-shops`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('admin is allowed', async () => {
    const shop = await makeShop();
    const product = await makeProduct();
    await makeInventory({ shopId: shop.id, productId: product.id, stock: 5 });
    const { token } = await makeAdmin();

    const res = await request(app)
      .get(`/api/inventory/${product.id}/across-shops`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

describe('Purchase orders list — no shopId leak', () => {
  test('staff omitting shopId only sees their own shop\'s POs, not every shop\'s', async () => {
    const shopA = await makeShop();
    const shopB = await makeShop();
    const supplier = await makeSupplier();

    const { token: adminToken } = await makeAdmin();
    await request(app).post('/api/purchase-orders').set('Authorization', `Bearer ${adminToken}`)
      .send({ supplierId: supplier.id, shopId: shopA.id, lineItems: [{ productId: 'p1', orderedQty: 1 }] });
    await request(app).post('/api/purchase-orders').set('Authorization', `Bearer ${adminToken}`)
      .send({ supplierId: supplier.id, shopId: shopB.id, lineItems: [{ productId: 'p1', orderedQty: 1 }] });

    const { token: staffAToken } = await makeStaff({ shopId: shopA.id });
    const res = await request(app)
      .get('/api/purchase-orders')
      .set('Authorization', `Bearer ${staffAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].shopId).toBe(shopA.id);
  });
});

describe('Public per-shop inventory endpoint (customer app)', () => {
  test('returns real stock without requiring auth', async () => {
    const shop = await makeShop();
    const product = await makeProduct();
    await makeInventory({ shopId: shop.id, productId: product.id, stock: 17, par: 5 });

    const res = await request(app).get(`/api/shops/${shop.id}/public-inventory`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      expect.objectContaining({ productId: product.id, stock: 17, par: 5 }),
    ]);
  });

  test('404s for a shop that does not exist', async () => {
    const res = await request(app).get('/api/shops/does-not-exist/public-inventory');
    expect(res.status).toBe(404);
  });
});

describe('Staff reassignment validates target shop exists', () => {
  test('rejects assigning staff to a nonexistent shop', async () => {
    const shop = await makeShop();
    const { user, token: adminToken } = await makeAdmin();
    const { user: staffUser } = await makeStaff({ shopId: shop.id });

    const res = await request(app)
      .put(`/api/staff/${staffUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ shopId: 'does-not-exist' });

    expect(res.status).toBe(404);
  });
});

describe('Foreign key constraints prevent orphaned data', () => {
  test('deleting a shop with existing inventory is blocked, not silently orphaned', async () => {
    const shop = await makeShop();
    const product = await makeProduct();
    await makeInventory({ shopId: shop.id, productId: product.id, stock: 5 });
    const { token: adminToken } = await makeAdmin();

    const res = await request(app)
      .delete(`/api/shops/${shop.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    // Blocked with a clean error, not a 500 crash and not a silent orphaning delete
    expect(res.status).toBe(409);
  });
});
