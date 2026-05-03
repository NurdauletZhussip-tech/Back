import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { useToast } from '../components/ToastProvider';

export default function AdminDashboard() {
  const addToast = useToast();
  const [units, setUnits] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [currentExercises, setCurrentExercises] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState('');

  // Формы
  const [unitForm, setUnitForm] = useState({ title: '', description: '', order_index: '' });
  const [lessonForm, setLessonForm] = useState({ 
    title: '', 
    description: '', 
    xp_reward: 50, 
    unit_id: '' 
  });
  const [exerciseForm, setExerciseForm] = useState({
    type: 'phonics',
    question_data: { question: '' },
    correct_answer: '',
    xp_value: 10,
    order_index: 0,
  });

  // Загрузка данных
  const fetchUnits = useCallback(async () => {
    try {
      const res = await api.get('/admin/units');
      setUnits(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchLessons = useCallback(async () => {
    try {
      const res = await api.get('/admin/lessons');
      setLessons(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchExercises = useCallback(async (lessonId) => {
    if (!lessonId) return;
    setSelectedLessonId(lessonId);
    try {
      const res = await api.get(`/admin/lessons/${lessonId}/exercises`);
      setCurrentExercises(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchUnits();
    fetchLessons();
  }, [fetchUnits, fetchLessons]);

  // Создание
  const handleCreateUnit = async (e) => {
    e.preventDefault();
    if (!unitForm.title.trim()) { addToast("Название юнита обязательно"); return; }
    try {
      await api.post('/admin/units', unitForm);
      addToast("✅ Юнит создан!");
      setUnitForm({ title: '', description: '', order_index: '' });
      fetchUnits();
    } catch (err) {
      addToast("Ошибка: " + (err.response?.data?.error || err.message));
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!lessonForm.title.trim() || !lessonForm.unit_id) { addToast("Заполните название и выберите юнит"); return; }
    try {
      await api.post('/admin/lessons', lessonForm);
      addToast("✅ Урок создан!");
      setLessonForm({ title: '', description: '', xp_reward: 50, unit_id: lessonForm.unit_id });
      fetchLessons();
    } catch (err) {
      addToast("Ошибка: " + (err.response?.data?.error || err.message));
    }
  };

  const handleCreateExercise = async (e) => {
    e.preventDefault();
    if (!selectedLessonId) { addToast("Выберите урок!"); return; }
    try {
      await api.post(`/admin/lessons/${selectedLessonId}/exercises`, exerciseForm);
      addToast("✅ Упражнение добавлено!");
      fetchExercises(selectedLessonId);
      setExerciseForm({
        type: 'phonics',
        question_data: { question: '' },
        correct_answer: '',
        xp_value: 10,
        order_index: currentExercises.length + 1,
      });
    } catch (err) {
      addToast("Ошибка: " + (err.response?.data?.error || err.message));
    }
  };

   return (
    <div className="admin-fullscreen">
      <div className="admin-header">
        <h1>🛠 Админ-панель LiteracyBee</h1>
        <p>Управление контентом и заданиями</p>
      </div>

      <div className="admin-grid">
        {/* Создать Юнит */}
        <div className="admin-card">
          <h2>1. Новый Юнит</h2>
          <form onSubmit={handleCreateUnit}>
            <input className="admin-input" placeholder="Название юнита" value={unitForm.title} onChange={e => setUnitForm({...unitForm, title: e.target.value})} required />
            <textarea className="admin-textarea" placeholder="Описание" value={unitForm.description} onChange={e => setUnitForm({...unitForm, description: e.target.value})} />
            <button type="submit" className="admin-btn blue">Создать Юнит</button>
          </form>
        </div>

        {/* Создать Урок */}
        <div className="admin-card">
          <h2>2. Новый Урок</h2>
          <form onSubmit={handleCreateLesson}>
            <select className="admin-input" value={lessonForm.unit_id} onChange={e => setLessonForm({...lessonForm, unit_id: e.target.value})} required>
              <option value="">Выберите юнит</option>
              {units.map(u => <option key={u.id} value={u.id}>{u.title}</option>)}
            </select>
            <input className="admin-input" placeholder="Название урока" value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} required />
            <textarea className="admin-textarea" placeholder="Описание урока" value={lessonForm.description} onChange={e => setLessonForm({...lessonForm, description: e.target.value})} />
            <input type="number" className="admin-input" placeholder="XP награда" value={lessonForm.xp_reward} onChange={e => setLessonForm({...lessonForm, xp_reward: Number(e.target.value)})} />
            <button type="submit" className="admin-btn green">Создать Урок</button>
          </form>
        </div>

        {/* Создать Упражнение */}
        <div className="admin-card">
          <h2>3. Новое Упражнение</h2>
          <form onSubmit={handleCreateExercise}>
            <select className="admin-input" value={selectedLessonId} onChange={(e) => fetchExercises(e.target.value)} required>
              <option value="">Выберите урок</option>
              {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
            </select>

            <select className="admin-input" value={exerciseForm.type} onChange={e => setExerciseForm({...exerciseForm, type: e.target.value})}>
              <option value="phonics">Phonics</option>
              <option value="sight_words">Sight Words</option>
              <option value="vocabulary">Vocabulary</option>
              <option value="handwriting">Handwriting</option>
            </select>

            <input className="admin-input" placeholder="Вопрос / Задание" value={exerciseForm.question_data.question} onChange={e => setExerciseForm({...exerciseForm, question_data: { question: e.target.value }})} required />
            <input className="admin-input" placeholder="Правильный ответ" value={exerciseForm.correct_answer} onChange={e => setExerciseForm({...exerciseForm, correct_answer: e.target.value})} required />
            
            <input 
              type="number" 
              className="admin-input" 
              placeholder="XP за задание" 
              value={exerciseForm.xp_value} 
              onChange={e => setExerciseForm({...exerciseForm, xp_value: Number(e.target.value)})} 
            />

            <button type="submit" className="admin-btn purple" disabled={!selectedLessonId}>
              Добавить упражнение
            </button>
          </form>
        </div>
      </div>

      {/* Список упражнений выбранного урока */}
      {selectedLessonId && (
        <div className="admin-card mt-4">
          <h3>Упражнения урока ({currentExercises.length})</h3>
          <div className="exercise-list">
            {currentExercises.map((ex, idx) => (
              <div key={ex.id} className="exercise-item">
                <strong>{idx + 1}. {ex.question_data?.question}</strong><br/>
                Ответ: <span className="correct-answer">{ex.correct_answer}</span><br/>
                <small>Тип: {ex.type} | XP: {ex.xp_value}</small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}