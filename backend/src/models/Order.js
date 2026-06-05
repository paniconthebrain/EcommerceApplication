const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'customer_id',
  },
  shopId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'shop_id',
  },
  status: {
    type: DataTypes.ENUM('new', 'picking', 'ready', 'completed', 'cancelled'),
    defaultValue: 'new',
  },
  orderType: {
    type: DataTypes.ENUM('delivery', 'pickup'),
    allowNull: false,
    field: 'order_type',
  },
  timeSlot: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'time_slot',
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  pricing: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
  },
  delivery: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
  },
  fulfillment: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
  },
}, {
  tableName: 'orders',
  timestamps: true,
  indexes: [
    { fields: ['shop_id', 'status', 'created_at'] },
    { fields: ['customer_id'] },
  ],
});

module.exports = Order;
