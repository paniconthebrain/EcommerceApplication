const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TokenBlacklist = sequelize.define('TokenBlacklist', {
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
    primaryKey: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'token_blacklist',
  timestamps: false,
});

module.exports = TokenBlacklist;
