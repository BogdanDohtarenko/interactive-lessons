const express = require('express');
const cors = require('cors');
const Sentry = require('@sentry/node');
const { sequelize } = require('./models');
const lessonRoutes = require('./routes/lessonRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Инициализация Sentry (при наличии DSN)
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}

app.use(cors());
app.use(express.json());

// Подсчет метрик
let totalRequests = 0;
const startTime = Date.now();

app.use((req, res, next) => {
  totalRequests++;
  next();
});

// Эндпоинт проверки доступности (для UptimeRobot)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime(), timestamp: new Date() });
});

// Дашборд метрик (время работы, память, количество запросов)
app.get('/metrics', (req, res) => {
  const memoryUsage = process.memoryUsage();
  res.json({
    status: 'online',
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    totalRequests,
    memory: {
      rssMB: (memoryUsage.rss / 1024 / 1024).toFixed(2),
      heapTotalMB: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
      heapUsedMB: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2)
    }
  });
});

// Искусственная ошибка для проверки Sentry
app.get('/debug-error', (req, res) => {
  throw new Error('Тестовая ошибка бэкенда для Sentry');
});

// Основные маршруты
app.use('/lessons', lessonRoutes);

// Обработка несуществующих маршрутов (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});

// Логирование ошибок в Sentry
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// Глобальный обработчик ошибок
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

if (require.main === module) {
  startServer();
}

module.exports = app;