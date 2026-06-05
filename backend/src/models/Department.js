const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  temperatureZone: {
    type: DataTypes.ENUM('frozen', 'chilled', 'ambient'),
    allowNull: true,
    field: 'temperature_zone',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'departments',
  timestamps: true,
});

module.exports = Department;
