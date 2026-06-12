const { DataTypes } = require('sequelize');
const bcryptjs = require('bcryptjs');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: { args: [8, 255], msg: 'Password must be at least 8 characters long' },
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: { args: [1, 100], msg: 'Name must be between 1 and 100 characters' },
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: { args: [0, 20], msg: 'Phone must be 20 characters or fewer' },
    },
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: { args: [0, 200], msg: 'Address must be 200 characters or fewer' },
    },
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: { args: [0, 100], msg: 'City must be 100 characters or fewer' },
    },
  },
  zipCode: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'zip_code',
    validate: {
      len: { args: [0, 20], msg: 'Zip code must be 20 characters or fewer' },
    },
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'banned'),
    defaultValue: 'active',
  },
  lastLogin: {
    type: DataTypes.DATE,
    field: 'last_login',
    allowNull: true,
  },
  failedLoginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'failed_login_attempts',
  },
  lockedUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'locked_until',
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'reset_token',
  },
  resetTokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reset_token_expiry',
  },
  cart: {
    type: DataTypes.JSON,
    defaultValue: {},
    allowNull: false,
  },
}, {
  tableName: 'customers',
  timestamps: true,
  indexes: [{ fields: ['email'], unique: true }],
  hooks: {
    beforeCreate: async (customer) => {
      if (customer.password) {
        customer.password = await bcryptjs.hash(customer.password, 12);
      }
    },
    beforeUpdate: async (customer) => {
      if (customer.changed('password')) {
        customer.password = await bcryptjs.hash(customer.password, 12);
      }
    },
  },
});

module.exports = Customer;
