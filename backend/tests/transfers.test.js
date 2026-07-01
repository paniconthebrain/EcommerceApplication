const request = require('supertest');
const app = require('../src/index');
const { Inventory } = require('../src/models');
const { resetDb } = require('./helpers/resetDb');
const { closeDb } = require('./helpers/teardown');
const { makeShop, makeProduct, makeInventory, makeStaff, makeAdmin } = require('./helpers/factories');

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await closeDb();
});

async function createTransfer({ token, fromShop, toShop, product, qty }) {
  return request(app)
    .post('/api/transfer')
    .set('Authorization', `Bearer ${token}`)
    .send({ fromShop, toShop, items: [{ productId: product, qty }] });
}

describe('Stock transfer inventory math', () => {
  test('in-transit decrements source, received increments destination', async () => {
    const shopA = await makeShop();
    const shopB = await makeShop();
    const product = await makeProduct();
    await makeInventory({ shopId: shopA.id, productId: product.id, stock: 10 });
    await makeInventory({ shopId: shopB.id, productId: product.id, stock: 5 });
    const { token: adminToken } = await makeAdmin();

    const created = await createTransfer({ token: adminToken, fromShop: shopA.id, toShop: shopB.id, product: product.id, qty: 4 });
    expect(created.status).toBe(201);
    const transferId = created.body.transferId;

    const inTransit = await request(app)
      .patch(`/api/transfer/${transferId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'in-transit' });
    expect(inTransit.status).toBe(200);

    let invA = await Inventory.findOne({ where: { shopId: shopA.id, productId: product.id } });
    expect(invA.stock).toBe(6); // 10 - 4

    const received = await request(app)
      .patch(`/api/transfer/${transferId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'received' });
    expect(received.status).toBe(200);

    const invB = await Inventory.findOne({ where: { shopId: shopB.id, productId: product.id } });
    expect(invB.stock).toBe(9); // 5 + 4
  });

  test('blocks releasing a transfer if source stock dropped below the transfer amount', async () => {
    const shopA = await makeShop();
    const shopB = await makeShop();
    const product = await makeProduct();
    await makeInventory({ shopId: shopA.id, productId: product.id, stock: 10 });
    await makeInventory({ shopId: shopB.id, productId: product.id, stock: 0 });
    const { token: adminToken } = await makeAdmin();

    const created = await createTransfer({ token: adminToken, fromShop: shopA.id, toShop: shopB.id, product: product.id, qty: 8 });
    const transferId = created.body.transferId;

    // Stock drops (e.g. another sale) after the transfer was created but before release
    const invA = await Inventory.findOne({ where: { shopId: shopA.id, productId: product.id } });
    await invA.update({ stock: 3 });

    const res = await request(app)
      .patch(`/api/transfer/${transferId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'in-transit' });

    expect(res.status).toBe(400);
    const invAAfter = await Inventory.findOne({ where: { shopId: shopA.id, productId: product.id } });
    expect(invAAfter.stock).toBe(3); // untouched — blocked before the decrement
  });
});

describe('Transfer shop-scoping (IDOR fix)', () => {
  test('staff unrelated to either shop cannot view, create, or approve a transfer', async () => {
    const shopA = await makeShop();
    const shopB = await makeShop();
    const shopC = await makeShop();
    const product = await makeProduct();
    await makeInventory({ shopId: shopA.id, productId: product.id, stock: 10 });
    await makeInventory({ shopId: shopB.id, productId: product.id, stock: 5 });

    const { token: staffAToken } = await makeStaff({ shopId: shopA.id });
    const { token: staffCToken } = await makeStaff({ shopId: shopC.id });

    // Shop C staff cannot even create a transfer between A and B
    const blockedCreate = await createTransfer({ token: staffCToken, fromShop: shopA.id, toShop: shopB.id, product: product.id, qty: 1 });
    expect(blockedCreate.status).toBe(403);

    const created = await createTransfer({ token: staffAToken, fromShop: shopA.id, toShop: shopB.id, product: product.id, qty: 1 });
    expect(created.status).toBe(201);
    const transferId = created.body.transferId;

    const blockedView = await request(app)
      .get(`/api/transfer/${transferId}`)
      .set('Authorization', `Bearer ${staffCToken}`);
    expect(blockedView.status).toBe(403);

    const blockedApprove = await request(app)
      .patch(`/api/transfer/${transferId}/status`)
      .set('Authorization', `Bearer ${staffCToken}`)
      .send({ status: 'in-transit' });
    expect(blockedApprove.status).toBe(403);
  });

  test('only destination shop staff (or admin) can mark a transfer received', async () => {
    const shopA = await makeShop();
    const shopB = await makeShop();
    const product = await makeProduct();
    await makeInventory({ shopId: shopA.id, productId: product.id, stock: 10 });
    await makeInventory({ shopId: shopB.id, productId: product.id, stock: 0 });

    const { token: staffAToken } = await makeStaff({ shopId: shopA.id });
    const created = await createTransfer({ token: staffAToken, fromShop: shopA.id, toShop: shopB.id, product: product.id, qty: 2 });
    const transferId = created.body.transferId;

    await request(app)
      .patch(`/api/transfer/${transferId}/status`)
      .set('Authorization', `Bearer ${staffAToken}`)
      .send({ status: 'in-transit' });

    // Source shop staff should NOT be able to confirm receipt on behalf of the destination shop
    const wrongReceiver = await request(app)
      .patch(`/api/transfer/${transferId}/status`)
      .set('Authorization', `Bearer ${staffAToken}`)
      .send({ status: 'received' });
    expect(wrongReceiver.status).toBe(403);

    const { token: staffBToken } = await makeStaff({ shopId: shopB.id });
    const correctReceiver = await request(app)
      .patch(`/api/transfer/${transferId}/status`)
      .set('Authorization', `Bearer ${staffBToken}`)
      .send({ status: 'received' });
    expect(correctReceiver.status).toBe(200);
  });
});
