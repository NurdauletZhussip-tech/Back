import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChildren, createChild, fetchChildProgress } from '../store/childSlice';
import { logout, loginAsChild } from '../store/authSlice';
import { Link, useNavigate } from 'react-router-dom';

export default function ParentDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { children } = useSelector((state) => state.child);
  const [newChildName, setNewChildName] = useState('');
  const [newChildPin, setNewChildPin] = useState('');
  const [loggingInChildId, setLoggingInChildId] = useState(null);

  useEffect(() => {
    dispatch(fetchChildren());
  }, [dispatch]);

  const handleCreateChild = async () => {
    if (!newChildName || !newChildPin) return;
    await dispatch(createChild({ name: newChildName, pin: newChildPin })).unwrap();
    setNewChildName('');
    setNewChildPin('');
    dispatch(fetchChildren());
  };

  const handleLoginAsChild = async (childId, childPin) => {
    setLoggingInChildId(childId);
    try {
      await dispatch(loginAsChild({ childId, pin: childPin })).unwrap();
      navigate('/child/dashboard');
    } catch (err) {
      alert('Ошибка входа: ' + err.message);
    } finally {
      setLoggingInChildId(null);
    }
  };
  <button
    onClick={async () => {
      const pin = prompt(`Введите PIN для ${child.name}`);
      if (!pin) return;
      const res = await fetch('http://localhost:3000/api/auth/child/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId: child.id, pin })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = '/child/dashboard';
      } else {
        alert('Неверный PIN');
      }
    }}
    className="btn btn-orange"
  >
    Войти как ребёнок
  </button>

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="gradient-text">Панель родителя</h1>
        <button onClick={() => dispatch(logout())} className="btn btn-danger">Выйти</button>
      </div>

      {/* Создание ребёнка */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>➕ Создать ребёнка</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <input type="text" placeholder="Имя" value={newChildName} onChange={(e) => setNewChildName(e.target.value)} className="input" style={{ flex: 2 }} />
          <input type="text" placeholder="PIN (цифры)" value={newChildPin} onChange={(e) => setNewChildPin(e.target.value)} className="input" style={{ flex: 1 }} />
          <button onClick={handleCreateChild} className="btn btn-primary">Создать</button>
        </div>
      </div>

      {/* Список детей */}
      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>👧 Мои дети</h2>
        {children.length === 0 && <p>Нет детей. Создайте первого.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {children.map((child) => (
            <div key={child.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '24px' }}>
              <div>
                <h3 style={{ fontWeight: 600 }}>{child.name}</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>ID: {child.id.slice(0,8)}…</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to={`/parent/child/${child.id}`} className="btn btn-secondary" style={{ padding: '6px 16px' }}>Прогресс</Link>
                <button onClick={() => handleLoginAsChild(child.id, prompt(`Введите PIN для ${child.name}:`))} className="btn btn-orange" style={{ padding: '6px 16px' }} disabled={loggingInChildId === child.id}>
                  {loggingInChildId === child.id ? 'Вход...' : 'Войти как ребёнок'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}