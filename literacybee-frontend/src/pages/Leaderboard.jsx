import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaArrowLeft, FaBolt, FaMedal, FaTrophy, FaUserAstronaut } from 'react-icons/fa';
import api from '../api';

const AGE_GROUPS = [
  { value: 'all', label: 'Все' },
  { value: '5-7', label: '5-7' },
  { value: '8-10', label: '8-10' },
  { value: '11-13', label: '11-13' },
  { value: 'unknown', label: 'Без возраста' }
];

function rankClass(rank) {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  if (rank === 3) return 'bronze';
  return '';
}

function initials(name = '?') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || '?';
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const { role, user } = useSelector((state) => state.auth);
  const [ageGroup, setAgeGroup] = useState('all');
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stars] = useState(() =>
    Array.from({ length: 44 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: 1 + Math.random() * 2.5,
      dur: 2 + Math.random() * 4,
      delay: Math.random() * 5
    }))
  );

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/leaderboard', {
          params: { ageGroup, limit: 20 }
        });
        setLeaderboard(res.data);
      } catch (err) {
        console.error('Leaderboard load failed:', err);
        setError(err.response?.data?.error || 'Не удалось загрузить лидерборд');
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [ageGroup]);

  const entries = useMemo(() => leaderboard?.entries || [], [leaderboard]);
  const topEntry = entries[0];
  const totalXp = useMemo(
    () => entries.reduce((sum, entry) => sum + (entry.totalXp || 0), 0),
    [entries]
  );

  const backPath = role === 'parent'
    ? '/parent/dashboard'
    : role === 'admin'
      ? '/admin'
      : '/child/dashboard';

  return (
    <div className="space-bg leaderboard-bg">
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

      <div className="z1 leaderboard-shell">
        <button className="back-btn" onClick={() => navigate(backPath)}>
          <FaArrowLeft /> Назад
        </button>

        <div className="leaderboard-hero">
          <div>
            <div className="leaderboard-kicker"><FaTrophy /> Рейтинг по XP</div>
            <h1 className="leaderboard-title">Лидерборд</h1>
            <p className="leaderboard-sub">
              Чем больше XP заработал ученик, тем выше он в таблице.
            </p>
          </div>

          <div className="leaderboard-top">
            <div className="leaderboard-top-icon"><FaMedal /></div>
            <div className="leaderboard-top-label">Лидер</div>
            <div className="leaderboard-top-name">{topEntry?.name || 'Пока нет'}</div>
            <div className="leaderboard-top-xp">
              <FaBolt /> {topEntry?.totalXp || 0} XP
            </div>
          </div>
        </div>

        <div className="leaderboard-controls">
          <div className="leaderboard-tabs" role="tablist" aria-label="Возрастная группа">
            {AGE_GROUPS.map(group => (
              <button
                key={group.value}
                type="button"
                className={`leaderboard-tab ${ageGroup === group.value ? 'active' : ''}`}
                onClick={() => setAgeGroup(group.value)}
              >
                {group.label}
              </button>
            ))}
          </div>
          <div className="leaderboard-total">
            <FaBolt /> {totalXp} XP всего
          </div>
        </div>

        {loading ? (
          <div className="leaderboard-state">Загружаем рейтинг...</div>
        ) : error ? (
          <div className="leaderboard-state error">{error}</div>
        ) : entries.length === 0 ? (
          <div className="leaderboard-state">Пока никто не заработал XP</div>
        ) : (
          <div className="leaderboard-list">
            {entries.map((entry) => {
              const isCurrentUser = entry.childId === user?.id;
              return (
                <div
                  key={entry.childId}
                  className={`leaderboard-row ${rankClass(entry.rank)} ${isCurrentUser ? 'current' : ''}`}
                >
                  <div className="leaderboard-rank">#{entry.rank}</div>
                  <div className="leaderboard-avatar">
                    {entry.avatarUrl ? (
                      <img src={entry.avatarUrl} alt={entry.name} />
                    ) : (
                      <span>{entry.rank <= 3 ? <FaTrophy /> : initials(entry.name)}</span>
                    )}
                  </div>
                  <div className="leaderboard-person">
                    <div className="leaderboard-name">
                      {entry.name}
                      {isCurrentUser && <span className="leaderboard-you">Это ты</span>}
                    </div>
                    <div className="leaderboard-meta"><FaUserAstronaut /> Ученик</div>
                  </div>
                  <div className="leaderboard-xp">
                    <FaBolt /> {entry.totalXp || 0}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
