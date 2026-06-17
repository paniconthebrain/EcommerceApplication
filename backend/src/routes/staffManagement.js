const express = require('express');
const { User } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { ValidationError } = require('../utils/errors');

const router = express.Router();

// GET /api/staff - List all staff users (admin only)
router.get('/', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const staff = await User.findAll({
      where: { userType: 'staff' },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    res.json(staff);
  } catch (error) {
    next(error);
  }
});

// GET /api/staff/:id - Get staff user details (admin only)
router.get('/:id', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const staff = await User.findOne({
      where: { id: req.params.id, userType: 'staff' },
      attributes: { exclude: ['password'] },
    });

    if (!staff) {
      throw new ValidationError('Staff user not found');
    }

    res.json(staff);
  } catch (error) {
    next(error);
  }
});

// POST /api/staff - Create new staff user (admin only)
router.post('/', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const { email, password, name, phone, shopId } = req.body;

    if (!email || !password || !name || !shopId) {
      throw new ValidationError('Email, password, name, and shopId are required');
    }

    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!PASSWORD_REGEX.test(password)) {
      throw new ValidationError(
        'Password must be at least 8 characters with uppercase, lowercase, and a number'
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ValidationError('Email already exists');
    }

    // Create staff user
    const staff = await User.create({
      email,
      password,
      name,
      phone: phone || null,
      shopId,
      userType: 'staff',
      status: 'active',
    });

    res.status(201).json({
      id: staff.id,
      email: staff.email,
      name: staff.name,
      phone: staff.phone,
      shopId: staff.shopId,
      userType: staff.userType,
      status: staff.status,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/staff/:id - Update staff user (admin only)
router.put('/:id', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const { name, phone, shopId, status } = req.body;

    const staff = await User.findOne({
      where: { id: req.params.id, userType: 'staff' },
    });

    if (!staff) {
      throw new ValidationError('Staff user not found');
    }

    // Update fields
    if (name) staff.name = name;
    if (phone !== undefined) staff.phone = phone || null;
    if (shopId) staff.shopId = shopId;
    if (status && ['active', 'inactive'].includes(status)) {
      staff.status = status;
    }

    await staff.save();

    res.json({
      id: staff.id,
      email: staff.email,
      name: staff.name,
      phone: staff.phone,
      shopId: staff.shopId,
      userType: staff.userType,
      status: staff.status,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/staff/:id - Delete staff user (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const staff = await User.findOne({
      where: { id: req.params.id, userType: 'staff' },
    });

    if (!staff) {
      throw new ValidationError('Staff user not found');
    }

    await staff.destroy();

    console.log(`[AUDIT] ${new Date().toISOString()} | DELETE staff ${staff.email} | by admin ${req.user.email}`);
    res.json({ success: true, message: 'Staff user deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// POST /api/staff/:id/unlock - Unlock a locked staff account (admin only)
router.post('/:id/unlock', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const staff = await User.findOne({ where: { id: req.params.id, userType: 'staff' } });
    if (!staff) throw new ValidationError('Staff user not found');
    await staff.update({ failedLoginAttempts: 0, lockedUntil: null });
    console.log(`[AUDIT] ${new Date().toISOString()} | ACCOUNT UNLOCKED for ${staff.email} | by admin ${req.user.email}`);
    res.json({ success: true, email: staff.email });
  } catch (error) {
    next(error);
  }
});

// POST /api/staff/:id/reset-password - Reset staff password (admin only)
router.post('/:id/reset-password', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const staff = await User.findOne({
      where: { id: req.params.id, userType: 'staff' },
    });

    if (!staff) {
      throw new ValidationError('Staff user not found');
    }

    // Reset password to a random temporary password
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const tempPassword = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    staff.password = tempPassword;
    await staff.save();

    // Log to server console only (replace with email service in production)
    console.log(`[AUDIT] ${new Date().toISOString()} | TEMP PASSWORD for ${staff.email} | by admin ${req.user.email} | temp: ${tempPassword}`);
    res.json({
      success: true,
      message: `Password reset. Please deliver the new credentials to ${staff.email} via a secure channel.`,
      email: staff.email,
      temporaryPassword: tempPassword,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
