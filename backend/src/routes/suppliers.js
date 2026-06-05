const express = require('express');
const { Supplier } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { AuthenticationError } = require('../utils/errors');

const router = express.Router();

// GET all suppliers
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const suppliers = await Supplier.findAll({
      attributes: [
        'id',
        'name',
        'type',
        'leadTime',
        'email',
        'phone',
        'contactName',
        'deliveryModel',
        'deliveryDays',
        'minimumOrderAmount',
        'paymentTerms',
      ],
      order: [['name', 'ASC']],
    });

    res.json(suppliers);
  } catch (error) {
    next(error);
  }
});

// POST create new supplier
router.post('/', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const {
      name,
      type,
      leadTime,
      email,
      phone,
      contactName,
      deliveryModel,
      deliveryDays,
      minimumOrderAmount,
      paymentTerms,
    } = req.body;

    if (!name || !type || !leadTime || !email || !phone || !deliveryModel || !deliveryDays?.length) {
      return res.status(400).json({
        error: 'Missing required fields: name, type, leadTime, email, phone, deliveryModel, deliveryDays',
      });
    }

    // Generate ID from name (slug) + timestamp
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const id = `${slug}-${Date.now()}`;

    const supplier = await Supplier.create({
      id,
      name,
      type,
      leadTime,
      email,
      phone,
      contactName,
      deliveryModel,
      deliveryDays,
      minimumOrderAmount: minimumOrderAmount || 0,
      paymentTerms,
    });

    res.status(201).json(supplier);
  } catch (error) {
    next(error);
  }
});

// PUT update supplier
router.put('/:id', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      leadTime,
      email,
      phone,
      contactName,
      deliveryModel,
      deliveryDays,
      minimumOrderAmount,
      paymentTerms,
    } = req.body;

    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    await supplier.update({
      name,
      type,
      leadTime,
      email,
      phone,
      contactName,
      deliveryModel,
      deliveryDays,
      minimumOrderAmount,
      paymentTerms,
    });

    res.json(supplier);
  } catch (error) {
    next(error);
  }
});

// DELETE supplier
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    await supplier.destroy();
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
