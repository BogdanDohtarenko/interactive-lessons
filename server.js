const express = require('express');
const { sequelize } = require('./models');
const lessonRoutes = require('./routes/lessonRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/lessons', lessonRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Внутренняя ошибка сервера' });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Подключение к базе данных PostgreSQL прошло успешно.');
    app.listen(PORT, () => {
      console.log(`Сервер запущен на http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error);
  }
}

startServer();