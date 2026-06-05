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
      len: {
        args: [6, 255],
        msg: 'Password must be at least 6 characters long',
      },
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
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
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    { fields: ['email'], unique: true },
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const hashedPassword = await bcryptjs.hash(user.password, 10);
        user.password = hashedPassword;
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const hashedPassword = await bcryptjs.hash(user.password, 10);
        user.password = hashedPassword;
      }
    },
  },
});

module.exports = User;
