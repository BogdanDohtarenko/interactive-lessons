import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (isRegister) {
        await api.post('/auth/register', { email, password });
        setMessage('Регистрация прошла успешно! Теперь войдите в аккаунт.');
        setIsRegister(false);
      } else {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        navigate('/lessons');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Произошла ошибка при аутентификации.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2>{isRegister ? 'Регистрация' : 'Вход в систему'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label>Пароль:</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <button type="submit">
          {isRegister ? 'Зарегистрироваться' : 'Войти'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setIsRegister(!isRegister);
          setError('');
          setMessage('');
        }}
        style={{ marginTop: '10px', width: '100%' }}
      >
        {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
      </button>
    </div>
  );
}