const express = require('express');
const bcryptjs = require('bcryptjs');
const { User, Shop } = require('../models');
const { generateToken } = require('../utils/jwt');
const { authMiddleware } = require('../middleware/authMiddleware');
const { AuthenticationError, ValidationError } = require('../utils/errors');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const loginId = email || username;

    if (!loginId || !password) {
      throw new ValidationError('Username/email and password are required');
    }

    const user = await User.findOne({ where: { email: loginId } });
    if (!user) {
      throw new AuthenticationError('Invalid username or password');
    }

    if (user.status !== 'active') {
      throw new AuthenticationError('User account is not active');
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid username or password');
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        shopId: user.shopId,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ success: true });
});

// POST /api/auth/refresh
router.post('/refresh', authMiddleware, (req, res, next) => {
  try {
    const user = req.user;
    const newToken = generateToken(user);
    res.json({ token: newToken });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
