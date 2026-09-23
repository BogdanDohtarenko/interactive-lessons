'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Lessons', 'duration', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Lessons', 'duration');
  }
};