const express = require('express');
const { Shop } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { AuthenticationError, ValidationError } = require('../utils/errors');

const router = express.Router();

// GET /api/shops - List all shops (public endpoint for login page)
router.get('/', async (req, res, next) => {
  try {
    const shops = await Shop.findAll({
      order: [['createdAt', 'ASC']],
    });

    res.json(shops);
  } catch (error) {
    next(error);
  }
});

// GET /api/shops/:id - Get shop details (admin only)
router.get('/:id', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const shop = await Shop.findByPk(req.params.id);

    if (!shop) {
      throw new ValidationError('Shop not found');
    }

    res.json(shop);
  } catch (error) {
    next(error);
  }
});

// POST /api/shops - Create new shop (admin only)
router.post('/', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const { id, name, city, code, hours, tint } = req.body;

    if (!id || !name || !city || !code) {
      throw new ValidationError('ID, name, city, and code are required');
    }

    // Check if shop already exists
    const existingShop = await Shop.findByPk(id);
    if (existingShop) {
      throw new ValidationError('Shop ID already exists');
    }

    // Check if code is unique
    const existingCode = await Shop.findOne({ where: { code } });
    if (existingCode) {
      throw new ValidationError('Shop code must be unique');
    }

    // Create shop
    const shop = await Shop.create({
      id,
      name,
      city,
      code,
      hours: hours || null,
      tint: tint || null,
    });

    res.status(201).json(shop);
  } catch (error) {
    next(error);
  }
});

// PUT /api/shops/:id - Update shop (admin only)
router.put('/:id', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const { name, city, code, hours, tint } = req.body;

    const shop = await Shop.findByPk(req.params.id);

    if (!shop) {
      throw new ValidationError('Shop not found');
    }

    // Check if new code is unique (if changed)
    if (code && code !== shop.code) {
      const existingCode = await Shop.findOne({ where: { code } });
      if (existingCode) {
        throw new ValidationError('Shop code must be unique');
      }
    }

    // Update fields
    if (name) shop.name = name;
    if (city) shop.city = city;
    if (code) shop.code = code;
    if (hours !== undefined) shop.hours = hours || null;
    if (tint !== undefined) shop.tint = tint || null;

    await shop.save();

    res.json(shop);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/shops/:id - Delete shop (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const shop = await Shop.findByPk(req.params.id);

    if (!shop) {
      throw new ValidationError('Shop not found');
    }

    await shop.destroy();

    res.json({ success: true, message: 'Shop deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
