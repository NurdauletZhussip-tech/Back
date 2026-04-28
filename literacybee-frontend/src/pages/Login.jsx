import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginParent } from '../store/authSlice';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(loginParent({ email, password })).unwrap();
      navigate('/parent/dashboard');
    } catch {
      alert('Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-text">🐝 LiteracyBee</div>
          <div className="auth-logo-sub">Войдите в аккаунт родителя</div>
        </div>

        <form onSubmit={handleSubmit}>
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
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>

        <div className="auth-link-row">
          Нет аккаунта?{' '}
          <Link to="/register" className="auth-link">Зарегистрируйтесь</Link>
        </div>
        <div className="auth-link-row" style={{ marginTop: 8 }}>
          <Link to="/child-login" className="auth-link">🚀 Вход для ребёнка</Link>
        </div>
      </div>
    </div>
  );
}