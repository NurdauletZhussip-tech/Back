import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaBolt, FaBookOpen, FaFire, FaTrophy } from 'react-icons/fa';
import AppNav from '../components/AppNav';
import api from '../api';

const ICONS = ['📚', '🔤', '📖', '⭐', '🎯', '🏆', '🖼️', '✏️', '🎨', '🔡'];

export default function ChildDashboard() {
  const dispatch = useDispatch();
  const { lessons } = useSelector((state) => state.lesson);
  const { user } = useSelector((state) => state.auth);
  const childId = user?.id;

  const [dashboard, setDashboard] = useState(null);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stars] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: 1 + Math.random() * 2.5,
      dur: 2 + Math.random() * 4,
      delay: Math.random() * 5
    }))
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [lessonsRes, leaderboardRes] = await Promise.all([
          api.get('/lessons/all'),
          api.get('/leaderboard', { params: { ageGroup: 'all', limit: 3 } })
        ]);

        dispatch({
          type: 'lesson/fetchLessons/fulfilled',
          payload: { data: lessonsRes.data || lessonsRes }
        });

        setLeaders(leaderboardRes.data?.entries || []);

        if (childId) {
          const dashRes = await api.get(`/lessons/dashboard/${childId}`);
          setDashboard(dashRes.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch, childId]);

  const groupedLessons = useMemo(() => {
    if (!lessons || lessons.length === 0) return [];

    const groups = lessons.reduce((acc, lesson) => {
      const unitId = lesson.unit_id || lesson.units?.id || 'no-unit';
      const unitTitle = lesson.units?.title || 'Все уроки';

      if (!acc[unitId]) {
        acc[unitId] = { unitId, unitTitle, lessons: [] };
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

  const nextLesson = useMemo(() => {
    return groupedLessons.flatMap(group => group.lessons)[0];
  }, [groupedLessons]);

  return (
    <div className="space-bg">
      <div className="stars-bg">
        {stars.map(s => (
          <div
            key={s.id}
            className="star-dot"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.delay}s`
            }}
          />
        ))}
      </div>

      <div className="z1 dashboard-shell">
        <AppNav />

        <section className="child-hero">
          <div className="child-hero-copy">
            <div className="eyebrow">Сегодняшняя практика</div>
            <h1>Привет, {user?.name || 'ученик'}!</h1>
            <p>Продолжай читать, зарабатывай XP и поднимайся в лидерборде.</p>
            <div className="hero-actions">
              {nextLesson && (
                <Link to={`/child/lesson/${nextLesson.id}`} className="hero-primary">
                  <FaBookOpen /> Начать урок <FaArrowRight />
                </Link>
              )}
              <Link to="/leaderboard" className="hero-secondary">
                <FaTrophy /> Рейтинг
              </Link>
            </div>
          </div>

          <div className="mission-panel">
            <div className="mission-label">Следующий урок</div>
            <div className="mission-title">{nextLesson?.title || 'Уроки скоро появятся'}</div>
            <div className="mission-text">{nextLesson?.description || 'Администратор еще не добавил материалы.'}</div>
            <div className="mission-xp"><FaBolt /> {nextLesson?.xp_reward || 0} XP</div>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="metric-card">
            <FaBolt />
            <span>{dashboard?.totalXp || 0}</span>
            <p>Всего XP</p>
          </div>
          <div className="metric-card">
            <FaFire />
            <span>{dashboard?.currentStreak || 0}</span>
            <p>Дней подряд</p>
          </div>
          <div className="metric-card">
            <FaTrophy />
            <span>{dashboard?.lessonsCompleted || 0}</span>
            <p>Уроков завершено</p>
          </div>
        </section>

        <section className="leader-preview">
          <div className="section-head">
            <div>
              <h2>Топ по XP</h2>
              <p>Кто сегодня впереди</p>
            </div>
            <Link to="/leaderboard">Открыть все</Link>
          </div>
          <div className="leader-preview-list">
            {leaders.length === 0 ? (
              <div className="empty-state compact">Рейтинг пока пуст</div>
            ) : (
              leaders.map(leader => (
                <div key={leader.childId} className="leader-preview-row">
                  <span>#{leader.rank}</span>
                  <strong>{leader.name}</strong>
                  <em>{leader.totalXp} XP</em>
                </div>
              ))
            )}
          </div>
        </section>

        {loading ? (
          <div className="leaderboard-state">Загружаем уроки...</div>
        ) : groupedLessons.length === 0 ? (
          <div className="empty-state">Уроков пока нет</div>
        ) : (
          groupedLessons.map((group) => (
            <section key={group.unitId} className="lesson-section">
              <div className="section-head">
                <div>
                  <h2>{group.unitTitle}</h2>
                  <p>{group.lessons.length} уроков</p>
                </div>
              </div>

              <div className="lessons-grid">
                {group.lessons.map((lesson, idx) => (
                  <Link key={lesson.id} to={`/child/lesson/${lesson.id}`} className="lesson-card">
                    <div className="lc-icon">{ICONS[idx % ICONS.length]}</div>
                    <div className="lc-title">{lesson.title}</div>
                    {lesson.description && <div className="lc-desc">{lesson.description}</div>}
                    <div className="lc-footer">
                      <span className="xp-badge"><FaBolt /> {lesson.xp_reward || 50} XP</span>
                      <span className="go-arrow">→</span>
                    </div>
                    <div className="prog-bar">
                      <div className="prog-fill" style={{ width: `${lesson.completionRate || 0}%` }} />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
