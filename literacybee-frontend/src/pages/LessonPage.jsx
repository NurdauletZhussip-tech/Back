import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { submitExercise } from '../store/lessonSlice';
import api from '../api';

export default function LessonPage() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [answer, setAnswer] = useState('');
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const childId = user?.id;

  useEffect(() => {
    const fetchLesson = async () => {
      const res = await api.get(`/lessons/${lessonId}`);
      setLesson(res.data);
      const exRes = await api.get(`/lessons/${lessonId}/exercises`);
      setExercises(exRes.data);
      if (exRes.data.length) setSelectedExerciseId(exRes.data[0].id);
    };
    fetchLesson();
  }, [lessonId]);

  const handleSubmit = async () => {
    if (!selectedExerciseId || !answer) return;
    const result = await dispatch(submitExercise({ childId, exerciseId: selectedExerciseId, answer })).unwrap();
    alert(`✅ Ответ: ${result.correct ? 'Правильно!' : 'Неправильно'}\nXP: ${result.xpEarned}\nПрогресс урока: ${result.newScore}%`);
    setAnswer('');
  };

  if (!lesson) return <div className="p-10 text-center">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-indigo-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
        <p className="text-gray-600 mb-6">{lesson.description}</p>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Выбери упражнение</label>
          <select value={selectedExerciseId} onChange={(e) => setSelectedExerciseId(e.target.value)} className="w-full border rounded-lg p-2">
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.type} – {ex.question_data?.question || 'Вопрос'}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Твой ответ</label>
          <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full border rounded-lg p-2" placeholder="Введи ответ..." />
        </div>
        <button onClick={handleSubmit} className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700">Отправить</button>
      </div>
    </div>
  );
}