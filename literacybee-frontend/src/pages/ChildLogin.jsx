import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginChild } from '../store/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';

export default function ChildLogin() {
  const addToast = useToast();
  const [childId, setChildId] = useState('');
  const [pin, setPin]         = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(loginChild({ childId, pin })).unwrap();
      navigate('/child/dashboard');
    } catch {
      addToast('Неверный ID или PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ fontSize: '2.5rem', marginBottom: 4 }}>🚀</div>
          <div className="auth-logo-text">Вход для ребёнка</div>
          <div className="auth-logo-sub">Введи свой ID и PIN от родителя</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">ID ребёнка</label>
            <input
              type="text" className="auth-input" placeholder="Твой ID"
              value={childId} onChange={e => setChildId(e.target.value)} required
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">PIN-код</label>
            <input
              type="password" className="auth-input" placeholder="••••"
              value={pin} onChange={e => setPin(e.target.value)} required
            />
          </div>
          <button type="submit" className="btn btn-orange btn-full" disabled={loading}
            style={{ marginTop: 8 }}>
            {loading ? 'Входим...' : '🚀 Войти'}
          </button>
        </form>

        <div className="auth-link-row">
          <Link to="/login" className="auth-link">← Вход для родителя</Link>
        </div>
      </div>
    </div>
  );
}