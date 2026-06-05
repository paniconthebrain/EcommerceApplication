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
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  zipCode: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'zip_code',
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
}, {
  tableName: 'customers',
  timestamps: true,
  indexes: [
    { fields: ['email'], unique: true },
  ],
  hooks: {
    beforeCreate: async (customer) => {
      if (customer.password) {
        const hashedPassword = await bcryptjs.hash(customer.password, 10);
        customer.password = hashedPassword;
      }
    },
    beforeUpdate: async (customer) => {
      if (customer.changed('password')) {
        const hashedPassword = await bcryptjs.hash(customer.password, 10);
        customer.password = hashedPassword;
      }
    },
  },
});

module.exports = Customer;
