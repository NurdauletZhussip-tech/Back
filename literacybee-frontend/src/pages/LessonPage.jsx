import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { submitExercise } from '../store/lessonSlice';
import api from '../api';

const TYPE_CFG = {
  phonics:     { emoji: '🔤', label: 'Фоника',     color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
  sight_words: { emoji: '📖', label: 'Слова',      color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
  vocabulary:  { emoji: '🧠', label: 'Словарный',  color: '#06b6d4', bg: '#ecfeff', border: '#a5f3fc' },
  handwriting: { emoji: '✍️', label: 'Письмо',     color: '#eab308', bg: '#fefce8', border: '#fde047' },
};

const CONFETTI_COLORS = ['#f97316','#8b5cf6','#06b6d4','#ec4899','#fcd34d','#34d399'];

export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const childId = user?.id;

  const [lesson, setLesson] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [shake, setShake] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const [stars] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i, top: Math.random()*100, left: Math.random()*100,
      size: 1+Math.random()*2.5, dur: 2+Math.random()*4, delay: Math.random()*5,
    }))
  );

  useEffect(() => {
    const loadLessonData = async () => {
      try {
        setLoading(true);
        const [lessonRes, exRes] = await Promise.all([
          api.get(`/lessons/${lessonId}`),
          api.get(`/lessons/${lessonId}/exercises`)
        ]);

        setLesson(lessonRes.data);
        const exercisesData = exRes.data?.data || exRes.data || [];
        setExercises(exercisesData);

        if (exercisesData.length > 0) {
          setSelected(exercisesData[0]);
        }
      } catch (err) {
        console.error('Ошибка загрузки урока:', err);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) loadLessonData();
  }, [lessonId]);

  const handleSubmit = async () => {
    if (!selected || !answer.trim() || submitting) return;

    setSubmitting(true);
    setResult(null);

    try {
      const res = await dispatch(submitExercise({
        childId: user?.id,
        exerciseId: selected.id,
        answer: answer.trim(),
      })).unwrap();

      const xpEarned = res.xpEarned || 0;

      setResult({ 
        correct: res.isCorrect, 
        xpEarned,
        correctAnswer: selected.correct_answer 
      });

      setAnswer('');

      if (res.isCorrect && xpEarned > 0) {
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 2500);
      } else if (!res.isCorrect) {
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }

      // Обновляем список упражнений
      const fresh = await api.get(`/lessons/${lessonId}/exercises`);
      const exercisesData = fresh.data?.data || fresh.data || [];
      setExercises(exercisesData);

    } catch (err) {
      console.error("Ошибка отправки ответа:", err);
      setResult({ error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const pickEx = (ex) => {
    setSelected(ex);
    setResult(null);
    setAnswer('');
  };

  const cfg = TYPE_CFG[selected?.type] || TYPE_CFG.phonics;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-orb" />
        <div className="loading-text">Загружаем урок...</div>
      </div>
    );
  }

  return (
    <div className="space-bg">
      <div className="stars-bg">
        {stars.map(s => (
          <div key={s.id} className="star-dot" style={{
            top: `${s.top}%`, left: `${s.left}%`, width: s.size, height: s.size,
            animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s`,
          }} />
        ))}
      </div>

      {celebrate && (
        <div className="confetti-c">
          {Array.from({ length: 38 }, (_, i) => (
            <div key={i} className="cp" style={{
              left: `${Math.random() * 100}%`,
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animationDuration: `${1.4 + Math.random() * 1}s`,
              animationDelay: `${Math.random() * 0.7}s`,
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
                  className={`ex-card ${selected?.id === ex.id ? 'active' : ''}`}
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

        {selected && (
          <div className="main-card">
            <div className="type-pill" style={{ background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.border}` }}>
              {cfg.emoji} {cfg.label}
            </div>

            <div className="question-text">
              {selected.question_data?.question}
            </div>

            {result && !result.error && (
              <div className={`result-banner ${result.correct ? 'correct' : 'wrong'}`}>
                <div className="res-icon">{result.correct ? '🎉' : '💡'}</div>
                <div>
                  <div className="res-main">{result.correct ? 'Правильно!' : 'Неправильно'}</div>
                  {!result.correct && (
                    <div className="res-sub">
                      Правильный ответ: <b>{result.correctAnswer}</b>
                    </div>
                  )}
                </div>
                {result.xpEarned > 0 && (
                  <div className="xp-chip">+{result.xpEarned} XP ⚡</div>
                )}
              </div>
            )}

            <div className="answer-wrap">
              <input
                className={`answer-input ${shake ? 'shake' : ''}`}
                type="text"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Напиши ответ здесь..."
                autoFocus
              />
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