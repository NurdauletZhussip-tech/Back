import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  FaAward,
  FaBolt,
  FaCheckCircle,
  FaChild,
  FaFire,
  FaLock,
  FaMedal,
  FaTrophy
} from 'react-icons/fa';
import AppNav from '../components/AppNav';
import { useToast } from '../components/ToastProvider';
import api from '../api';

const FILTERS = [
  { value: 'all', label: 'Все' },
  { value: 'earned', label: 'Полученные' },
  { value: 'locked', label: 'Закрытые' },
  { value: 'lessons_completed', label: 'Уроки' },
  { value: 'total_xp', label: 'XP' },
  { value: 'streak_days', label: 'Серия' }
];

const CRITERIA_META = {
  lessons_completed: {
    label: 'Уроки',
    icon: <FaTrophy />,
    tone: 'violet',
    text: (value) => `${value} заверш. уроков`
  },
  total_xp: {
    label: 'XP',
    icon: <FaBolt />,
    tone: 'gold',
    text: (value) => `${value} XP`
  },
  streak_days: {
    label: 'Серия',
    icon: <FaFire />,
    tone: 'coral',
    text: (value) => `${value} дней подряд`
  }
};

function getBadgeMeta(badge) {
  return CRITERIA_META[badge.criteria_type] || {
    label: 'Цель',
    icon: <FaAward />,
    tone: 'cyan',
    text: (value) => `${value}`
  };
}

function getInitials(name = '?') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || '?';
}

export default function Badges() {
  const addToast = useToast();
  const auth = useSelector(state => state.auth);
  const [badges, setBadges] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stars] = useState(() =>
    Array.from({ length: 42 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: 1 + Math.random() * 2.4,
      dur: 2 + Math.random() * 4,
      delay: Math.random() * 5
    }))
  );

  useEffect(() => {
    async function loadChildren() {
      try {
        if (auth?.role !== 'parent') return;
        const res = await api.get('/auth/children');
        const list = res.data || [];
        setChildren(list);
        setSelectedChild(current => current || list[0]?.id || '');
      } catch (err) {
        console.error('Failed to load children:', err);
      }
    }

    loadChildren();
  }, [auth?.role]);

  useEffect(() => {
    async function loadBadges() {
      try {
        setLoading(true);
        setError(null);

        const targetId = auth?.role === 'child' ? auth.user?.id : selectedChild;
        const endpoint = targetId ? `/badges/for-child/${targetId}` : '/badges';
        const res = await api.get(endpoint);
        const list = res.data || [];
        setBadges(list);

        if (targetId) {
          const earnedIds = list.filter(badge => badge.earned).map(badge => badge.id);
          const key = `seen_badges_${targetId}`;
          const seen = JSON.parse(localStorage.getItem(key) || '[]');
          const newOnes = earnedIds.filter(id => !seen.includes(id));
          newOnes.forEach(id => {
            const badge = list.find(item => item.id === id);
            addToast(`Новый бейдж: ${badge?.name || 'Achievement'}`);
          });
          if (newOnes.length) {
            localStorage.setItem(key, JSON.stringify(Array.from(new Set([...seen, ...earnedIds]))));
          }
        }
      } catch (err) {
        console.error('Failed to load badges:', err);
        setError(err.response?.data?.error || 'Не удалось загрузить бейджи');
      } finally {
        setLoading(false);
      }
    }

    if (auth?.role === 'parent' && !selectedChild) {
      setBadges([]);
      setLoading(false);
      return;
    }

    loadBadges();
  }, [auth?.role, auth?.user?.id, selectedChild, addToast]);

  const earnedCount = badges.filter(badge => badge.earned).length;
  const totalCount = badges.length;
  const completion = totalCount ? Math.round((earnedCount / totalCount) * 100) : 0;

  const filteredBadges = useMemo(() => {
    return badges.filter(badge => {
      if (filter === 'earned') return badge.earned;
      if (filter === 'locked') return !badge.earned;
      if (filter === 'all') return true;
      return badge.criteria_type === filter;
    });
  }, [badges, filter]);

  const selectedChildName = children.find(child => child.id === selectedChild)?.name;
  const viewerName = auth?.role === 'child' ? auth.user?.name : selectedChildName;

  return (
    <div className="space-bg badges-page">
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

      <div className="z1 badges-shell">
        <AppNav />

        <section className="badges-hero">
          <div className="badges-hero-copy">
            <div className="eyebrow"><FaMedal /> Коллекция достижений</div>
            <h1>Бейджи</h1>
            <p>
              Собирайте награды за уроки, XP и учебные серии. Полученные бейджи светятся в коллекции.
            </p>
          </div>

          <div className="badge-progress-card">
            <div className="badge-orbit">
              <div className="badge-orbit-core"><FaAward /></div>
              <span />
              <span />
              <span />
            </div>
            <div className="badge-progress-value">{completion}%</div>
            <div className="badge-progress-label">коллекции открыто</div>
            <div className="badge-progress-track">
              <div style={{ width: `${completion}%` }} />
            </div>
          </div>
        </section>

        <section className="badges-toolbar">
          {auth?.role === 'parent' && (
            <label className="child-select-wrap">
              <FaChild />
              <select value={selectedChild} onChange={e => setSelectedChild(e.target.value)}>
                <option value="">Выберите ребёнка</option>
                {children.map(child => (
                  <option key={child.id} value={child.id}>{child.name}</option>
                ))}
              </select>
            </label>
          )}

          <div className="badge-filter-tabs">
            {FILTERS.map(item => (
              <button
                key={item.value}
                type="button"
                className={filter === item.value ? 'active' : ''}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="badge-summary-grid">
          <div className="badge-summary-card">
            <FaCheckCircle />
            <span>{earnedCount}</span>
            <p>Получено</p>
          </div>
          <div className="badge-summary-card">
            <FaLock />
            <span>{Math.max(totalCount - earnedCount, 0)}</span>
            <p>Еще закрыто</p>
          </div>
          <div className="badge-summary-card">
            <FaAward />
            <span>{totalCount}</span>
            <p>{viewerName ? `Всего для ${viewerName}` : 'Всего бейджей'}</p>
          </div>
        </section>

        {loading ? (
          <div className="badges-grid">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="badge-card badge-skeleton" />
            ))}
          </div>
        ) : error ? (
          <div className="leaderboard-state error">{error}</div>
        ) : filteredBadges.length === 0 ? (
          <div className="leaderboard-state">В этой категории пока пусто</div>
        ) : (
          <div className="badges-grid">
            {filteredBadges.map((badge, index) => {
              const meta = getBadgeMeta(badge);
              return (
                <article
                  key={badge.id}
                  className={`badge-card ${badge.earned ? 'earned' : 'locked'} tone-${meta.tone}`}
                  style={{ animationDelay: `${Math.min(index * 70, 560)}ms` }}
                >
                  <div className="badge-card-glow" />
                  <div className="badge-status">
                    {badge.earned ? <><FaCheckCircle /> Получен</> : <><FaLock /> Закрыт</>}
                  </div>

                  <div className="badge-emblem">
                    {badge.icon_url ? (
                      <img src={badge.icon_url} alt={badge.name} />
                    ) : (
                      <span>{badge.earned ? meta.icon : getInitials(badge.name)}</span>
                    )}
                  </div>

                  <div className="badge-type">{meta.icon} {meta.label}</div>
                  <h2>{badge.name}</h2>
                  <p>{badge.description || 'Достижение за учебный прогресс.'}</p>

                  <div className="badge-requirement">
                    <span>Цель</span>
                    <strong>{meta.text(badge.criteria_value)}</strong>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
