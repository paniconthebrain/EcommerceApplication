const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  supplierId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'supplier_id',
  },
  shopId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'shop_id',
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'in-transit', 'arrived', 'received'),
    defaultValue: 'scheduled',
  },
  eta: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  receivedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'received_at',
  },
  lineItems: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    field: 'line_items',
  },
}, {
  tableName: 'purchase_orders',
  timestamps: true,
  indexes: [
    { fields: ['shop_id', 'status'] },
  ],
});

module.exports = PurchaseOrder;
