'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Lessons', [
      {
        title: 'Введение в Node.js и Express',
        description: 'Основы построения серверных приложений на Node.js',
        videoUrl: 'https://example.com/video1',
        duration: 45,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Работа с ORM Sequelize',
        description: 'Подключение PostgreSQL, создание моделей и миграций',
        videoUrl: 'https://example.com/video2',
        duration: 60,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Lessons', null, {});
  }
};