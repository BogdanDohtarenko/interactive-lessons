const { Lesson } = require('../models');

exports.getAllLessons = async (req, res, next) => {
  try {
    const lessons = await Lesson.findAll();
    res.json(lessons);
  } catch (error) {
    next(error);
  }
};

exports.getLessonById = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Урок не найден' });
    }
    res.json(lesson);
  } catch (error) {
    next(error);
  }
};

exports.createLesson = async (req, res, next) => {
  try {
    const { title, description, videoUrl, duration } = req.body;
    const newLesson = await Lesson.create({ title, description, videoUrl, duration });
    res.status(201).json(newLesson);
  } catch (error) {
    next(error);
  }
};

exports.updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Урок не найден' });
    }
    const { title, description, videoUrl, duration } = req.body;
    await lesson.update({ title, description, videoUrl, duration });
    res.json(lesson);
  } catch (error) {
    next(error);
  }
};

exports.deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Урок не найден' });
    }
    await lesson.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};