import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import LessonList from './pages/LessonList';
import LessonForm from './pages/LessonForm';
import LessonDetails from './pages/LessonDetails';
import Home from './pages/Home';

function ProtectedRoute({ user, allowedRoles, children }) {
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/auth');
  };

  return (
    <div style={{ padding: '10px' }}>
      <nav style={{ paddingBottom: '10px', marginBottom: '20px', borderBottom: '1px solid #ccc', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <Link to="/">Главная</Link>
        <Link to="/lessons">Уроки</Link>
        {(user?.role === 'admin' || user?.role === 'moderator') && (
          <Link to="/lessons/new">Создать урок</Link>
        )}

        <div style={{ marginLeft: 'auto' }}>
          {user ? (
            <span>
              {user.email} ({user.role}){' '}
              <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Выйти</button>
            </span>
          ) : (
            <Link to="/auth">Вход / Регистрация</Link>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lessons" element={<LessonList user={user} />} />
        <Route 
          path="/lessons/new" 
          element={
            <ProtectedRoute user={user} allowedRoles={['admin', 'moderator']}>
              <LessonForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/lessons/:id/edit" 
          element={
            <ProtectedRoute user={user} allowedRoles={['admin', 'moderator']}>
              <LessonForm />
            </ProtectedRoute>
          } 
        />
        <Route path="/lessons/:id" element={<LessonDetails user={user} />} />
        <Route path="/auth" element={<AuthPage onLoginSuccess={fetchUser} />} />
      </Routes>
    </div>
  );
}