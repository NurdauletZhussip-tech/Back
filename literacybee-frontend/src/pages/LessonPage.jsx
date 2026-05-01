import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { submitExercise } from '../store/lessonSlice';
import api from '../api';

const TYPE_CFG = {
  phonics:     { emoji: '🔤', label: 'Фоника',   color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
  sight_words: { emoji: '📖', label: 'Слова',     color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
  image:       { emoji: '🖼️', label: 'Картинка', color: '#06b6d4', bg: '#ecfeff', border: '#a5f3fc' },
};
const CONFETTI_COLORS = ['#f97316','#8b5cf6','#06b6d4','#ec4899','#fcd34d','#34d399'];

export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate     = useNavigate();
  const dispatch     = useDispatch();
  const { user }     = useSelector((s) => s.auth);
  const childId      = user?.id;

  const [lesson,    setLesson]    = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [answer,    setAnswer]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result,    setResult]    = useState(null);
  const [shake,     setShake]     = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const [stars] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i, top: Math.random()*100, left: Math.random()*100,
      size: 1+Math.random()*2.5, dur: 2+Math.random()*4, delay: Math.random()*5,
    }))
  );

  // LessonPage.jsx — исправленный useEffect

  useEffect(() => {
    const loadLessonData = async () => {
      try {
        setLoading(true);
        
        const [lessonRes, exRes] = await Promise.all([
          api.get(`/lessons/${lessonId}`),                    // Получаем урок
          api.get(`/lessons/${lessonId}/exercises`)           // Получаем упражнения
        ]);

        setLesson(lessonRes.data);
        
        // Важно: правильно обрабатываем ответ с упражнениями
        const exercisesData = exRes.data?.data || exRes.data || [];
        setExercises(exercisesData);

        if (exercisesData.length > 0) {
          setSelected(exercisesData[0]);
        }
      } catch (err) {
        console.error('Ошибка загрузки урока:', err);
        // Для отладки:
        console.log("Lesson ID:", lessonId);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      loadLessonData();
    }
  }, [lessonId]);

  const refreshExercises = async () => {
    try {
      const res = await api.get(`/lessons/${lessonId}/exercises`);
      const data = res.data || [];
      setExercises(data);
      return data;
    } catch { return []; }
  };

 const handleSubmit = async () => {
  if (!selected || !answer.trim()) return;

  setSubmitting(true);
  setResult(null);

  try {
    const res = await dispatch(submitExercise({
      childId: user?.id,                    // ← Используем user.id из Redux
      exerciseId: selected.id,
      answer: answer.trim(),
    })).unwrap();

    setResult({ 
      correct: res.isCorrect, 
      xpEarned: res.xpEarned || (res.isCorrect ? selected.xp_value : 0),
      correctAnswer: selected.correct_answer 
    });

    setAnswer('');

    if (res.isCorrect) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 2500);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }

    // Перезагружаем упражнения после ответа
    const fresh = await api.get(`/lessons/${lessonId}/exercises`);
    const exercisesData = fresh.data?.data || fresh.data || [];
    setExercises(exercisesData);

    if (exercisesData.length > 0) {
      const stillThere = exercisesData.find(e => e.id === selected.id);
      if (stillThere) setSelected(stillThere);
    }

  } catch (err) {
    console.error("Ошибка отправки ответа:", err);
    setResult({ error: true });
    
    // Полезный лог для отладки
    if (err.response?.status === 403) {
      alert("Ошибка доступа. Проверьте, что вы вошли как этот ребёнок.");
    }
  } finally {
    setSubmitting(false);
  }
};

  const pickEx = (ex) => { setSelected(ex); setResult(null); setAnswer(''); };

  const cfg = TYPE_CFG[selected?.type] || TYPE_CFG.phonics;

  const confetti = celebrate
    ? Array.from({ length: 38 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * .7,
        dur: 1.4 + Math.random() * 1,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      }))
    : [];

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-orb" />
      <div className="loading-text">Загружаем урок...</div>
    </div>
  );

  return (
    <div className="space-bg">
      <div className="stars-bg">
        {stars.map(s => (
          <div key={s.id} className="star-dot" style={{
            top:`${s.top}%`, left:`${s.left}%`, width:s.size, height:s.size,
            animationDuration:`${s.dur}s`, animationDelay:`${s.delay}s`,
          }} />
        ))}
      </div>

      {celebrate && (
        <div className="confetti-c">
          {confetti.map(p => (
            <div key={p.id} className="cp" style={{
              left:`${p.left}%`, background:p.color,
              animationDuration:`${p.dur}s`, animationDelay:`${p.delay}s`,
            }} />
          ))}
        </div>
      )}

      <div className="z1 space-max">
        <button className="back-btn" onClick={() => navigate('/child/dashboard')}>
          ← Назад к урокам
        </button>

        <div className="lesson-header">
          <div className="lesson-badge">✨ Урок</div>
          <div className="lesson-title">{lesson?.title}</div>
          {lesson?.description && <div className="lesson-desc">{lesson.description}</div>}
        </div>

        {exercises.length > 0 && (
          <div className="ex-grid">
            {exercises.map(ex => {
              const t = TYPE_CFG[ex.type] || TYPE_CFG.phonics;
              return (
                <div
                  key={ex.id}
                  className={`ex-card${selected?.id === ex.id ? ' active' : ''}`}
                  onClick={() => pickEx(ex)}
                >
                  <div className="ex-icon">{t.emoji}</div>
                  <div>
                    <div className="ex-type">{t.label}</div>
                    <div className="ex-q">{ex.question_data?.question || 'Упражнение'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {exercises.length === 0 && (
          <div className="empty-state">😕 Упражнений пока нет</div>
        )}

        {selected && (
          <div className="main-card" key={selected.id}>
            <div className="type-pill" style={{ background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.border}` }}>
              {cfg.emoji} {cfg.label}
            </div>

            <div className="question-text">
              {selected.question_data?.question || 'Введите ответ'}
            </div>

            {result && !result.error && (
              <div className={`result-banner ${result.correct ? 'correct' : 'wrong'}`}>
                <div className="res-icon">{result.correct ? '🎉' : '💡'}</div>
                <div>
                  <div className="res-main">{result.correct ? 'Правильно!' : 'Почти!'}</div>
                  {!result.correct && (
                    <div className="res-sub">
                      Правильный ответ: <b style={{ color: '#fff' }}>{result.correctAnswer}</b>
                    </div>
                  )}
                </div>
                {result.correct && <div className="xp-chip">+{result.xpEarned} XP ⚡</div>}
              </div>
            )}

            <div className="answer-wrap">
              <input
                className={`answer-input${shake ? ' shake' : ''}`}
                type="text"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Напишите ответ..."
                autoFocus
              />
              {answer.trim() && <div className="enter-hint">↵ Enter</div>}
            </div>

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={submitting || !answer.trim()}
            >
              {submitting ? '⏳ Проверяем...' : '🚀 Отправить ответ'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}