require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('./db');
const User = require('./models/User');
const Lesson = require('./models/Lesson');
const { authGuard, roleGuard } = require('./middleware/authMiddleware');
const { validateRegister } = require('./middleware/validate');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// Регистрация с Joi-валидацией пароля
app.post('/auth/register', validateRegister, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (e) { next(e); }
});

// Логин
app.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(429).json({ message: 'Аккаунт временно заблокирован' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      user.failedAttempts += 1;
      if (user.failedAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();
      return res.status(401).json({ message: 'Неверный пароль' });
    }

    user.failedAttempts = 0;
    user.lockUntil = null;
    
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.json({ token });
  } catch (e) { next(e); }
});

app.get('/auth/me', authGuard, async (req, res) => {
  const user = await User.findByPk(req.user.id, { attributes: { exclude: ['passwordHash', 'refreshToken'] } });
  res.json(user);
});

// CRUD для сущности Lesson (Интерактивные уроки)
// Публичный доступ к списку уроков
app.get('/lessons', async (req, res, next) => {
  try {
    const lessons = await Lesson.findAll();
    res.json(lessons);
  } catch (e) { next(e); }
});

// Создание урока (только moderator и admin)
app.post('/lessons', authGuard, roleGuard(['moderator', 'admin']), async (req, res, next) => {
  try {
    const lesson = await Lesson.create(req.body);
    res.status(201).json(lesson);
  } catch (e) { next(e); }
});

// Удаление урока (только admin)
app.delete('/lessons/:id', authGuard, roleGuard(['admin']), async (req, res, next) => {
  try {
    await Lesson.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Урок удален' });
  } catch (e) { next(e); }
});

app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.sync({ alter: true });
    app.listen(process.env.PORT, () => console.log(API работает на порту ));
  } catch (e) {
    console.error(e);
  }
};
start();
