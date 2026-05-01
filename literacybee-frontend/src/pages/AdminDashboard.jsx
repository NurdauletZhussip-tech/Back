// pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLessons, createLesson, deleteLesson } from '../store/lessonSlice';
import api from '../api';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { lessons } = useSelector((state) => state.lesson);

  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [showExerciseForm, setShowExerciseForm] = useState(false);

  // Форма нового урока
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    order_index: 1,
    xp_reward: 50
  });

  // Форма нового упражнения
  const [exerciseForm, setExerciseForm] = useState({
    type: 'phonics',
    question_data: { question: '' },
    correct_answer: '',
    xp_value: 10,
    order_index: 1
  });

  useEffect(() => {
    dispatch(fetchLessons({ page: 1, limit: 20 }));
  }, [dispatch]);

  // Загрузка упражнений выбранного урока
  const loadExercises = async (lessonId) => {
    setSelectedLessonId(lessonId);
    try {
      const res = await api.get(`/admin/lessons/${lessonId}/exercises`);
      setExercises(res.data || []);
    } catch (err) {
      console.error(err);
      setExercises([]);
    }
  };

  const handleCreateLesson = (e) => {
    e.preventDefault();
    dispatch(createLesson(lessonForm));
    setLessonForm({ title: '', description: '', order_index: 1, xp_reward: 50 });
  };

  const handleCreateExercise = async (e) => {
    e.preventDefault();
    if (!selectedLessonId) return alert("Сначала выберите урок!");

    try {
      await api.post(`/admin/lessons/${selectedLessonId}/exercises`, exerciseForm);
      alert("Упражнение добавлено!");
      loadExercises(selectedLessonId); // перезагрузить список
      setExerciseForm({
        type: 'phonics',
        question_data: { question: '' },
        correct_answer: '',
        xp_value: 10,
        order_index: exercises.length + 1
      });
    } catch (err) {
      alert("Ошибка при добавлении упражнения");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Админ-панель LiteracyBee</h1>

      {/* Создание урока */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">Создать новый урок</h2>
        <form onSubmit={handleCreateLesson} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border p-3 rounded-lg"
            placeholder="Название урока"
            value={lessonForm.title}
            onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
            required
          />
          <input
            type="number"
            className="border p-3 rounded-lg"
            placeholder="Порядок (order_index)"
            value={lessonForm.order_index}
            onChange={e => setLessonForm({ ...lessonForm, order_index: parseInt(e.target.value) })}
          />
          <input
            type="number"
            className="border p-3 rounded-lg"
            placeholder="XP за урок"
            value={lessonForm.xp_reward}
            onChange={e => setLessonForm({ ...lessonForm, xp_reward: parseInt(e.target.value) })}
          />
          <textarea
            className="border p-3 rounded-lg col-span-2"
            placeholder="Описание урока"
            value={lessonForm.description}
            onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })}
          />
          <button type="submit" className="bg-blue-600 text-white py-3 rounded-lg font-medium col-span-2">
            Создать урок
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Список уроков */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Уроки</h2>
          <div className="space-y-3">
            {lessons.map(lesson => (
              <div
                key={lesson.id}
                onClick={() => loadExercises(lesson.id)}
                className={`p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition ${selectedLessonId === lesson.id ? 'border-blue-500 bg-blue-50' : ''}`}
              >
                <div className="font-medium">{lesson.title}</div>
                <div className="text-sm text-gray-500">
                  Порядок: {lesson.order_index} • XP: {lesson.xp_reward}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); dispatch(deleteLesson(lesson.id)); }}
                  className="text-red-500 text-sm mt-2 hover:underline"
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Упражнения выбранного урока */}
        <div>
          {selectedLessonId ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Упражнения урока</h2>
                <button
                  onClick={() => setShowExerciseForm(!showExerciseForm)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  + Добавить упражнение
                </button>
              </div>

              {showExerciseForm && (
                <form onSubmit={handleCreateExercise} className="bg-gray-50 p-5 rounded-xl mb-6">
                  <select
                    className="border p-3 rounded-lg w-full mb-3"
                    value={exerciseForm.type}
                    onChange={e => setExerciseForm({ ...exerciseForm, type: e.target.value })}
                  >
                    <option value="phonics">Phonics (Фоника)</option>
                    <option value="sight_words">Sight Words</option>
                    <option value="vocabulary">Vocabulary</option>
                    <option value="handwriting">Handwriting</option>
                  </select>

                  <input
                    className="border p-3 rounded-lg w-full mb-3"
                    placeholder="Вопрос / Задание"
                    value={exerciseForm.question_data.question}
                    onChange={e => setExerciseForm({
                      ...exerciseForm,
                      question_data: { question: e.target.value }
                    })}
                    required
                  />

                  <input
                    className="border p-3 rounded-lg w-full mb-3"
                    placeholder="Правильный ответ"
                    value={exerciseForm.correct_answer}
                    onChange={e => setExerciseForm({ ...exerciseForm, correct_answer: e.target.value })}
                    required
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      className="border p-3 rounded-lg"
                      placeholder="XP за упражнение"
                      value={exerciseForm.xp_value}
                      onChange={e => setExerciseForm({ ...exerciseForm, xp_value: parseInt(e.target.value) })}
                    />
                    <input
                      type="number"
                      className="border p-3 rounded-lg"
                      placeholder="Порядок"
                      value={exerciseForm.order_index}
                      onChange={e => setExerciseForm({ ...exerciseForm, order_index: parseInt(e.target.value) })}
                    />
                  </div>

                  <button type="submit" className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg w-full">
                    Сохранить упражнение
                  </button>
                </form>
              )}

              <div className="space-y-3">
                {exercises.length === 0 ? (
                  <p className="text-gray-500">Упражнений пока нет</p>
                ) : (
                  exercises.map(ex => (
                    <div key={ex.id} className="bg-white p-4 rounded-xl border">
                      <div className="font-medium">{ex.question_data?.question}</div>
                      <div className="text-sm text-green-600">Ответ: <b>{ex.correct_answer}</b></div>
                      <div className="text-xs text-gray-500 mt-1">
                        Тип: {ex.type} • XP: {ex.xp_value} • Порядок: {ex.order_index}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="text-gray-500 text-center py-12 border border-dashed rounded-xl">
              Выберите урок слева, чтобы увидеть или добавить упражнения
            </div>
          )}
        </div>
      </div>
    </div>
  );
}