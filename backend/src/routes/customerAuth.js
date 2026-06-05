const express = require('express');
const bcryptjs = require('bcryptjs');
const { Customer } = require('../models');
const { generateToken, verifyToken } = require('../utils/jwt');
const customerAuthMiddleware = require('../middleware/customerAuthMiddleware');
const { AuthenticationError, ValidationError } = require('../utils/errors');

const router = express.Router();

// POST /api/customers/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, confirmPassword, name, phone } = req.body;

    // Validation
    if (!email || !password || !confirmPassword || !name) {
      throw new ValidationError('Email, password, confirm password, and name are required');
    }

    if (password !== confirmPassword) {
      throw new ValidationError('Passwords do not match');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long');
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ where: { email } });
    if (existingCustomer) {
      throw new AuthenticationError('Customer with this email already exists');
    }

    // Create customer
    const customer = await Customer.create({
      email,
      password, // Will be hashed by model hook
      name,
      phone: phone || null,
      status: 'active',
    });

    // Generate token
    const token = generateToken(customer, 'customer');

    res.status(201).json({
      token,
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

    // Find customer
    const customer = await Customer.findOne({ where: { email } });
    if (!customer) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await bcryptjs.compare(password, customer.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if customer is active
    if (customer.status !== 'active') {
      throw new AuthenticationError('Customer account is not active');
    }

    // Update last login
    customer.lastLogin = new Date();
    await customer.save();

    // Generate token
    const token = generateToken(customer, 'customer');

    res.json({
      token,
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
router.post('/logout', customerAuthMiddleware, (req, res) => {
  // Token is invalidated on client side (localStorage removal)
  // Server doesn't maintain token blacklist for simplicity
  res.json({ success: true });
});

// GET /api/customers/auth/me
router.get('/me', customerAuthMiddleware, async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.customer.id);
    if (!customer) {
      throw new AuthenticationError('Customer not found');
    }

    // Refresh token if needed (optional)
    const token = generateToken(customer, 'customer');

    res.json({
      token,
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
    if (!customer) {
      throw new AuthenticationError('Customer not found');
    }

    // Update fields
    if (name) customer.name = name;
    if (phone !== undefined) customer.phone = phone || null;
    if (address !== undefined) customer.address = address || null;
    if (city !== undefined) customer.city = city || null;
    if (zipCode !== undefined) customer.zipCode = zipCode || null;

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

module.exports = router;
