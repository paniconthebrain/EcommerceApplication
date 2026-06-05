const express = require('express');
const { StockTransfer, Inventory, Shop, Product } = require('../models');
const { authMiddleware } = require('../middleware/authMiddleware');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { sequelize } = require('../models');

const router = express.Router();

// GET /api/transfer/suggestions
router.get('/suggestions', authMiddleware, async (req, res, next) => {
  try {
    const { fromShop, toShop } = req.query;

    if (!fromShop || !toShop) {
      throw new ValidationError('fromShop and toShop are required');
    }

    // Get inventory for both shops
    const fromInventory = await Inventory.findAll({
      where: { shopId: fromShop },
      include: [{ model: Product, attributes: ['id', 'name', 'par'] }],
    });

    const toInventory = await Inventory.findAll({
      where: { shopId: toShop },
      include: [{ model: Product, attributes: ['id', 'name', 'par'] }],
    });

    const suggestions = [];

    for (const fromItem of fromInventory) {
      const toItem = toInventory.find(i => i.productId === fromItem.productId);

      if (fromItem.stock > fromItem.par && toItem && toItem.stock < toItem.par) {
        const recommended = Math.min(
          fromItem.stock - fromItem.par,
          toItem.par - toItem.stock
        );

        suggestions.push({
          productId: fromItem.productId,
          productName: fromItem.Product.name,
          fromStock: fromItem.stock,
          fromPar: fromItem.par,
          toStock: toItem.stock,
          toPar: toItem.par,
          recommended,
        });
      }
    }

    res.json(suggestions.sort((a, b) => b.recommended - a.recommended));
  } catch (error) {
    next(error);
  }
});

// POST /api/transfer
router.post('/', authMiddleware, async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { fromShop, toShop, items } = req.body;

    if (!fromShop || !toShop || !items || !Array.isArray(items)) {
      throw new ValidationError('fromShop, toShop, and items array are required');
    }

    if (fromShop === toShop) {
      throw new ValidationError('Source and destination shops must be different');
    }

    // Verify all inventory items exist in source shop and have enough stock
    for (const item of items) {
      const inventory = await Inventory.findOne(
        {
          where: {
            shopId: fromShop,
            productId: item.productId,
          },
        },
        { transaction }
      );

      if (!inventory) {
        throw new NotFoundError(`Product ${item.productId} not found in source shop`);
      }

      if (inventory.stock < item.qty) {
        throw new ValidationError(
          `Insufficient stock for product ${item.productId}. Available: ${inventory.stock}, Requested: ${item.qty}`
        );
      }
    }

    // Create transfer
    const transfer = await StockTransfer.create(
      {
        id: require('crypto').randomUUID(),
        fromShopId: fromShop,
        toShopId: toShop,
        status: 'pending',
        lineItems: items,
        initiatedBy: req.user.sub,
        receivedBy: null,
        receivedAt: null,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      transferId: transfer.id,
      status: transfer.status,
      fromShop,
      toShop,
      itemCount: items.length,
      createdAt: transfer.createdAt,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

// GET /api/transfer/:transferId
router.get('/:transferId', authMiddleware, async (req, res, next) => {
  try {
    const { transferId } = req.params;

    const transfer = await StockTransfer.findByPk(transferId, {
      include: [
        {
          model: Shop,
          as: 'fromShop',
          attributes: ['id', 'name', 'code'],
        },
        {
          model: Shop,
          as: 'toShop',
          attributes: ['id', 'name', 'code'],
        },
      ],
    });

    if (!transfer) {
      throw new NotFoundError('Transfer not found');
    }

    res.json(transfer);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/transfer/:transferId/status
router.patch('/:transferId/status', authMiddleware, async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { transferId } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new ValidationError('Status is required');
    }

    const transfer = await StockTransfer.findByPk(transferId, { transaction });
    if (!transfer) {
      throw new NotFoundError('Transfer not found');
    }

    if (status === 'in-transit') {
      // Decrease inventory in source shop
      for (const item of transfer.lineItems) {
        const inventory = await Inventory.findOne(
          {
            where: {
              shopId: transfer.fromShopId,
              productId: item.productId,
            },
          },
          { transaction }
        );

        if (inventory) {
          await inventory.update(
            {
              stock: inventory.stock - item.qty,
            },
            { transaction }
          );
        }
      }
    } else if (status === 'received') {
      // Increase inventory in destination shop
      for (const item of transfer.lineItems) {
        const inventory = await Inventory.findOne(
          {
            where: {
              shopId: transfer.toShopId,
              productId: item.productId,
            },
          },
          { transaction }
        );

        if (inventory) {
          await inventory.update(
            {
              stock: inventory.stock + item.qty,
            },
            { transaction }
          );
        }
      }
    }

    await transfer.update(
      {
        status,
        receivedBy: status === 'received' ? req.user.sub : transfer.receivedBy,
        receivedAt: status === 'received' ? new Date() : transfer.receivedAt,
      },
      { transaction }
    );

    await transaction.commit();

    res.json({
      transferId: transfer.id,
      status: transfer.status,
      updatedAt: transfer.updatedAt,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

module.exports = router;
