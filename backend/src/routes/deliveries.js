const express = require('express');
const { PurchaseOrder, Supplier, Shop, Inventory, Product } = require('../models');
const { authMiddleware } = require('../middleware/authMiddleware');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { sequelize } = require('../models');

const router = express.Router();

// POST /api/deliveries — create a new purchase order
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { supplierId, shopId, eta, lineItems } = req.body;

    if (!supplierId || !shopId || !lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      throw new ValidationError('supplierId, shopId, and lineItems are required');
    }

    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) throw new ValidationError('Supplier not found');

    const shop = await Shop.findByPk(shopId);
    if (!shop) throw new ValidationError('Shop not found');

    const po = await PurchaseOrder.create({
      id: 'PO-' + Date.now(),
      supplierId,
      shopId,
      eta: eta || null,
      status: 'scheduled',
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

// GET /api/deliveries
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { shopId, status } = req.query;

    const where = {};
    if (shopId) where.shopId = shopId;
    if (status) where.status = status;

    const deliveries = await PurchaseOrder.findAll({
      where,
      include: [
        {
          model: Supplier,
          attributes: ['id', 'name', 'type', 'leadTime'],
        },
        {
          model: Shop,
          attributes: ['id', 'name', 'code'],
        },
      ],
      order: [['eta', 'ASC']],
    });

    res.json(deliveries);
  } catch (error) {
    next(error);
  }
});

// GET /api/deliveries/:poId
router.get('/:poId', authMiddleware, async (req, res, next) => {
  try {
    const { poId } = req.params;

    const po = await PurchaseOrder.findByPk(poId, {
      include: [
        {
          model: Supplier,
          attributes: ['id', 'name', 'type', 'leadTime', 'email', 'phone', 'contactName'],
        },
        {
          model: Shop,
          attributes: ['id', 'name', 'code', 'city'],
        },
      ],
    });

    if (!po) {
      throw new NotFoundError('Purchase order not found');
    }

    res.json(po);
  } catch (error) {
    next(error);
  }
});

// POST /api/deliveries/:poId/receive
router.post('/:poId/receive', authMiddleware, async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { poId } = req.params;
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      throw new ValidationError('Items array is required');
    }

    const po = await PurchaseOrder.findByPk(poId, { transaction });
    if (!po) {
      throw new NotFoundError('Purchase order not found');
    }

    // Validate and enforce line item schema
    let hasRejections = false;
    let hasShortShip = false;

    // Update line items with received and rejected quantities
    const updatedLineItems = po.lineItems.map(lineItem => {
      const receivedItem = items.find(i => i.productId === lineItem.productId);

      if (!receivedItem) {
        return lineItem; // Not included in this receive
      }

      // Validate item schema
      const { receivedQty = 0, rejectedQty = 0, rejectionReason = null } = receivedItem;

      if (rejectedQty > 0) hasRejections = true;
      if (receivedQty < (lineItem.orderedQty || lineItem.expectedQty)) hasShortShip = true;

      return {
        ...lineItem,
        productId: lineItem.productId,
        productName: lineItem.productName || '',
        orderedQty: lineItem.orderedQty || lineItem.expectedQty,
        receivedQty: Math.max(0, receivedQty), // Stock never negative
        rejectedQty: Math.max(0, rejectedQty),
        rejectionReason: rejectedQty > 0 ? rejectionReason : null,
        unitCost: lineItem.unitCost || 0,
      };
    });

    // Update inventory ONLY with receivedQty (not rejectedQty)
    for (const item of items) {
      const lineItem = updatedLineItems.find(l => l.productId === item.productId);
      if (!lineItem) continue;

      const inventory = await Inventory.findOne(
        {
          where: {
            shopId: po.shopId,
            productId: item.productId,
          },
        },
        { transaction }
      );

      if (inventory) {
        // Only add receivedQty to stock, not rejectedQty
        await inventory.update(
          {
            stock: Math.max(0, inventory.stock + lineItem.receivedQty),
            lastReceived: new Date(),
            lastAdjusted: new Date(),
          },
          { transaction }
        );
      }
    }

    // Update PO status
    await po.update(
      {
        status: 'received',
        lineItems: updatedLineItems,
        receivedAt: new Date(),
      },
      { transaction }
    );

    await transaction.commit();

    res.json({
      poId: po.id,
      status: 'received',
      itemsReceived: items.length,
      hasRejections, // Flag if any rejections
      hasShortShip, // Flag if any items short-shipped
      updatedAt: po.updatedAt,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

// PATCH /api/deliveries/:poId/status
router.patch('/:poId/status', authMiddleware, async (req, res, next) => {
  try {
    const { poId } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new ValidationError('Status is required');
    }

    const po = await PurchaseOrder.findByPk(poId);
    if (!po) {
      throw new NotFoundError('Purchase order not found');
    }

    await po.update({
      status,
    });

    res.json({
      poId: po.id,
      status: po.status,
      updatedAt: po.updatedAt,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
