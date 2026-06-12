const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Shop } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { AuthenticationError, ValidationError } = require('../utils/errors');

const router = express.Router();

const uploadsDir = path.join(__dirname, '../../uploads/shops');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `shop-${req.params.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'));
    cb(null, true);
  },
});

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

// POST /api/shops/:id/image - Upload shop image (admin only)
router.post('/:id/image', authMiddleware, requireRole('admin'), upload.single('image'), async (req, res, next) => {
  try {
    const shop = await Shop.findByPk(req.params.id);
    if (!shop) throw new ValidationError('Shop not found');
    if (!req.file) throw new ValidationError('No image file provided');

    // Delete old image file if it exists
    if (shop.image) {
      const oldPath = path.join(__dirname, '../../', shop.image.replace(/^\//, ''));
      fs.unlink(oldPath, () => {});
    }

    const imageUrl = `/uploads/shops/${req.file.filename}`;
    shop.image = imageUrl;
    await shop.save();

    res.json({ image: imageUrl });
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(error);
  }
});

// DELETE /api/shops/:id/image - Remove shop image (admin only)
router.delete('/:id/image', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const shop = await Shop.findByPk(req.params.id);
    if (!shop) throw new ValidationError('Shop not found');

    if (shop.image) {
      const oldPath = path.join(__dirname, '../../', shop.image.replace(/^\//, ''));
      fs.unlink(oldPath, () => {});
      shop.image = null;
      await shop.save();
    }

    res.json({ success: true });
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

    if (shop.image) {
      const oldPath = path.join(__dirname, '../../', shop.image.replace(/^\//, ''));
      fs.unlink(oldPath, () => {});
    }
    await shop.destroy();

    res.json({ success: true, message: 'Shop deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
