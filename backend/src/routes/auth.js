const express = require('express');
const bcryptjs = require('bcryptjs');
const { User } = require('../models');
const { generateToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const { blacklistToken } = require('../utils/tokenBlacklist');
const { authMiddleware } = require('../middleware/authMiddleware');
const { AuthenticationError, ValidationError } = require('../utils/errors');

const router = express.Router();

// Constant-time dummy hash — prevents timing oracle on non-existent users.
const DUMMY_HASH = '$2b$12$Qa6Wdl8UPzm3xYpUZe2C/urgHcQNbHPfxQU82.UFkoqLI69I95Xjy';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const loginId = email || username;

    if (!loginId || !password) {
      throw new ValidationError('Username/email and password are required');
    }

    const user = await User.findOne({ where: { email: loginId } });

    // Always run bcrypt compare — prevents timing oracle / email enumeration
    const hashToCompare = user ? user.password : DUMMY_HASH;
    const isPasswordValid = await bcryptjs.compare(password, hashToCompare);

    if (!user || !isPasswordValid) {
      // Increment failed attempts only if the user exists
      if (user) {
        const attempts = (user.failedLoginAttempts || 0) + 1;
        const updates = { failedLoginAttempts: attempts };
        if (attempts >= MAX_LOGIN_ATTEMPTS) {
          updates.lockedUntil = new Date(Date.now() + LOCKOUT_MS);
        }
        await user.update(updates);
      }
      throw new AuthenticationError('Invalid username or password');
    }

    // Check account lock AFTER password compare (constant-time)
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil - new Date()) / 60000);
      throw new AuthenticationError(
        `Account temporarily locked. Try again in ${minutesLeft} minute(s).`
      );
    }

    if (user.status !== 'active') {
      throw new AuthenticationError('Account is not active');
    }

    // Successful login — reset lockout counters
    await user.update({
      lastLogin: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    });

    const token = generateToken(user, 'staff');
    const refreshToken = generateRefreshToken(user, 'staff');

    res.json({
      token,
      refreshToken,
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
  blacklistToken(req.token);
  res.json({ success: true });
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AuthenticationError('Refresh token required');

    const decoded = verifyToken(refreshToken);
    if (!decoded || decoded.tokenType !== 'refresh') {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    const user = await User.findByPk(decoded.sub);
    if (!user || user.status !== 'active') {
      throw new AuthenticationError('User not found or inactive');
    }

    const newToken = generateToken(user, 'staff');
    res.json({ token: newToken });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
