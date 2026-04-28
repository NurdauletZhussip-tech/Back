import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginParent } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginParent({ email, password })).unwrap();
      navigate('/parent/dashboard');
    } catch (err) {
      alert('Неверный email или пароль');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }} className="gradient-text">LiteracyBee</h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Войдите в аккаунт родителя</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input type="email" className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ marginBottom: '16px' }} />
          <input type="password" className="input" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required style={{ marginBottom: '24px' }} />
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Войти</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem' }}>
          Нет аккаунта? <a href="/register" style={{ color: '#6366f1', fontWeight: 500 }}>Зарегистрируйтесь</a>
        </p>
      </div>
    </div>
  );
}