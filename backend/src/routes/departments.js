const express = require('express');
const { Department } = require('../models');
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

// GET all departments
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      order: [['name', 'ASC']],
    });
    res.json(departments);
  } catch (error) {
    next(error);
  }
});

// POST create new department
router.post('/', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { name, location, temperatureZone, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Department name is required' });
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const id = `dept-${slug}-${Date.now()}`;

    const department = await Department.create({
      id,
      name,
      location,
      temperatureZone,
      description,
    });

    res.status(201).json(department);
  } catch (error) {
    next(error);
  }
});

// PUT update department
router.put('/:id', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, location, temperatureZone, description } = req.body;

    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    await department.update({
      name,
      location,
      temperatureZone,
      description,
    });

    res.json(department);
  } catch (error) {
    next(error);
  }
});

// DELETE department
router.delete('/:id', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id);

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    await department.destroy();
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
