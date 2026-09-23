const errorHandler = (err, req, res, next) => {
  console.error(err);
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
  res.status(500).json({ error: err.message, stack: err.stack });
};
module.exports = errorHandler;
