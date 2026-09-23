// models/course.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    static associate(models) {
      Course.hasMany(models.Lesson, {
        foreignKey: 'courseId',
        as: 'lessons',
        onDelete: 'CASCADE'
      });
    }
  }
  Course.init({
    title: { type: DataTypes.STRING, allowNull: false }
  }, {
    sequelize,
    modelName: 'Course',
    tableName: 'Courses'
  });
  return Course;
};