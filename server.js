

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const lessonRoutes = require('./routes/lessonRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

const { Logtail } = require("@logtail/node");
const logtail = new Logtail("3PaGQJf7kB9BJ4J2nEQxHbAX", {
  endpoint: "https://s2778457.us-west-2a.betterstackdata.com"
});

// Middleware для логирования
app.use(async (req, res, next) => {
  logtail.info(`[Backend Log] ${req.method} ${req.url}`);
  await logtail.flush();
  next();
});

app.use(cors());
app.use(express.json());

// Подсчет метрик
let totalRequests = 0;
const startTime = Date.now();

app.use((req, res, next) => {
  totalRequests++;
  next();
});

// 1. Маршруты (Routes)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime(), timestamp: new Date() });
});

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

// Эндпоинты проверки Sentry
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

app.get('/debug-error', (req, res) => {
  throw new Error('Тестовая ошибка бэкенда для Sentry');
});

app.use('/lessons', lessonRoutes);

// 2. Обработка несуществующих маршрутов (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});

// 3. Обработка ошибок Sentry и глобальный обработчик
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

app.use(async (err, req, res, next) => {
  console.error("Перехвачена ошибка:", err.stack);
  
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
    await Sentry.flush(2000); // Ожидаем отправки пакета по сети
  }

  res.status(500).json({ error: err.message || 'Внутренняя ошибка сервера' });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Подключение к базе данных PostgreSQL прошло успешно.');
    app.listen(PORT, () => {
      console.log(`Сервер запущен на https://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;