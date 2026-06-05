const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockTransfer = sequelize.define('StockTransfer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  fromShopId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'from_shop_id',
  },
  toShopId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'to_shop_id',
  },
  status: {
    type: DataTypes.ENUM('pending', 'in-transit', 'received'),
    defaultValue: 'pending',
  },
  lineItems: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    field: 'line_items',
  },
  initiatedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'initiated_by',
  },
  receivedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'received_by',
  },
  receivedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'received_at',
  },
}, {
  tableName: 'stock_transfers',
  timestamps: true,
});

module.exports = StockTransfer;
