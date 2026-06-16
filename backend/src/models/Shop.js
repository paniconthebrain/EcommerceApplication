const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Shop = sequelize.define('Shop', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  hours: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tint: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  allowStaffPO: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'allow_staff_po',
  },
  pickupTime: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'pickup_time',
  },
}, {
  tableName: 'shops',
  timestamps: true,
});

module.exports = Shop;
