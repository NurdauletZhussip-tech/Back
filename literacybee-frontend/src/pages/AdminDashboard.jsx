// AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLessons, createLesson } from '../store/lessonSlice';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { lessons, meta, loading, error } = useSelector((state) => state.lesson);
  const { user } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    title: '',
    description: '',
    order_index: 1,
    xp_reward: 50,
    is_published: true
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(fetchLessons({ page: 1, limit: 10 }));
    }
  }, [dispatch, user?.role]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Название урока обязательно!');
      return;
    }
    dispatch(createLesson(form));
    // Сброс формы
    setForm({
      title: '',
      description: '',
      order_index: (lessons.length || 0) + 1,
      xp_reward: 50,
      is_published: true
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              name === 'order_index' || name === 'xp_reward' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-white">🔧 Admin Panel — Управление уроками</h1>

      {user?.role !== 'admin' && <p className="text-red-400">Ошибка: Доступ только для администратора</p>}

      {/* Форма создания */}
      <div className="bg-gray-800 p-6 rounded-xl mb-10">
        <h2 className="text-xl font-semibold mb-4 text-white">Создать новый урок</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Название урока"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
            required
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Описание (необязательно)"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-24"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Порядок (order_index)</label>
              <input
                name="order_index"
                type="number"
                value={form.order_index}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">XP за урок</label>
              <input
                name="xp_reward"
                type="number"
                value={form.xp_reward}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg w-full"
          >
            Создать урок (сразу опубликован)
          </button>
        </form>
      </div>

      {/* Список уроков */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Существующие уроки</h2>
        {lessons.length === 0 ? (
          <p className="text-gray-400">Уроков пока нет</p>
        ) : (
          <div className="space-y-3">
            {lessons.map(lesson => (
              <div key={lesson.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-medium text-white">{lesson.title}</div>
                  <div className="text-sm text-gray-400">Порядок: {lesson.order_index} | XP: {lesson.xp_reward}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs ${lesson.is_published ? 'bg-green-500' : 'bg-red-500'}`}>
                  {lesson.is_published ? 'Опубликован' : 'Черновик'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}