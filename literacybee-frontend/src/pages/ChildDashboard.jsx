import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLessons } from '../store/lessonSlice';
import { logout } from '../store/authSlice';
import { Link } from 'react-router-dom';
import api from '../api';

const ICONS = ['📚','🔤','📖','🌟','🎯','🏆','🖼️','✏️','🎨','🔡'];

export default function ChildDashboard() {
  const dispatch = useDispatch();
  const { lessons } = useSelector((state) => state.lesson);
  const { user }    = useSelector((state) => state.auth);
  const childId     = user?.id;

  const [dashboard, setDashboard] = useState(null);
  const [stars] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i, top: Math.random()*100, left: Math.random()*100,
      size: 1+Math.random()*2.5, dur: 2+Math.random()*4, delay: Math.random()*5,
    }))
  );

  useEffect(() => {
    dispatch(fetchLessons());
    if (childId) {
      api.get(`/lessons/dashboard/${childId}`)
        .then(r => setDashboard(r.data))
        .catch(() => {});
    }
  }, [dispatch, childId]);

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
        <div className="dashboard-header">
          <div>
            <div className="dashboard-greeting">Привет, {user?.name}! 👋</div>
            <div className="dashboard-sub">Твои уроки и достижения</div>
          </div>
          <button className="logout-btn" onClick={() => dispatch(logout())}>Выйти</button>
        </div>

        {dashboard && (
          <div className="stats-row">
            <div className="stat-chip">⚡ XP: <b>{dashboard.totalXp || 0}</b></div>
            <div className="stat-chip">🔥 Серия: <b>{dashboard.currentStreak || 0} дней</b></div>
            <div className="stat-chip">🏆 Уроков: <b>{dashboard.lessonsCompleted || 0}</b></div>
          </div>
        )}

        {lessons.length === 0 ? (
          <div className="empty-state">😕 Уроков пока нет</div>
        ) : (
          <div className="lessons-grid">
            {lessons.map((lesson, idx) => (
              <Link key={lesson.id} to={`/child/lesson/${lesson.id}`} className="lesson-card">
                <div className="lc-icon">{ICONS[idx % ICONS.length]}</div>
                <div className="lc-title">{lesson.title}</div>
                <div className="lc-desc">{lesson.description}</div>
                <div className="lc-footer">
                  <span className="xp-badge">⚡ {lesson.xp_reward} XP</span>
                  <span className="go-arrow">→</span>
                </div>
                <div className="prog-bar">
                  <div className="prog-fill" style={{ width: `${lesson.completionRate || 0}%` }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}