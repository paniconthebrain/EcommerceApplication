const express = require('express');
const { PurchaseOrder, Supplier, Shop, Inventory, Product } = require('../models');
const { authMiddleware } = require('../middleware/authMiddleware');
const { NotFoundError, ValidationError, AuthorizationError } = require('../utils/errors');
const { assertShopAccess } = require('../middleware/shopAccess');
const { sequelize } = require('../models');

const router = express.Router();

// Valid status progression
const VALID_STATUSES = ['draft', 'ordered', 'in_transit', 'arrived', 'received'];

// POST /api/purchase-orders — create a new purchase order
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { supplierId, shopId, eta, lineItems, status } = req.body;

    if (!supplierId || !shopId || !lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      throw new ValidationError('supplierId, shopId, and lineItems are required');
    }

    const shop = await Shop.findByPk(shopId);
    if (!shop) throw new ValidationError('Shop not found');

    // Enforce allowStaffPO flag
    if (req.user.userType !== 'admin' && !shop.allowStaffPO) {
      throw new AuthorizationError('Purchase order creation is restricted to admins for this shop');
    }

    // Staff can only create POs for their own shop
    assertShopAccess(req, shopId);

    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) throw new ValidationError('Supplier not found');

    const initialStatus = status && VALID_STATUSES.includes(status) ? status : 'draft';

    const po = await PurchaseOrder.create({
      id: 'PO-' + Date.now(),
      supplierId,
      shopId,
      eta: eta || null,
      status: initialStatus,
      lineItems: lineItems.map(item => ({
        productId: item.productId,
        productName: item.productName || '',
        orderedQty: item.orderedQty || 0,
        expectedQty: item.orderedQty || 0,
        receivedQty: 0,
        rejectedQty: 0,
        rejectionReason: null,
        unitCost: item.unitCost || 0,
      })),
    });

    res.status(201).json(po);
  } catch (error) {
    next(error);
  }
});

// GET /api/purchase-orders
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { shopId, status } = req.query;

    const where = {};
    if (shopId) {
      assertShopAccess(req, shopId);
      where.shopId = shopId;
    } else if (req.user.userType !== 'admin') {
      // Staff with no shopId filter are scoped to their own shop, not every shop.
      where.shopId = req.user.shopId;
    }
    if (status) {
      // Support comma-separated status filter e.g. ?status=arrived,in_transit
      const statuses = status.split(',').map(s => s.trim()).filter(s => VALID_STATUSES.includes(s));
      if (statuses.length === 1) where.status = statuses[0];
      else if (statuses.length > 1) where.status = statuses;
    }

    const pos = await PurchaseOrder.findAll({
      where,
      include: [
        { model: Supplier, attributes: ['id', 'name', 'type', 'leadTime', 'contactName', 'email', 'phone'] },
        { model: Shop, attributes: ['id', 'name', 'code'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(pos);
  } catch (error) {
    next(error);
  }
});

// GET /api/purchase-orders/:poId
router.get('/:poId', authMiddleware, async (req, res, next) => {
  try {
    const { poId } = req.params;

    const po = await PurchaseOrder.findByPk(poId, {
      include: [
        { model: Supplier, attributes: ['id', 'name', 'type', 'leadTime', 'email', 'phone', 'contactName'] },
        { model: Shop, attributes: ['id', 'name', 'code', 'city'] },
      ],
    });

    if (!po) throw new NotFoundError('Purchase order not found');
    assertShopAccess(req, po.shopId);

    res.json(po);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/purchase-orders/:poId/status
router.patch('/:poId/status', authMiddleware, async (req, res, next) => {
  try {
    const { poId } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      throw new ValidationError(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    const po = await PurchaseOrder.findByPk(poId);
    if (!po) throw new NotFoundError('Purchase order not found');
    assertShopAccess(req, po.shopId);

    await po.update({ status });

    res.json({ poId: po.id, status: po.status, updatedAt: po.updatedAt });
  } catch (error) {
    next(error);
  }
});

// POST /api/purchase-orders/:poId/receive — receive line items and update inventory
router.post('/:poId/receive', authMiddleware, async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { poId } = req.params;
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      throw new ValidationError('items array is required');
    }

    const po = await PurchaseOrder.findByPk(poId, { transaction });
    if (!po) throw new NotFoundError('Purchase order not found');
    assertShopAccess(req, po.shopId);

    if (po.status === 'received') {
      throw new ValidationError('This purchase order has already been received');
    }

    let hasRejections = false;
    let hasShortShip = false;

    const updatedLineItems = po.lineItems.map(lineItem => {
      const received = items.find(i => i.productId === lineItem.productId);
      if (!received) return lineItem;

      const receivedQty = Math.max(0, parseInt(received.receivedQty) || 0);
      const rejectedQty = Math.max(0, parseInt(received.rejectedQty) || 0);
      const rejectionReason = received.rejectionReason || null;

      if (rejectedQty > 0) hasRejections = true;
      if (receivedQty < (lineItem.orderedQty || lineItem.expectedQty)) hasShortShip = true;

      return {
        ...lineItem,
        receivedQty,
        rejectedQty,
        rejectionReason: rejectedQty > 0 ? rejectionReason : null,
      };
    });

    // Update inventory for each received item
    for (const item of items) {
      const receivedQty = Math.max(0, parseInt(item.receivedQty) || 0);
      if (receivedQty === 0) continue;

      const lineItem = po.lineItems.find(l => l.productId === item.productId);
      if (!lineItem) continue;

      let inventory = await Inventory.findOne({
        where: { shopId: po.shopId, productId: item.productId },
        transaction,
        lock: 'UPDATE',
      });

      if (inventory) {
        await inventory.update(
          { stock: inventory.stock + receivedQty, lastReceived: new Date(), lastAdjusted: new Date() },
          { transaction }
        );
      } else {
        // Auto-initialize inventory record if product was never set up
        await Inventory.create({
          shopId: po.shopId,
          productId: item.productId,
          stock: receivedQty,
          par: 10,
          lastReceived: new Date(),
          lastAdjusted: new Date(),
        }, { transaction });
      }
    }

    await po.update(
      { status: 'received', lineItems: updatedLineItems, receivedAt: new Date() },
      { transaction }
    );

    await transaction.commit();

    res.json({
      poId: po.id,
      status: 'received',
      itemsReceived: items.filter(i => (parseInt(i.receivedQty) || 0) > 0).length,
      hasRejections,
      hasShortShip,
      receivedAt: po.receivedAt,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

module.exports = router;
