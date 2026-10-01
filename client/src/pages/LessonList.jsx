import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://interactive-lessons-kappa.vercel.app';

export default function LessonList({ user }) {
  const [lessons, setLessons] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [minDuration, setMinDuration] = useState('');

  // 1. Debounce: обновляем debouncedSearch через 500 мс после окончания ввода
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchLessons = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (debouncedSearch) queryParams.append('search', debouncedSearch);
      if (minDuration) queryParams.append('minDuration', minDuration);

      const res = await fetch(`https://interactive-lessons-kappa.vercel.app/lessons?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLessons(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [debouncedSearch, minDuration]);
  
  const handleDelete = async (id) => {
    if (!window.confirm('Вы действительно хотите удалить этот урок?')) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`https://interactive-lessons-kappa.vercel.app/lessons/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setLessons(lessons.filter((lesson) => lesson.id !== id));
      } else {
        const err = await res.json();
        alert(err.message || 'Ошибка при удалении');
      }
    } catch (e) {
      alert('Ошибка сети при удалении');
    }
  };

  const isAdminOrMod = user?.role === 'admin' || user?.role === 'moderator';

  return (
    <div>
      <h2>Список уроков</h2>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '6px' }}
        />
        <input
          type="number"
          placeholder="Мин. длительность (мин)..."
          value={minDuration}
          onChange={(e) => setMinDuration(e.target.value)}
          style={{ padding: '6px' }}
        />
      </div>

      {lessons.length === 0 ? (
        <p>Уроки не найдены</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {lessons.map((lesson) => (
            <li
              key={lesson.id}
              style={{
                border: '1px solid #ccc',
                padding: '12px',
                marginBottom: '10px',
                borderRadius: '4px',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0' }}>
                <Link to={`/lessons/${lesson.id}`}>{lesson.title}</Link>
              </h3>
              <p style={{ margin: '4px 0' }}>Длительность: {lesson.duration} мин.</p>
              <p style={{ margin: '4px 0' }}>Уровень: {lesson.level}</p>

              {isAdminOrMod && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                  <Link to={`/lessons/${lesson.id}/edit`}>
                    <button>Редактировать</button>
                  </Link>
                  {user?.role === 'admin' && (
                    <button onClick={() => handleDelete(lesson.id)}>Удалить</button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}