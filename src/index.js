require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const sequelize = require('./db');
const User = require('./models/User');
const Lesson = require('./models/Lesson');
const { authGuard, roleGuard } = require('./middleware/authMiddleware');
const { validateRegister } = require('./middleware/validate');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

app.post('/auth/register', validateRegister, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (e) { next(e); }
});

app.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(429).json({ message: 'Account is locked due to too many failed attempts' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      user.failedAttempts += 1;
      if (user.failedAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();
      return res.status(401).json({ message: 'Invalid password' });
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

app.get('/lessons', async (req, res, next) => {
  try {
    const { search, minDuration } = req.query;
    const where = {};

    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }
    if (minDuration) {
      where.duration = { [Op.gte]: Number(minDuration) };
    }

    const lessons = await Lesson.findAll({ where });
    res.json(lessons);
  } catch (e) { next(e); }
});

app.get('/lessons/:id', async (req, res, next) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json(lesson);
  } catch (e) { next(e); }
});

app.post('/lessons', authGuard, roleGuard(['moderator', 'admin']), async (req, res, next) => {
  try {
    const lesson = await Lesson.create(req.body);
    res.status(201).json(lesson);
  } catch (e) { next(e); }
});

app.put('/lessons/:id', authGuard, roleGuard(['moderator', 'admin']), async (req, res, next) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    await lesson.update(req.body);
    res.json(lesson);
  } catch (e) { next(e); }
});

app.delete('/lessons/:id', authGuard, roleGuard(['admin']), async (req, res, next) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    await lesson.destroy();
    res.json({ message: 'Lesson deleted successfully' });
  } catch (e) { next(e); }
});

app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.sync({ alter: true });
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log('API running on port ' + port));
  } catch (e) {
    console.error(e);
  }
};
start();