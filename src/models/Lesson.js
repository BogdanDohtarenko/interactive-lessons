const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Lesson = sequelize.define('Lesson', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, unique: true, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  duration: { type: DataTypes.INTEGER, allowNull: false },
  level: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Beginner' },
  authorId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = Lesson;
