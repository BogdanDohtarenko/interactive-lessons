import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function LessonDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`http://localhost:3000/lessons/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Урок не найден');
        return res.json();
      })
      .then((data) => setLesson(data))
      .catch((err) => setError(err.message));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Вы действительно хотите удалить этот урок?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/lessons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        navigate('/lessons');
      } else {
        const err = await res.json();
        alert(err.message || 'Ошибка удаления');
      }
    } catch (e) {
      alert('Ошибка сети при удалении');
    }
  };

  if (error) return <p>{error}</p>;
  if (!lesson) return <p>Загрузка...</p>;

  const isAdminOrMod = user?.role === 'admin' || user?.role === 'moderator';

  return (
    <div>
      <Link to="/lessons">← Назад к списку</Link>
      <h2 style={{ marginTop: '15px' }}>{lesson.title}</h2>
      <p><b>Уровень:</b> {lesson.level}</p>
      <p><b>Длительность:</b> {lesson.duration} мин.</p>
      <div style={{ marginTop: '15px', padding: '15px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <p style={{ margin: 0 }}>{lesson.content}</p>
      </div>

      {isAdminOrMod && (
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <Link to={`/lessons/${lesson.id}/edit`}>
            <button>Редактировать</button>
          </Link>
          {user?.role === 'admin' && (
            <button onClick={handleDelete}>Удалить</button>
          )}
        </div>
      )}
    </div>
  );
}