// pages/ChildDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { Link } from 'react-router-dom';
import api from '../api';

const ICONS = ['📚','🔤','📖','🌟','🎯','🏆','🖼️','✏️','🎨','🔡'];

export default function ChildDashboard() {
  const dispatch = useDispatch();
  const { lessons } = useSelector((state) => state.lesson);
  const { user } = useSelector((state) => state.auth);
  const childId = user?.id;

  const [dashboard, setDashboard] = useState(null);

  const [stars] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i, top: Math.random()*100, left: Math.random()*100,
      size: 1+Math.random()*2.5, dur: 2+Math.random()*4, delay: Math.random()*5,
    }))
  );

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get('/lessons/all');
        dispatch({
          type: 'lesson/fetchLessons/fulfilled',
          payload: { data: res.data || res }
        });

        if (childId) {
          const dashRes = await api.get(`/lessons/dashboard/${childId}`);
          setDashboard(dashRes.data);
        }
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      }
    };

    loadData();
  }, [dispatch, childId]);

  // Группировка по юнитам
  const groupedLessons = React.useMemo(() => {
    if (!lessons || lessons.length === 0) return [];

    const groups = lessons.reduce((acc, lesson) => {
      const unitId = lesson.unit_id || lesson.units?.id || 'no-unit';
      const unitTitle = lesson.units?.title || 'Все уроки';

      if (!acc[unitId]) {
        acc[unitId] = { 
          unitId, 
          unitTitle, 
          lessons: [] 
        };
      }
      acc[unitId].lessons.push(lesson);
      return acc;
    }, {});

    return Object.values(groups).sort((a, b) => {
      if (a.unitId === 'no-unit') return 1;
      if (b.unitId === 'no-unit') return -1;
      return (a.lessons[0]?.order_index || 999) - (b.lessons[0]?.order_index || 999);
    });
  }, [lessons]);

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

        {groupedLessons.length === 0 ? (
          <div className="empty-state">😕 Уроков пока нет</div>
        ) : (
          groupedLessons.map((group) => (
            <div key={group.unitId} className="mb-12">
              
              {/* ✅ ИЗМЕНЕННЫЙ ТЕКСТ */}
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3 
              bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg w-fit">
                📚 {group.unitTitle}
                <span className="text-sm font-normal text-gray-600">
                  ({group.lessons.length})
                </span>
              </h2>

              <div className="lessons-grid">
                {group.lessons.map((lesson, idx) => (
                  <Link 
                    key={lesson.id} 
                    to={`/child/lesson/${lesson.id}`} 
                    className="lesson-card"
                  >
                    <div className="lc-icon">{ICONS[idx % ICONS.length]}</div>
                    <div className="lc-title">{lesson.title}</div>
                    {lesson.description && <div className="lc-desc">{lesson.description}</div>}
                    <div className="lc-footer">
                      <span className="xp-badge">⚡ {lesson.xp_reward || 50} XP</span>
                      <span className="go-arrow">→</span>
                    </div>
                    <div className="prog-bar">
                      <div className="prog-fill" style={{ width: `${lesson.completionRate || 0}%` }} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}