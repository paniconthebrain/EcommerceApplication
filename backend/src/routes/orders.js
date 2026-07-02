const express = require('express');
const { Order, Customer, Shop, Product, Inventory } = require('../models');
const { authMiddleware } = require('../middleware/authMiddleware');
const customerAuthMiddleware = require('../middleware/customerAuthMiddleware');
const { NotFoundError, ValidationError, AuthenticationError } = require('../utils/errors');
const { assertShopAccess } = require('../middleware/shopAccess');
const { orderLimiter, trackLimiter } = require('../middleware/rateLimiters');
const { sequelize } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

const crypto = require('crypto');

// Cryptographically random order ID — not guessable/sequential
function generateOrderId() {
  return `GG-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

// GET /api/orders
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { shopId, status, date, limit = 20, offset = 0 } = req.query;

    const where = {};
    // Staff are always restricted to their own shop; admins can filter freely
    if (req.user.userType === 'staff') {
      where.shopId = req.user.shopId;
    } else if (shopId) {
      where.shopId = shopId;
    }
    if (status) where.status = status;

    const orders = await Order.findAll({
      where,
      include: [
        {
          model: Customer,
          attributes: ['id', 'name', 'email', 'phone'],
        },
        {
          model: Shop,
          attributes: ['id', 'name', 'code'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const total = await Order.count({ where });

    res.json({
      data: orders,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/customers/:customerId/orders - Get customer's order history (authenticated)
// NOTE: this must be registered before GET /:orderId — Express matches routes in
// registration order, and /:orderId would otherwise swallow /customers/<id> requests
// (treating "customers" as an orderId) since both are single-segment path patterns.
router.get('/customers/:customerId', customerAuthMiddleware, async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // Verify customer is accessing their own orders
    if (req.customer.id !== customerId) {
      throw new AuthenticationError('Unauthorized: can only view your own orders');
    }

    const where = { customerId };

    const orders = await Order.findAll({
      where,
      include: [
        {
          model: Shop,
          attributes: ['id', 'name', 'code', 'city'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const total = await Order.count({ where });

    res.json({
      data: orders,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:orderId
router.get('/:orderId', authMiddleware, async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: Customer,
          attributes: ['id', 'name', 'email', 'phone', 'address', 'city'],
        },
        {
          model: Shop,
          attributes: ['id', 'name', 'code', 'city'],
        },
      ],
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }
    assertShopAccess(req, order.shopId);

    res.json(order);
  } catch (error) {
    next(error);
  }
});

// POST /api/orders
router.post('/', orderLimiter, customerAuthMiddleware, async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      shopId,
      items,
      orderType,
      timeSlot,
      deliveryAddress,
      deliveryCity,
      deliveryZipCode,
    } = req.body;

    if (!shopId || !items || !orderType || !timeSlot) {
      throw new ValidationError('Missing required fields: shopId, items, orderType, timeSlot');
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new ValidationError('items must be a non-empty array');
    }
    // A non-positive qty would pass the stock check (stock < -2 is false) and
    // then *increase* inventory at commit while shrinking the subtotal.
    for (const item of items) {
      if (!item.productId || !Number.isInteger(item.qty) || item.qty < 1) {
        throw new ValidationError('Each item needs a productId and a positive integer qty');
      }
    }

    // Look up the authenticated customer
    const customer = await Customer.findByPk(req.customer.id, { transaction });
    if (!customer) {
      throw new AuthenticationError('Customer account not found');
    }

    // Validate stock with pessimistic locking and calculate pricing
    let subtotal = 0;
    const orderItems = [];
    const inventoryUpdates = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction });
      if (!product) {
        throw new NotFoundError(`Product ${item.productId} not found`);
      }

      // Lock inventory row with FOR UPDATE to prevent race conditions
      const inventory = await Inventory.findOne({
        where: { shopId, productId: item.productId },
        transaction,
        lock: 'UPDATE',
      });

      if (!inventory) {
        throw new ValidationError(
          `Item ${product.name} not available at this location`
        );
      }

      // Check if sufficient stock is available
      if (inventory.stock < item.qty) {
        const error = new Error(
          `Item ${product.name} quantity not available (in stock: ${inventory.stock}, requested: ${item.qty})`
        );
        error.statusCode = 409; // Conflict
        error.itemDetails = {
          productId: item.productId,
          productName: product.name,
          requested: item.qty,
          available: inventory.stock,
        };
        throw error;
      }

      const itemTotal = parseFloat(product.price) * item.qty;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        productName: product.name,
        qty: item.qty,
        price: parseFloat(product.price),
        substitution: null,
      });

      // Track inventory updates to apply after order creation
      inventoryUpdates.push({
        inventory,
        newStock: inventory.stock - item.qty,
      });
    }

    const deliveryFee = orderType === 'delivery' ? 5.0 : 0.0;
    const tax = subtotal * 0.08;
    const total = subtotal + deliveryFee + tax;

    const order = await Order.create(
      {
        id: generateOrderId(),
        customerId: customer.id,
        shopId,
        status: 'new',
        orderType,
        timeSlot,
        items: orderItems,
        pricing: {
          subtotal: parseFloat(subtotal.toFixed(2)),
          deliveryFee,
          tax: parseFloat(tax.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
          discountCode: null,
          discountAmount: null,
        },
        delivery: {
          address: deliveryAddress || null,
          city: deliveryCity || null,
          zipCode: deliveryZipCode || null,
          notes: null,
          driverId: null,
        },
        fulfillment: {
          pickerId: null,
          startedAt: null,
          completedAt: null,
          timeline: [
            {
              step: 'confirmed',
              timestamp: new Date(),
              updatedBy: null,
            },
          ],
        },
      },
      { transaction }
    );

    // Deduct inventory from stock levels
    for (const update of inventoryUpdates) {
      await update.inventory.update(
        { stock: update.newStock },
        { transaction }
      );
    }

    await transaction.commit();

    res.status(201).json({
      orderId: order.id,
      id: order.id,
      status: order.status,
      total: order.pricing.total,
      customerEmail: customer.email,
    });
  } catch (error) {
    await transaction.rollback();

    // Handle stock validation error (409 Conflict)
    if (error.statusCode === 409) {
      return res.status(409).json({
        error: error.message,
        itemDetails: error.itemDetails,
      });
    }

    next(error);
  }
});

// PATCH /api/orders/:orderId/status
router.patch('/:orderId/status', authMiddleware, async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status, pickerId } = req.body;

    if (!status) {
      throw new ValidationError('Status is required');
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    assertShopAccess(req, order.shopId);

    const fulfillment = order.fulfillment;
    const timeline = fulfillment.timeline || [];

    timeline.push({
      step: status,
      timestamp: new Date(),
      updatedBy: req.user.sub,
    });

    await order.update({
      status,
      fulfillment: {
        ...fulfillment,
        pickerId: pickerId || fulfillment.pickerId,
        timeline,
      },
    });

    res.json({
      orderId: order.id,
      status: order.status,
      updatedAt: order.updatedAt,
    });
  } catch (error) {
    next(error);
  }
});


// GET /api/orders/:orderId/track - Track order status (public)
router.get('/:orderId/track', trackLimiter, async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: Customer,
          attributes: [],   // No customer PII on public tracking
        },
        {
          model: Shop,
          attributes: ['id', 'name', 'code', 'city', 'hours'],
        },
      ],
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Format timeline from fulfillment
    const timeline = order.fulfillment?.timeline || [];

    res.json({
      orderId: order.id,
      status: order.status,
      orderType: order.orderType,
      shop: order.Shop,
      items: order.items,
      pricing: order.pricing,
      delivery: order.delivery,
      timeline: timeline.map(item => ({
        status: item.step,
        timestamp: item.timestamp,
        message: getStatusMessage(item.step),
      })),
      estimatedDelivery: order.timeSlot,
      createdAt: order.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

// Helper function for status messages
function getStatusMessage(status) {
  const messages = {
    'confirmed': 'Order confirmed and submitted',
    'picking': 'Staff is picking your items',
    'ready': 'Order ready for pickup/delivery',
    'completed': 'Order delivered/picked up',
    'cancelled': 'Order cancelled',
  };
  return messages[status] || status;
}

module.exports = router;
