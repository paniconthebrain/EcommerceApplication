const { DataTypes } = require('sequelize');
const bcryptjs = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
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
  userType: {
    type: DataTypes.ENUM('admin', 'staff'),
    defaultValue: 'staff',
  },
  shopId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'shop_id',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
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
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [{ fields: ['email'], unique: true }],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcryptjs.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcryptjs.hash(user.password, 12);
      }
    },
  },
});

module.exports = User;
