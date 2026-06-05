const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  shopId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'shop_id',
  },
  productId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'product_id',
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  par: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  lastReceived: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_received',
  },
  lastAdjusted: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_adjusted',
  },
}, {
  tableName: 'inventory',
  timestamps: true,
  indexes: [
    { fields: ['shop_id', 'product_id'], unique: true },
  ],
});

module.exports = Inventory;
