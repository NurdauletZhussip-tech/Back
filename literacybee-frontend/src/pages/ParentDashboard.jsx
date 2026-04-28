// pages/ParentDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChildren, createChild } from '../store/childSlice';
import { logout, loginChild } from '../store/authSlice';
import { useNavigate, Link } from 'react-router-dom';

export default function ParentDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { children } = useSelector((state) => state.child);
  const { user } = useSelector((state) => state.auth);

  const [newChildName, setNewChildName] = useState('');
  const [newChildPin, setNewChildPin] = useState('');
  const [loggingInChildId, setLoggingInChildId] = useState(null);

  useEffect(() => {
    dispatch(fetchChildren());
  }, [dispatch]);

  const handleCreateChild = async () => {
    if (!newChildName || !newChildPin) return alert("Введите имя и PIN");
    
    try {
      await dispatch(createChild({ name: newChildName, pin: newChildPin })).unwrap();
      alert("Ребёнок создан успешно!");
      setNewChildName('');
      setNewChildPin('');
    } catch (err) {
      alert("Ошибка создания ребёнка");
    }
  };

  const handleLoginAsChild = async (childId, name) => {
    const pin = prompt(`Введите PIN для ${name}:`);
    if (!pin) return;

    setLoggingInChildId(childId);
    try {
      await dispatch(loginChild({ childId, pin })).unwrap();
      navigate('/child/dashboard');
    } catch (err) {
      alert("Неверный PIN");
    } finally {
      setLoggingInChildId(null);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: 'white', fontSize: '42px', fontWeight: 'bold' }}>
            Панель Родителя
          </h1>
          <button 
            onClick={() => dispatch(logout())}
            style={{
              background: '#ef4444',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            Выйти
          </button>
        </div>

        {/* Создать ребёнка */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>Создать ребёнка</h2>
          <div style={{ display: 'flex', gap: '15px' }}>
            <input
              type="text"
              placeholder="Имя ребёнка"
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
              style={{ flex: 1, padding: '15px', fontSize: '18px', borderRadius: '10px', border: '1px solid #ccc' }}
            />
            <input
              type="text"
              placeholder="PIN"
              value={newChildPin}
              onChange={(e) => setNewChildPin(e.target.value)}
              style={{ width: '180px', padding: '15px', fontSize: '18px', borderRadius: '10px', border: '1px solid #ccc' }}
            />
            <button 
              onClick={handleCreateChild}
              style={{
                background: '#304e50',
                color: 'white',
                padding: '15px 30px',
                border: 'none',
                borderRadius: '10px',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              Создать
            </button>
          </div>
        </div>

        {/* Список детей */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ fontSize: '28px', marginBottom: '25px' }}>Мои дети</h2>

          {children.length === 0 ? (
            <p style={{ textAlign: 'center', fontSize: '20px', color: '#666', padding: '60px 0' }}>
              У вас пока нет детей
            </p>
          ) : (
            children.map(child => (
              <div key={child.id} style={{
                border: '1px solid #ddd',
                borderRadius: '15px',
                padding: '25px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc'
              }}>
                <div>
                  <h3 style={{ fontSize: '26px', margin: '0 0 8px 0' }}>{child.name}</h3>
                  <p style={{ color: '#666' }}>ID: {child.id.slice(0,8)}...</p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  {/* Кнопка Прогресс */}
                  <Link
                    to={`/parent/child/${child.id}/progress`}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      padding: '12px 20px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    Прогресс
                  </Link>

                  {/* Кнопка Войти как ребёнок */}
                  <button
                    onClick={() => handleLoginAsChild(child.id, child.name)}
                    disabled={loggingInChildId === child.id}
                    style={{
                      background: '#f97316',
                      color: 'white',
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {loggingInChildId === child.id ? 'Входим...' : 'Войти как ребёнок'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}