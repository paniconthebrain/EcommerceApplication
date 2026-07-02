const express = require('express');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');
const { Customer } = require('../models');
const { generateToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const { blacklistToken } = require('../utils/tokenBlacklist');
const { sanitizeText } = require('../utils/sanitize');
const customerAuthMiddleware = require('../middleware/customerAuthMiddleware');
const { AuthenticationError, ValidationError } = require('../utils/errors');
const { sendEmail } = require('../utils/emailService');
const { EmailTemplate } = require('../models');

const router = express.Router();

const DUMMY_HASH = '$2b$12$Qa6Wdl8UPzm3xYpUZe2C/urgHcQNbHPfxQU82.UFkoqLI69I95Xjy';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// POST /api/customers/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, confirmPassword, name, phone } = req.body;

    if (!email || !password || !confirmPassword || !name) {
      throw new ValidationError('Email, password, confirm password, and name are required');
    }
    if (password !== confirmPassword) {
      throw new ValidationError('Passwords do not match');
    }
    if (!PASSWORD_REGEX.test(password)) {
      throw new ValidationError(
        'Password must be at least 8 characters with uppercase, lowercase, and a number'
      );
    }

    const existingCustomer = await Customer.findOne({ where: { email } });
    if (existingCustomer) {
      // Generic message — don't reveal whether the email exists
      throw new AuthenticationError('Registration failed. Please check your details.');
    }

    const customer = await Customer.create({
      email,
      password,
      name: sanitizeText(name),
      phone: phone ? sanitizeText(phone) : null,
      status: 'active',
    });

    const token = generateToken(customer, 'customer');
    const refreshToken = generateRefreshToken(customer, 'customer');

    res.status(201).json({
      token,
      refreshToken,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        zipCode: customer.zipCode,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/customers/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const customer = await Customer.findOne({ where: { email } });

    // Lockout must be enforced BEFORE password verification — otherwise a
    // locked account can still be brute-forced (wrong guesses would keep
    // returning "invalid password" and only a correct guess would see the lock).
    if (customer && customer.lockedUntil && customer.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((customer.lockedUntil - new Date()) / 60000);
      throw new AuthenticationError(
        `Account temporarily locked. Try again in ${minutesLeft} minute(s).`
      );
    }

    // Always run bcrypt — prevents timing oracle
    const hashToCompare = customer ? customer.password : DUMMY_HASH;
    const isPasswordValid = await bcryptjs.compare(password, hashToCompare);

    if (!customer || !isPasswordValid) {
      if (customer) {
        const attempts = (customer.failedLoginAttempts || 0) + 1;
        const updates = { failedLoginAttempts: attempts };
        if (attempts >= MAX_LOGIN_ATTEMPTS) {
          updates.lockedUntil = new Date(Date.now() + LOCKOUT_MS);
        }
        await customer.update(updates);
      }
      throw new AuthenticationError('Invalid email or password');
    }

    if (customer.status !== 'active') {
      throw new AuthenticationError('Account is not active');
    }

    await customer.update({
      lastLogin: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    });

    const token = generateToken(customer, 'customer');
    const refreshToken = generateRefreshToken(customer, 'customer');

    res.json({
      token,
      refreshToken,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        zipCode: customer.zipCode,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/customers/auth/logout
router.post('/logout', customerAuthMiddleware, async (req, res) => {
  await blacklistToken(req.token);
  res.json({ success: true });
});

// POST /api/customers/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AuthenticationError('Refresh token required');

    const decoded = verifyToken(refreshToken);
    if (!decoded || decoded.tokenType !== 'refresh') {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    const customer = await Customer.findByPk(decoded.sub);
    if (!customer || customer.status !== 'active') {
      throw new AuthenticationError('Customer not found or inactive');
    }

    const newToken = generateToken(customer, 'customer');
    res.json({ token: newToken });
  } catch (error) {
    next(error);
  }
});

// GET /api/customers/auth/me
router.get('/me', customerAuthMiddleware, async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.customer.id, {
      attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry',
                              'failedLoginAttempts', 'lockedUntil'] },
    });
    if (!customer) throw new AuthenticationError('Customer not found');

    res.json({
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        zipCode: customer.zipCode,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/customers/profile
router.put('/profile', customerAuthMiddleware, async (req, res, next) => {
  try {
    const { name, phone, address, city, zipCode } = req.body;
    const customer = await Customer.findByPk(req.customer.id);
    if (!customer) throw new AuthenticationError('Customer not found');

    if (name) customer.name = sanitizeText(name);
    if (phone !== undefined) customer.phone = phone ? sanitizeText(phone) : null;
    if (address !== undefined) customer.address = address ? sanitizeText(address) : null;
    if (city !== undefined) customer.city = city ? sanitizeText(city) : null;
    if (zipCode !== undefined) customer.zipCode = zipCode ? sanitizeText(zipCode) : null;

    await customer.save();

    res.json({
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        zipCode: customer.zipCode,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/customers/auth/change-password
router.put('/change-password', customerAuthMiddleware, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw new ValidationError('Current password and new password are required');
    }
    if (!PASSWORD_REGEX.test(newPassword)) {
      throw new ValidationError(
        'New password must be at least 8 characters with uppercase, lowercase, and a number'
      );
    }

    const customer = await Customer.findByPk(req.customer.id);
    const isValid = await bcryptjs.compare(currentPassword, customer.password);
    if (!isValid) throw new AuthenticationError('Current password is incorrect');

    customer.password = newPassword;
    await customer.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /api/customers/auth/cart
router.get('/cart', customerAuthMiddleware, async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.customer.id, { attributes: ['cart'] });
    res.json({ cart: customer.cart || {} });
  } catch (err) { next(err); }
});

// PUT /api/customers/auth/cart
router.put('/cart', customerAuthMiddleware, async (req, res, next) => {
  try {
    const { cart } = req.body;
    if (typeof cart !== 'object' || cart === null) throw new ValidationError('Invalid cart data');
    await Customer.update({ cart }, { where: { id: req.customer.id } });
    res.json({ cart });
  } catch (err) { next(err); }
});

// POST /api/customers/auth/forgot-password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    // Always return success — prevents email enumeration
    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });

    if (!email) return;
    const customer = await Customer.findOne({ where: { email } });
    if (!customer) return;

    const rawToken = crypto.randomBytes(32).toString('hex');
    customer.resetToken = await bcryptjs.hash(rawToken, 12);
    customer.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await customer.save();

    const appUrl = process.env.APP_URL || 'http://localhost:3001';
    const resetLink = `${appUrl}/reset-password?email=${encodeURIComponent(email)}&token=${rawToken}`;

    const tpl = await EmailTemplate.findOne({ where: { type: 'password_reset', enabled: true } });
    if (tpl) {
      await sendEmail({
        to: email,
        subject: tpl.subject,
        body: tpl.body,
        vars: { name: customer.name || email, reset_link: resetLink },
      }).catch(err => console.error('Failed to send password reset email:', err));
    } else {
      console.log(`[DEV ONLY] Password reset link for ${email}: ${resetLink}`);
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/customers/auth/reset-password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      throw new ValidationError('Email, token, and new password are required');
    }
    if (!PASSWORD_REGEX.test(newPassword)) {
      throw new ValidationError(
        'Password must be at least 8 characters with uppercase, lowercase, and a number'
      );
    }

    const customer = await Customer.findOne({ where: { email } });
    if (!customer || !customer.resetToken || !customer.resetTokenExpiry ||
        customer.resetTokenExpiry < new Date()) {
      throw new AuthenticationError('Invalid or expired reset token');
    }

    const isValid = await bcryptjs.compare(token, customer.resetToken);
    if (!isValid) throw new AuthenticationError('Invalid or expired reset token');

    customer.password = newPassword;
    customer.resetToken = null;
    customer.resetTokenExpiry = null;
    await customer.save();

    res.json({ success: true, message: 'Password reset successfully. Please log in.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
