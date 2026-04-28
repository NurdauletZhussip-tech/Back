import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function ProgressPage() {
  const { childId } = useParams();
  const navigate    = useNavigate();

  const [progress,  setProgress]  = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [childName, setChildName] = useState('');
  const [loading,   setLoading]   = useState(true);

  const [stars] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i, top: Math.random()*100, left: Math.random()*100,
      size: 1+Math.random()*2.5, dur: 2+Math.random()*4, delay: Math.random()*5,
    }))
  );

  useEffect(() => {
    (async () => {
      try {
        const [progRes, dashRes] = await Promise.all([
          api.get(`/lessons/progress/${childId}`),
          api.get(`/lessons/dashboard/${childId}`),
        ]);
        setProgress(progRes.data || []);
        setDashboard(dashRes.data);
        if (progRes.data?.[0]?.child_name) setChildName(progRes.data[0].child_name);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [childId]);

  const totalLessons    = progress.length;
  const doneLessons     = progress.filter(l => l.progress?.completed).length;
  const avgScore        = totalLessons > 0
    ? Math.round(progress.reduce((s, l) => s + (l.completionRate || 0), 0) / totalLessons)
    : 0;

  const barColor = (score) => {
    if (score >= 80) return 'linear-gradient(90deg, #22c55e, #16a34a)';
    if (score >= 40) return 'linear-gradient(90deg, #f97316, #ea580c)';
    return 'linear-gradient(90deg, #8b5cf6, #6d28d9)';
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-orb" />
      <div className="loading-text">Загружаем прогресс...</div>
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

      <div className="z1 space-max">
        <button className="back-btn" onClick={() => navigate('/parent/dashboard')}>
          ← Назад
        </button>

        <div className="progress-page-title">
          📊 Прогресс {childName || 'ребёнка'}
        </div>
        <div className="progress-page-sub">
          Детальная статистика по всем урокам
        </div>

        {/* Summary cards */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-val" style={{ color: '#fcd34d' }}>
              {dashboard?.totalXp || 0}
            </div>
            <div className="summary-label">⚡ Всего XP</div>
          </div>
          <div className="summary-card">
            <div className="summary-val" style={{ color: '#f97316' }}>
              {dashboard?.currentStreak || 0}
            </div>
            <div className="summary-label">🔥 Серия дней</div>
          </div>
          <div className="summary-card">
            <div className="summary-val" style={{ color: '#22c55e' }}>
              {doneLessons}/{totalLessons}
            </div>
            <div className="summary-label">🏆 Уроков</div>
          </div>
          <div className="summary-card">
            <div className="summary-val" style={{ color: '#06b6d4' }}>
              {avgScore}%
            </div>
            <div className="summary-label">📈 Средний балл</div>
          </div>
        </div>

        {/* Lesson list */}
        <div className="progress-list">
          {progress.length === 0 ? (
            <div className="empty-state">😕 Данных пока нет</div>
          ) : (
            progress.map((lesson, idx) => {
              const score = lesson.completionRate || 0;
              const done  = lesson.progress?.completed;
              const completed = lesson.completedExercises || 0;
              const total     = lesson.totalExercises || 0;
              return (
                <div key={lesson.id} className="progress-item">
                  <div className="pi-top">
                    <div className="pi-title">
                      {['📚','🔤','📖','🌟','🎯','🏆','🖼️','✏️','🎨','🔡'][idx % 10]} {lesson.title}
                    </div>
                    <div className="pi-badges">
                      <span className="pi-score">{score}%</span>
                      {done && <span className="pi-done">✅ Завершён</span>}
                      <span className="pi-excount">{completed}/{total} заданий</span>
                    </div>
                  </div>
                  <div className="pi-bar">
                    <div className="pi-fill" style={{ width: `${score}%`, background: barColor(score) }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}