const express = require('express');
const { Category, Department } = require('../models');
const { authMiddleware } = require('../middleware/authMiddleware');
const { AuthenticationError } = require('../utils/errors');

const router = express.Router();

// Middleware: Check if user is admin
async function adminOnly(req, res, next) {
  try {
    if (req.user.userType !== 'admin') {
      throw new AuthenticationError('Only admin can access this resource');
    }
    next();
  } catch (error) {
    next(error);
  }
}

// GET all categories or filter by department (public)
router.get('/', async (req, res, next) => {
  try {
    const { departmentId } = req.query;

    const where = departmentId ? { departmentId } : {};

    const categories = await Category.findAll({
      where,
      include: [{ model: Department, attributes: ['id', 'name'] }],
      order: [['name', 'ASC']],
    });

    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// POST create new category
router.post('/', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { departmentId, name, hue, blurb, isRestricted18Plus } = req.body;

    if (!name || hue === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: name, hue',
      });
    }

    // Verify department exists (if provided)
    if (departmentId) {
      const department = await Department.findByPk(departmentId);
      if (!department) {
        return res.status(404).json({ error: 'Department not found' });
      }
    }

    // Use the provided ID if given, otherwise auto-generate from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const id = (req.body.id && req.body.id.trim()) ? req.body.id.trim() : `cat-${slug}-${Date.now()}`;

    // Check for duplicate ID
    const existing = await Category.findByPk(id);
    if (existing) {
      return res.status(409).json({ error: `Category ID "${id}" already exists` });
    }

    const category = await Category.create({
      id,
      departmentId,
      name,
      hue,
      blurb,
      isRestricted18Plus: isRestricted18Plus || false,
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

// PUT update category
router.put('/:id', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, hue, blurb, isRestricted18Plus } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await category.update({
      name,
      hue,
      blurb,
      isRestricted18Plus,
    });

    res.json(category);
  } catch (error) {
    next(error);
  }
});

// DELETE category
router.delete('/:id', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
