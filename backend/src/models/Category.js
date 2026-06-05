const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  departmentId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'department_id',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hue: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 0, max: 360 },
  },
  blurb: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isRestricted18Plus: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_restricted_18_plus',
  },
}, {
  tableName: 'categories',
  timestamps: true,
});

module.exports = Category;
