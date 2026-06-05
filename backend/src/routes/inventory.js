const express = require('express');
const { Inventory, Product, Shop, Supplier } = require('../models');
const { authMiddleware } = require('../middleware/authMiddleware');
const { NotFoundError, ValidationError, AuthenticationError } = require('../utils/errors');

const router = express.Router();

// Helper to determine stock status
function getStockStatus(stock, par) {
  if (stock <= 0) return 'out';
  if (stock < par * 0.5) return 'critical';
  if (stock < par) return 'low';
  return 'ok';
}

// Helper to convert leadTime string to days
function getLeadTimeDays(leadTimeStr) {
  if (!leadTimeStr) return 2;
  const lower = leadTimeStr.toLowerCase();
  if (lower.includes('daily') || lower.includes('next-day')) return 1;
  if (lower.includes('2 day')) return 2;
  if (lower.includes('3 day')) return 3;
  if (lower.includes('4 day')) return 4;
  if (lower.includes('5 day')) return 5;
  if (lower.includes('week')) return 7;
  return 2; // default
}

// Helper to calculate reorder point
// Formula: reorderPoint = dailySalesVelocity × leadTimeDays + safetyStock
// dailySalesVelocity = par / 7 (par is a week's worth)
// safetyStock = dailySalesVelocity × 1.5 (1.5 days buffer)
function calculateReorderPoint(par, leadTimeDays) {
  const dailySalesVelocity = par / 7;
  const safetyStock = dailySalesVelocity * 1.5;
  return Math.ceil(dailySalesVelocity * leadTimeDays + safetyStock);
}

