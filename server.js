const express = require('express');
const app = express();

app.use(express.json());

const PORT = 3000;

let lessons = [
  { id: 1, title: 'Введение в Node.js', description: 'Основы платформы', videoUrl: 'https://example.com/video1' },
  { id: 2, title: 'Express.js', description: 'Создание серверных приложений', videoUrl: 'https://example.com/video2' }
];
let nextId = 3;

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});


app.get('/lessons', (req, res) => {
  res.json(lessons);
});

app.get('/lessons/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const lesson = lessons.find(l => l.id === id);
  if (!lesson) {
    return res.status(404).json({ error: 'Урок не найден' });
  }
  res.json(lesson);
});

app.post('/lessons', (req, res) => {
  const { title, description, videoUrl } = req.body;
  if (!title || !description || !videoUrl) {
    return res.status(400).json({ error: 'Поля title, description, videoUrl обязательны' });
  }
  const newLesson = { id: nextId++, title, description, videoUrl };
  lessons.push(newLesson);
  res.status(201).json(newLesson);
});

app.put('/lessons/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = lessons.findIndex(l => l.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Урок не найден' });
  }
  const { title, description, videoUrl } = req.body;
  if (!title || !description || !videoUrl) {
    return res.status(400).json({ error: 'Все поля (title, description, videoUrl) обязательны' });
  }
  lessons[index] = { id, title, description, videoUrl };
  res.json(lessons[index]);
});

app.delete('/lessons/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = lessons.findIndex(l => l.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Урок не найден' });
  }
  lessons.splice(index, 1);
  res.status(204).send();
});

