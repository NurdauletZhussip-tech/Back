// pages/LessonPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { submitExercise } from '../store/lessonSlice';
import api from '../api';

const typeConfig = {
  phonics:     { emoji: '🔤', label: 'Фоника',     color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
  sight_words: { emoji: '📖', label: 'Слова',       color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
  image:       { emoji: '🖼️', label: 'Картинка',   color: '#06b6d4', bg: '#ecfeff', border: '#a5f3fc' },
};

const StarBurst = ({ count = 6, color }) => (
  <div style={{ position: 'relative', width: 60, height: 60 }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 4, height: 20, background: color,
        borderRadius: 2,
        transform: `translate(-50%, -100%) rotate(${i * (360 / count)}deg)`,
        transformOrigin: '50% 100%',
        animation: `starPulse 1.2s ease-in-out ${i * 0.1}s infinite alternate`,
        opacity: 0.7,
      }} />
    ))}
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 18, height: 18, borderRadius: '50%',
      background: color, opacity: 0.9,
    }} />
  </div>
);

export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const childId = user?.id;

  const [lesson, setLesson] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { correct, xpEarned, correctAnswer }
  const [shake, setShake] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lessonRes = await api.get(`/lessons/${lessonId}`);
        setLesson(lessonRes.data);
        const exRes = await api.get(`/lessons/${lessonId}/exercises`);
        setExercises(exRes.data || []);
        if (exRes.data?.length > 0) setSelectedExercise(exRes.data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [lessonId]);

  const handleSubmit = async () => {
    if (!selectedExercise || !answer.trim()) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await dispatch(submitExercise({
        childId,
        exerciseId: selectedExercise.id,
        answer: answer.trim()
      })).unwrap();

      setResult({
        correct: res.correct,
        xpEarned: res.xpEarned,
        correctAnswer: selectedExercise.correct_answer,
      });

      if (res.correct) {
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 2000);
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }

      setAnswer('');
      const exRes = await api.get(`/lessons/${lessonId}/exercises`);
      setExercises(exRes.data || []);
    } catch (err) {
      setResult({ error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const currentType = selectedExercise?.type || 'phonics';
  const cfg = typeConfig[currentType] || typeConfig.phonics;

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body, #root { min-height: 100vh; }

    .lesson-root {
      min-height: 100vh;
      background: #0f0c29;
      background-image:
        radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.25) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(6, 182, 212, 0.2) 0%, transparent 50%),
        radial-gradient(ellipse at 60% 10%, rgba(249, 115, 22, 0.15) 0%, transparent 40%);
      font-family: 'Nunito', sans-serif;
      padding: 2rem 1rem;
      position: relative;
      overflow: hidden;
    }

    .stars-bg {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }

    .star-dot {
      position: absolute;
      border-radius: 50%;
      background: white;
      animation: twinkle linear infinite;
    }

    @keyframes twinkle {
      0%, 100% { opacity: 0.2; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.4); }
    }

    .content-wrapper {
      position: relative;
      z-index: 1;
      max-width: 780px;
      margin: 0 auto;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      color: rgba(255,255,255,0.85);
      font-family: 'Nunito', sans-serif;
      font-weight: 700;
      font-size: 15px;
      padding: 10px 20px;
      border-radius: 100px;
      cursor: pointer;
      margin-bottom: 2rem;
      transition: all 0.2s;
      backdrop-filter: blur(8px);
    }
    .back-btn:hover {
      background: rgba(255,255,255,0.15);
      color: white;
      transform: translateX(-3px);
    }

    .lesson-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .lesson-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(139, 92, 246, 0.25);
      border: 1px solid rgba(139, 92, 246, 0.5);
      color: #c4b5fd;
      font-size: 13px;
      font-weight: 700;
      padding: 6px 16px;
      border-radius: 100px;
      margin-bottom: 1rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .lesson-title {
      font-family: 'Fredoka One', cursive;
      font-size: 3rem;
      color: white;
      line-height: 1.1;
      margin-bottom: 0.75rem;
      text-shadow: 0 0 40px rgba(139,92,246,0.6);
    }

    .lesson-desc {
      font-size: 1.1rem;
      color: rgba(255,255,255,0.6);
      font-weight: 600;
      max-width: 480px;
      margin: 0 auto;
    }

    .exercises-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 2rem;
    }

    .exercise-card {
      background: rgba(255,255,255,0.06);
      border: 2px solid rgba(255,255,255,0.1);
      border-radius: 18px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .exercise-card:hover {
      background: rgba(255,255,255,0.12);
      transform: translateY(-2px);
    }
    .exercise-card.active {
      border-color: var(--active-color, #8b5cf6);
      background: rgba(139, 92, 246, 0.15);
      box-shadow: 0 0 20px rgba(139,92,246,0.3);
    }

    .ex-icon {
      font-size: 24px;
      width: 44px; height: 44px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 12px;
      background: rgba(255,255,255,0.08);
      flex-shrink: 0;
    }

    .ex-info { flex: 1; min-width: 0; }
    .ex-type {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: rgba(255,255,255,0.45);
      margin-bottom: 3px;
    }
    .ex-question {
      font-size: 13px;
      font-weight: 700;
      color: rgba(255,255,255,0.9);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .main-card {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      backdrop-filter: blur(20px);
      border-radius: 28px;
      padding: 2.5rem;
      animation: cardIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes cardIn {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .type-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 18px;
      border-radius: 100px;
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      margin-bottom: 1.5rem;
    }

    .question-text {
      font-family: 'Fredoka One', cursive;
      font-size: 2rem;
      color: white;
      line-height: 1.2;
      margin-bottom: 2rem;
    }

    .answer-wrapper {
      position: relative;
      margin-bottom: 1.5rem;
    }

    .answer-input {
      width: 100%;
      background: rgba(255,255,255,0.08);
      border: 2px solid rgba(255,255,255,0.15);
      border-radius: 18px;
      padding: 20px 60px 20px 24px;
      font-family: 'Nunito', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
      outline: none;
      transition: all 0.2s;
    }
    .answer-input::placeholder { color: rgba(255,255,255,0.35); }
    .answer-input:focus {
      border-color: rgba(139,92,246,0.7);
      background: rgba(139,92,246,0.1);
      box-shadow: 0 0 0 4px rgba(139,92,246,0.15);
    }
    .answer-input.shake {
      animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
      border-color: #f87171;
    }
    @keyframes shake {
      10%, 90% { transform: translateX(-4px); }
      20%, 80% { transform: translateX(6px); }
      30%, 50%, 70% { transform: translateX(-6px); }
      40%, 60% { transform: translateX(6px); }
    }

    .enter-hint {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255,255,255,0.12);
      color: rgba(255,255,255,0.5);
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 8px;
      pointer-events: none;
    }

    .submit-btn {
      width: 100%;
      padding: 20px;
      border: none;
      border-radius: 18px;
      font-family: 'Fredoka One', cursive;
      font-size: 1.5rem;
      letter-spacing: 0.02em;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
      overflow: hidden;
    }
    .submit-btn:not(:disabled) {
      background: linear-gradient(135deg, #8b5cf6, #ec4899);
      color: white;
      box-shadow: 0 8px 32px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
    }
    .submit-btn:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(139,92,246,0.6), inset 0 1px 0 rgba(255,255,255,0.2);
    }
    .submit-btn:not(:disabled):active {
      transform: translateY(0);
    }
    .submit-btn:disabled {
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.3);
      cursor: not-allowed;
    }
    .submit-btn.celebrate {
      animation: celebratePulse 0.4s ease;
    }
    @keyframes celebratePulse {
      0%   { transform: scale(1); }
      50%  { transform: scale(1.04); }
      100% { transform: scale(1); }
    }

    .result-banner {
      border-radius: 18px;
      padding: 18px 24px;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 16px;
      animation: bannerIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes bannerIn {
      from { opacity: 0; transform: scale(0.95); }
      to   { opacity: 1; transform: scale(1); }
    }
    .result-banner.correct {
      background: rgba(34, 197, 94, 0.15);
      border: 1.5px solid rgba(34, 197, 94, 0.4);
    }
    .result-banner.wrong {
      background: rgba(239, 68, 68, 0.12);
      border: 1.5px solid rgba(239, 68, 68, 0.35);
    }
    .result-icon {
      font-size: 2rem;
      flex-shrink: 0;
    }
    .result-main {
      font-family: 'Fredoka One', cursive;
      font-size: 1.3rem;
      color: white;
    }
    .result-sub {
      font-size: 14px;
      font-weight: 600;
      color: rgba(255,255,255,0.6);
      margin-top: 3px;
    }

    .xp-chip {
      margin-left: auto;
      background: rgba(250, 204, 21, 0.2);
      border: 1.5px solid rgba(250, 204, 21, 0.5);
      color: #fcd34d;
      font-family: 'Fredoka One', cursive;
      font-size: 1.1rem;
      padding: 6px 16px;
      border-radius: 100px;
      white-space: nowrap;
    }

    .confetti-container {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 100;
    }
    .confetti-piece {
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 2px;
      animation: confettiFall linear forwards;
    }
    @keyframes confettiFall {
      0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
    }

    .loading-screen {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #0f0c29;
      gap: 1.5rem;
    }
    .loading-orb {
      width: 64px; height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #8b5cf6, #ec4899);
      animation: orbPulse 1.4s ease-in-out infinite;
    }
    @keyframes orbPulse {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.15); opacity: 1; }
    }
    .loading-text {
      font-family: 'Fredoka One', cursive;
      font-size: 1.5rem;
      color: rgba(255,255,255,0.7);
    }

    @keyframes starPulse {
      from { opacity: 0.5; transform: translate(-50%, -100%) rotate(var(--r)) scaleY(0.8); }
      to   { opacity: 1; transform: translate(-50%, -100%) rotate(var(--r)) scaleY(1.2); }
    }
  `;

  const confettiColors = ['#f97316','#8b5cf6','#06b6d4','#ec4899','#fcd34d','#34d399'];
  const confettiPieces = celebrate ? Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    dur: 1.5 + Math.random() * 1.2,
    color: confettiColors[i % confettiColors.length],
  })) : [];

  const starDots = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: 1 + Math.random() * 2.5,
    dur: 2 + Math.random() * 4,
    delay: Math.random() * 4,
  }));

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-screen">
          <div className="loading-orb" />
          <div className="loading-text">Загружаем урок...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      {/* Stars background */}
      <div className="stars-bg">
        {starDots.map(s => (
          <div key={s.id} className="star-dot" style={{
            top: `${s.top}%`, left: `${s.left}%`,
            width: s.size, height: s.size,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }} />
        ))}
      </div>

      {/* Confetti */}
      {celebrate && (
        <div className="confetti-container">
          {confettiPieces.map(p => (
            <div key={p.id} className="confetti-piece" style={{
              left: `${p.left}%`,
              background: p.color,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            }} />
          ))}
        </div>
      )}

      <div className="lesson-root">
        <div className="content-wrapper">

          {/* Back button */}
          <button className="back-btn" onClick={() => navigate('/child/dashboard')}>
            ← Назад к урокам
          </button>

          {/* Lesson header */}
          <div className="lesson-header">
            <div className="lesson-badge">✨ Урок</div>
            <h1 className="lesson-title">{lesson?.title || 'Урок'}</h1>
            {lesson?.description && (
              <p className="lesson-desc">{lesson.description}</p>
            )}
          </div>

          {/* Exercise picker */}
          {exercises.length > 0 && (
            <div className="exercises-grid">
              {exercises.map((ex) => {
                const t = typeConfig[ex.type] || typeConfig.phonics;
                const isActive = selectedExercise?.id === ex.id;
                return (
                  <div
                    key={ex.id}
                    className={`exercise-card${isActive ? ' active' : ''}`}
                    style={{ '--active-color': t.color }}
                    onClick={() => { setSelectedExercise(ex); setResult(null); setAnswer(''); }}
                  >
                    <div className="ex-icon">{t.emoji}</div>
                    <div className="ex-info">
                      <div className="ex-type">{t.label}</div>
                      <div className="ex-question">
                        {ex.question_data?.question || 'Упражнение'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Main exercise card */}
          {selectedExercise && (
            <div className="main-card" key={selectedExercise.id}>

              <div className="type-pill" style={{
                background: cfg.bg,
                color: cfg.color,
                border: `1.5px solid ${cfg.border}`,
              }}>
                <span>{cfg.emoji}</span>
                <span>{cfg.label}</span>
              </div>

              <div className="question-text">
                {selectedExercise.question_data?.question || 'Введите ответ'}
              </div>

              {/* Result banner */}
              {result && !result.error && (
                <div className={`result-banner ${result.correct ? 'correct' : 'wrong'}`}>
                  <div className="result-icon">{result.correct ? '🎉' : '💡'}</div>
                  <div>
                    <div className="result-main">
                      {result.correct ? 'Правильно!' : 'Почти!'}
                    </div>
                    <div className="result-sub">
                      {!result.correct && `Правильный ответ: ${result.correctAnswer}`}
                    </div>
                  </div>
                  {result.correct && (
                    <div className="xp-chip">+{result.xpEarned} XP ⚡</div>
                  )}
                </div>
              )}

              {/* Answer input */}
              <div className="answer-wrapper">
                <input
                  type="text"
                  className={`answer-input${shake ? ' shake' : ''}`}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Напишите ответ..."
                  autoFocus
                />
                {answer.trim() && (
                  <div className="enter-hint">↵ Enter</div>
                )}
              </div>

              <button
                className={`submit-btn${celebrate ? ' celebrate' : ''}`}
                onClick={handleSubmit}
                disabled={submitting || !answer.trim()}
              >
                {submitting ? '⏳ Проверяем...' : '🚀 Отправить ответ'}
              </button>
            </div>
          )}

          {exercises.length === 0 && !loading && (
            <div style={{
              textAlign: 'center', padding: '3rem',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: "'Fredoka One', cursive",
              fontSize: '1.3rem',
            }}>
              😕 Упражнений пока нет
            </div>
          )}

        </div>
      </div>
    </>
  );
}
