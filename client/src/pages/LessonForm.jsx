import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function LessonForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    duration: '',
    level: 'Beginner',
    authorId: 1,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetch(`http://localhost:3000/lessons/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            title: data.title || '',
            slug: data.slug || '',
            content: data.content || '',
            duration: data.duration || '',
            level: data.level || 'Beginner',
            authorId: data.authorId || 1,
          });
        })
        .catch((err) => console.error(err));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const token = localStorage.getItem('token');
    const url = isEdit
      ? `http://localhost:3000/lessons/${id}`
      : 'http://localhost:3000/lessons';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          duration: Number(formData.duration),
        }),
      });

      if (res.ok) {
        navigate('/lessons');
      } else {
        const errData = await res.json();
        setError(errData.message || 'Ошибка сохранения урока');
      }
    } catch (err) {
      setError('Ошибка сети при отправке формы');
    }
  };

  return (
    <div>
      <h2>{isEdit ? 'Редактировать урок' : 'Создать урок'}</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
        <input
          type="text"
          name="title"
          placeholder="Заголовок"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="slug"
          placeholder="Slug (уникальная ссылка)"
          value={formData.slug}
          onChange={handleChange}
          required
        />
        <textarea
          name="content"
          placeholder="Содержание урока"
          value={formData.content}
          onChange={handleChange}
          rows="5"
          required
        />
        <input
          type="number"
          name="duration"
          placeholder="Длительность (мин)"
          value={formData.duration}
          onChange={handleChange}
          required
        />
        <select name="level" value={formData.level} onChange={handleChange}>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <button type="submit">{isEdit ? 'Сохранить изменения' : 'Создать'}</button>
      </form>
    </div>
  );
}