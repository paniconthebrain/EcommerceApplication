const express = require('express');
const { Op } = require('sequelize');
const {
  Shop,
  Inventory,
  Product,
  Order,
  PurchaseOrder,
  Supplier,
  Category,
} = require('../models');
const { authMiddleware } = require('../middleware/authMiddleware');
const { NotFoundError } = require('../utils/errors');
const { assertShopAccess } = require('../middleware/shopAccess');

const router = express.Router();

function getStockStatus(stock, par) {
  if (stock <= 0) return 'out';
  if (stock < par * 0.5) return 'critical';
  if (stock < par) return 'low';
  return 'ok';
}

// GET /api/shops/:shopId/dashboard
router.get('/shops/:shopId/dashboard', authMiddleware, async (req, res, next) => {
  try {
    const { shopId } = req.params;
    assertShopAccess(req, shopId);

    const shop = await Shop.findByPk(shopId);
    if (!shop) {
      throw new NotFoundError('Shop not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // KPIs
    const openOrders = await Order.count({
      where: {
        shopId,
        status: { [Op.in]: ['new', 'picking', 'ready'] },
      },
    });

    const inventory = await Inventory.findAll({
      where: { shopId },
    });

    const lowStock = inventory.filter(
      item => item.stock < item.par
    ).length;

    const todayOrders = await Order.findAll({
      where: {
        shopId,
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
    });

    const todaySales = todayOrders
      .reduce((sum, order) => sum + order.pricing.total, 0);

    const filledItems = inventory.filter(item => item.stock >= item.par).length;
    const fillRate = inventory.length > 0
      ? Math.round((filledItems / inventory.length) * 100)
      : 0;

    // Get all inventory with products for details
    const detailedInventory = await Inventory.findAll({
      where: { shopId },
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'price', 'unit', 'categoryId'],
          include: [{ model: Category, attributes: ['id', 'name'] }],
        },
      ],
    });

    const products = detailedInventory.map(item => ({
      id: item.Product.id,
      name: item.Product.name,
      price: item.Product.price,
      unit: item.Product.unit,
      stock: item.stock,
      par: item.par,
      status: getStockStatus(item.stock, item.par),
      category: item.Product.Category,
    }));

    // Get recent orders
    const orders = await Order.findAll({
      where: { shopId },
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    // Get upcoming purchase orders (draft/ordered/in transit/arrived)
    const deliveries = await PurchaseOrder.findAll({
      where: {
        shopId,
        status: { [Op.in]: ['draft', 'ordered', 'in_transit', 'arrived'] },
      },
      include: [{ model: Supplier, attributes: ['id', 'name', 'type'], required: false }],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    res.json({
      shop: {
        id: shop.id,
        name: shop.name,
        code: shop.code,
        city: shop.city,
      },
      kpis: {
        openOrders,
        lowStock,
        todaySales: parseFloat(todaySales.toFixed(2)),
        fillRate,
      },
      products: products.slice(0, 10),
      orders: orders.map(o => ({
        id: o.id,
        status: o.status,
        orderType: o.orderType,
        total: o.pricing.total,
        itemCount: o.items.length,
        createdAt: o.createdAt,
      })),
      deliveries: deliveries.map(d => ({
        id: d.id,
        supplier: d.Supplier?.name || '—',
        type: d.Supplier?.type,
        status: d.status,
        eta: d.eta,
        itemCount: d.lineItems.length,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/shops/:shopId/orders/daily-summary
router.get('/shops/:shopId/orders/daily-summary', authMiddleware, async (req, res, next) => {
  try {
    const targetShopId = req.params.shopId || req.query.shopId;
    assertShopAccess(req, targetShopId);
    const { shopId, date } = req.query;

    if (!date) {
      throw new Error('Date query parameter is required');
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const orders = await Order.findAll({
      where: {
        shopId,
        createdAt: {
          [Op.gte]: targetDate,
          [Op.lt]: nextDate,
        },
      },
    });

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const revenue = orders.reduce((sum, o) => sum + o.pricing.total, 0);
    const fillRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

    res.json({
      date: date,
      totalOrders,
      completedOrders,
      pendingOrders: totalOrders - completedOrders,
      revenue: parseFloat(revenue.toFixed(2)),
      averageOrderValue: totalOrders > 0
        ? parseFloat((revenue / totalOrders).toFixed(2))
        : 0,
      fillRate,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
