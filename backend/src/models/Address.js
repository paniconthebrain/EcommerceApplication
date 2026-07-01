const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Address = sequelize.define('Address', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'customer_id',
  },
  label: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: { args: [0, 50], msg: 'Label must be 50 characters or fewer' },
    },
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: { args: [1, 200], msg: 'Address must be between 1 and 200 characters' },
    },
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: { args: [1, 100], msg: 'City must be between 1 and 100 characters' },
    },
  },
  zipCode: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'zip_code',
    validate: {
      len: { args: [1, 20], msg: 'Zip code must be between 1 and 20 characters' },
    },
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_default',
  },
}, {
  tableName: 'addresses',
  timestamps: true,
  indexes: [{ fields: ['customer_id'] }],
});

module.exports = Address;
