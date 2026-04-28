// pages/ParentDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChildren, createChild } from '../store/childSlice';
import { logout, loginChild } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

export default function ParentDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { children } = useSelector((state) => state.child);
  const { user, token } = useSelector((state) => state.auth);

  const [newChildName, setNewChildName] = useState('');
  const [newChildPin, setNewChildPin] = useState('');
  const [loggingInChildId, setLoggingInChildId] = useState(null);

  useEffect(() => {
    dispatch(fetchChildren());
  }, [dispatch]);

  const handleCreateChild = async () => {
    if (!newChildName || !newChildPin) return alert('Введите имя и PIN');
    try {
      await dispatch(createChild({ name: newChildName, pin: newChildPin })).unwrap();
      setNewChildName('');
      setNewChildPin('');
    } catch (err) {
      alert('Ошибка создания ребёнка');
    }
  };

  const handleLoginAsChild = async (childId) => {
    const pin = prompt(`Введите PIN для ${children.find(c => c.id === childId)?.name || 'ребёнка'}:`);
    if (!pin) return;

    setLoggingInChildId(childId);
    try {
      const result = await dispatch(loginChild({ childId, pin })).unwrap();
      
      // Важно: сохраняем новый токен ребёнка
      localStorage.setItem('token', result.token);
      
      // Переходим в дашборд ребёнка
      navigate('/child/dashboard');
    } catch (err) {
      alert('Неверный PIN или ошибка входа');
    } finally {
      setLoggingInChildId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-indigo-800">Панель родителя</h1>
            <p className="text-gray-600 mt-1">Добро пожаловать, {user?.name}</p>
          </div>
          <button 
            onClick={() => dispatch(logout())} 
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium"
          >
            Выйти
          </button>
        </div>

        {/* Создание ребёнка */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">➕ Создать нового ребёнка</h2>
          <div className="flex gap-4 flex-wrap">
            <input 
              type="text" 
              placeholder="Имя ребёнка" 
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
              className="flex-1 px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-indigo-500"
            />
            <input 
              type="text" 
              placeholder="PIN (4 цифры)" 
              value={newChildPin}
              onChange={(e) => setNewChildPin(e.target.value)}
              className="w-48 px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-indigo-500"
            />
            <button 
              onClick={handleCreateChild}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold"
            >
              Создать
            </button>
          </div>
        </div>

        {/* Список детей */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold mb-6">👨‍👧 Мои дети</h2>
          
          {children.length === 0 ? (
            <p className="text-gray-500 text-center py-12">У вас пока нет детей. Создайте первого.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {children.map((child) => (
                <div key={child.id} className="border border-gray-200 rounded-3xl p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{child.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">ID: {child.id.slice(0,8)}...</p>
                    </div>
                    <button
                      onClick={() => handleLoginAsChild(child.id)}
                      disabled={loggingInChildId === child.id}
                      className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-6 py-3 rounded-2xl font-medium text-sm"
                    >
                      {loggingInChildId === child.id ? 'Вход...' : 'Войти как ребёнок'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}