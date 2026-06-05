const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Supplier = sequelize.define('Supplier', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  leadTime: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'lead_time',
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isEmail: true },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contactName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'contact_name',
  },
  deliveryModel: {
    type: DataTypes.ENUM('dsd', 'wholesale', 'local_perishable'),
    allowNull: false,
    defaultValue: 'wholesale',
    field: 'delivery_model',
  },
  deliveryDays: {
    // JSON array of day names e.g. ["monday", "wednesday", "friday"]
    type: DataTypes.JSON,
    allowNull: true,
    field: 'delivery_days',
  },
  minimumOrderAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'minimum_order_amount',
  },
  paymentTerms: {
    // e.g. 'cod', 'net30', 'weekly'
    type: DataTypes.STRING,
    allowNull: true,
    field: 'payment_terms',
  },
}, {
  tableName: 'suppliers',
  timestamps: true,
});

module.exports = Supplier;
