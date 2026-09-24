const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('user', 'moderator', 'admin'), defaultValue: 'user' },
  refreshToken: { type: DataTypes.STRING },
  failedAttempts: { type: DataTypes.INTEGER, defaultValue: 0 },
  lockUntil: { type: DataTypes.DATE }
});

module.exports = User;
