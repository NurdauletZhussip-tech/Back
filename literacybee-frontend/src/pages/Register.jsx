import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { registerParent } from '../store/authSlice';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(registerParent({ email, password, name })).unwrap();
      navigate('/parent/dashboard');
    } catch (err) {
      alert(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-text">📝 Регистрация</div>
          <div className="auth-logo-sub">Создайте аккаунт родителя</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Имя</label>
            <input
              type="text" className="auth-input" placeholder="Как вас зовут?"
              value={name} onChange={e => setName(e.target.value)} required
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              type="email" className="auth-input" placeholder="ivan@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Пароль</label>
            <input
              type="password" className="auth-input" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}
            style={{ marginTop: 8 }}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="auth-link-row">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="auth-link">Войти</Link>
        </div>
      </div>
    </div>
  );
}