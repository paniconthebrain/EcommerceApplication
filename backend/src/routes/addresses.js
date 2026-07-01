const express = require('express');
const { Op } = require('sequelize');
const { Address, sequelize } = require('../models');
const customerAuthMiddleware = require('../middleware/customerAuthMiddleware');
const { sanitizeText } = require('../utils/sanitize');
const { ValidationError, NotFoundError } = require('../utils/errors');

const router = express.Router();

router.use(customerAuthMiddleware);

// Unsets isDefault on every other address owned by this customer. Must run
// inside the same transaction as the create/update that sets the new default,
// so a crash mid-way never leaves two addresses (or zero) marked default.
async function unsetOtherDefaults(customerId, keepId, transaction) {
  const where = keepId ? { customerId, id: { [Op.ne]: keepId } } : { customerId };
  await Address.update({ isDefault: false }, { where, transaction });
}

// GET /api/customers/addresses
router.get('/', async (req, res, next) => {
  try {
    const addresses = await Address.findAll({
      where: { customerId: req.customer.id },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']],
    });
    res.json(addresses);
  } catch (err) {
    next(err);
  }
});

// POST /api/customers/addresses
router.post('/', async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { label, address, city, zipCode, isDefault } = req.body;
    if (!address?.trim() || !city?.trim() || !zipCode?.trim()) {
      throw new ValidationError('Address, city, and zip code are required');
    }

    const existingCount = await Address.count({ where: { customerId: req.customer.id }, transaction });
    const shouldBeDefault = !!isDefault || existingCount === 0;

    if (shouldBeDefault) {
      await unsetOtherDefaults(req.customer.id, null, transaction);
    }

    const created = await Address.create({
      customerId: req.customer.id,
      label: label ? sanitizeText(label) : null,
      address: sanitizeText(address),
      city: sanitizeText(city),
      zipCode: sanitizeText(zipCode),
      isDefault: shouldBeDefault,
    }, { transaction });

    await transaction.commit();
    res.status(201).json(created);
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
});

// PUT /api/customers/addresses/:id
router.put('/:id', async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const existing = await Address.findByPk(req.params.id, { transaction });
    if (!existing || existing.customerId !== req.customer.id) {
      throw new NotFoundError('Address not found');
    }

    const { label, address, city, zipCode, isDefault } = req.body;
    if (label !== undefined) existing.label = label ? sanitizeText(label) : null;
    if (address !== undefined) {
      if (!address.trim()) throw new ValidationError('Address cannot be empty');
      existing.address = sanitizeText(address);
    }
    if (city !== undefined) {
      if (!city.trim()) throw new ValidationError('City cannot be empty');
      existing.city = sanitizeText(city);
    }
    if (zipCode !== undefined) {
      if (!zipCode.trim()) throw new ValidationError('Zip code cannot be empty');
      existing.zipCode = sanitizeText(zipCode);
    }

    if (isDefault === true) {
      await unsetOtherDefaults(req.customer.id, existing.id, transaction);
      existing.isDefault = true;
    }

    await existing.save({ transaction });
    await transaction.commit();
    res.json(existing);
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
});

// DELETE /api/customers/addresses/:id
router.delete('/:id', async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const existing = await Address.findByPk(req.params.id, { transaction });
    if (!existing || existing.customerId !== req.customer.id) {
      throw new NotFoundError('Address not found');
    }
    const wasDefault = existing.isDefault;
    await existing.destroy({ transaction });

    if (wasDefault) {
      // Promote the most recently created remaining address, if any.
      const nextDefault = await Address.findOne({
        where: { customerId: req.customer.id },
        order: [['createdAt', 'DESC']],
        transaction,
      });
      if (nextDefault) await nextDefault.update({ isDefault: true }, { transaction });
    }

    await transaction.commit();
    res.json({ success: true });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
});

// PATCH /api/customers/addresses/:id/default
router.patch('/:id/default', async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const existing = await Address.findByPk(req.params.id, { transaction });
    if (!existing || existing.customerId !== req.customer.id) {
      throw new NotFoundError('Address not found');
    }
    await unsetOtherDefaults(req.customer.id, existing.id, transaction);
    existing.isDefault = true;
    await existing.save({ transaction });
    await transaction.commit();
    res.json(existing);
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
});

module.exports = router;