// POST /api/shops/:shopId/inventory - Initialize inventory (admin only)
router.post('/shops/:shopId/inventory', authMiddleware, async (req, res, next) => {
  try {
    // Check admin role
    if (req.user.userType !== 'admin') {
      throw new AuthenticationError('Only admins can initialize inventory');
    }

    const { shopId } = req.params;
    const { productId, stock, par } = req.body;

    if (!productId || stock === undefined || !par) {
      throw new ValidationError('Missing required fields: productId, stock, par');
    }

    // Verify shop exists
    const shop = await Shop.findByPk(shopId);
    if (!shop) {
      throw new NotFoundError('Shop not found');
    }

    // Verify product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check if inventory already exists
    let inventory = await Inventory.findOne({
      where: { shopId, productId },
    });

    if (inventory) {
      throw new ValidationError('Inventory already exists for this product at this shop');
    }

    // Create new inventory record
    inventory = await Inventory.create({
      shopId,
      productId,
      stock: parseInt(stock),
      par: parseInt(par),
      lastReceived: new Date(),
    });

    res.status(201).json({
      id: inventory.id,
      shopId: inventory.shopId,
      productId: inventory.productId,
      stock: inventory.stock,
      par: inventory.par,
      message: `Inventory initialized: ${product.name} at ${shop.name}`,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/shops/:shopId/inventory
router.get('/shops/:shopId/inventory', authMiddleware, async (req, res, next) => {
  try {
    const { shopId } = req.params;

    const inventory = await Inventory.findAll({
      where: { shopId },
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'price', 'unit', 'tag', 'categoryId', 'supplierId'],
          include: [
            {
              model: Supplier,
              attributes: ['leadTime'],
            },
          ],
        },
      ],
    });

    const response = inventory.map(item => {
      const leadTimeDays = getLeadTimeDays(item.Product?.Supplier?.leadTime);
      const reorderPoint = calculateReorderPoint(item.par, leadTimeDays);
      const needsReorder = item.stock <= reorderPoint;

      return {
        id: item.id,
        productId: item.productId,
        product: item.Product,
        shopId: item.shopId,
        stock: item.stock,
        par: item.par,
        status: getStockStatus(item.stock, item.par),
        reorderPoint,
        needsReorder,
        lastReceived: item.lastReceived,
        lastAdjusted: item.lastAdjusted,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/shops/:shopId/inventory/:productId - Adjust inventory (admin/staff)
router.patch('/shops/:shopId/inventory/:productId', authMiddleware, async (req, res, next) => {
  try {
    const { shopId, productId } = req.params;
    const { stock, par, action = 'set', reason } = req.body;

    // Check authorization: admin can do anything, staff can adjust their own shop
    if (req.user.userType !== 'admin' && req.user.shopId !== shopId) {
      throw new AuthenticationError('Staff can only adjust inventory for their own shop');
    }

    if (stock === undefined && action === 'set') {
      throw new ValidationError('Stock is required when action is "set"');
    }

    const inventory = await Inventory.findOne({
      where: { shopId, productId },
      include: [
        {
          model: Product,
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!inventory) {
      throw new NotFoundError('Inventory record not found');
    }

    let newStock = inventory.stock;
    const oldStock = inventory.stock;

    if (action === 'set') {
      newStock = parseInt(stock);
    } else if (action === 'add') {
      newStock = inventory.stock + parseInt(stock);
    } else if (action === 'subtract') {
      newStock = Math.max(0, inventory.stock - parseInt(stock));
    } else {
      throw new ValidationError('Invalid action. Use: set, add, or subtract');
    }

    await inventory.update({
      stock: newStock,
      par: par !== undefined ? parseInt(par) : inventory.par,
      lastAdjusted: new Date(),
    });

    res.json({
      productId: inventory.productId,
      productName: inventory.Product.name,
      oldStock,
      newStock: inventory.stock,
      par: inventory.par,
      action,
      reason: reason || null,
      status: getStockStatus(inventory.stock, inventory.par),
      adjustedBy: req.user.email,
      adjustedAt: inventory.updatedAt,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/inventory/:productId/across-shops
router.get('/inventory/:productId/across-shops', authMiddleware, async (req, res, next) => {
  try {
    const { productId } = req.params;

    const inventory = await Inventory.findAll({
      where: { productId },
      include: [
        {
          model: Shop,
          attributes: ['id', 'name', 'city', 'code'],
        },
      ],
    });

    const response = inventory.map(item => ({
      shopId: item.shopId,
      shop: item.Shop,
      stock: item.stock,
      par: item.par,
      status: getStockStatus(item.stock, item.par),
      shortage: item.stock < item.par,
    }));

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// GET /api/shops/:shopId/inventory/low-stock
router.get('/shops/:shopId/inventory/low-stock', authMiddleware, async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const { reorderOnly } = req.query; // ?reorderOnly=true to filter only items that need reorder

    const inventory = await Inventory.findAll({
      where: {
        shopId,
      },
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'price', 'unit', 'categoryId', 'supplierId'],
          include: [
            {
              model: Supplier,
              attributes: ['leadTime'],
            },
          ],
        },
      ],
    });

    const lowStock = inventory
      .map(item => {
        const leadTimeDays = getLeadTimeDays(item.Product?.Supplier?.leadTime);
        const reorderPoint = calculateReorderPoint(item.par, leadTimeDays);
        const needsReorder = item.stock <= reorderPoint;

        return {
          id: item.id,
          productId: item.productId,
          product: item.Product,
          stock: item.stock,
          par: item.par,
          status: getStockStatus(item.stock, item.par),
          reorderPoint,
          needsReorder,
          shortage: item.par - item.stock,
        };
      })
      .filter(item => {
        if (reorderOnly === 'true') {
          return item.needsReorder; // Only return items that need reorder
        }
        return item.stock < item.par; // Otherwise return items below par
      })
      .sort((a, b) => b.shortage - a.shortage);

    res.json(lowStock);
  } catch (error) {
    next(error);
  }
});

// GET /api/shops/:shopId/inventory/reorder-alerts
router.get('/shops/:shopId/inventory/reorder-alerts', authMiddleware, async (req, res, next) => {
  try {
    const { shopId } = req.params;

    const inventory = await Inventory.findAll({
      where: { shopId },
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'supplierId'],
          include: [
            {
              model: Supplier,
              attributes: ['id', 'name', 'leadTime', 'deliveryModel'],
            },
          ],
        },
      ],
    });

    const reorderAlerts = inventory
      .map(item => {
        const leadTimeDays = getLeadTimeDays(item.Product?.Supplier?.leadTime);
        const reorderPoint = calculateReorderPoint(item.par, leadTimeDays);

        return {
          productId: item.productId,
          productName: item.Product?.name,
          supplierName: item.Product?.Supplier?.name,
          deliveryModel: item.Product?.Supplier?.deliveryModel,
          stock: item.stock,
          reorderPoint,
          par: item.par,
          leadTimeDays,
          shortage: Math.max(0, reorderPoint - item.stock),
        };
      })
      .filter(item => item.stock <= item.reorderPoint) // Only items that need reorder
      .sort((a, b) => b.shortage - a.shortage) // Sort by urgency
      .slice(0, 10); // Limit to top 10

    res.json({ reorderAlerts });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
