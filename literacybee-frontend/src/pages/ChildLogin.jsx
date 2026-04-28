import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginChild } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

export default function ChildLogin() {
  const [childId, setChildId] = useState('');
  const [pin, setPin] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(loginChild({ childId, pin })).unwrap();
    navigate('/child/dashboard');
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Вход для ребёнка</h2>
        <input type="text" placeholder="ID ребёнка" value={childId} onChange={(e) => setChildId(e.target.value)} className="w-full p-3 border rounded-lg mb-3" required />
        <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full p-3 border rounded-lg mb-4" required />
        <button type="submit" className="w-full bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600">Войти</button>
      </form>
    </div>
  );
}