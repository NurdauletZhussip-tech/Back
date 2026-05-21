import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChildren, createChild } from '../store/childSlice';
import { loginChild } from '../store/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { FaChartLine, FaChild, FaPlus, FaRocket, FaTrophy } from 'react-icons/fa';
import AppNav from '../components/AppNav';
import { useToast } from '../components/ToastProvider';
import PinModal from '../components/PinModal';

export default function ParentDashboard() {
  const addToast = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { children } = useSelector((state) => state.child);
  const { user } = useSelector((state) => state.auth);

  const [newChildName, setNewChildName] = useState('');
  const [newChildPin, setNewChildPin] = useState('');
  const [loggingInId, setLoggingInId] = useState(null);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingChild, setPendingChild] = useState(null);

  useEffect(() => { dispatch(fetchChildren()); }, [dispatch]);

  const childCountLabel = useMemo(() => {
    if (children.length === 1) return '1 ученик';
    if (children.length > 1 && children.length < 5) return `${children.length} ученика`;
    return `${children.length} учеников`;
  }, [children.length]);

  const handleCreateChild = async () => {
    if (!newChildName || !newChildPin) {
      addToast('Введите имя и PIN');
      return;
    }

    try {
      await dispatch(createChild({ name: newChildName, pin: newChildPin })).unwrap();
      setNewChildName('');
      setNewChildPin('');
      addToast('Ученик создан');
    } catch {
      addToast('Ошибка создания ребёнка');
    }
  };

  const handleOpenLoginModal = (child) => {
    setPendingChild(child);
    setPinModalOpen(true);
  };

  const handleLoginAsChild = async (pin) => {
    if (!pin || !pendingChild) {
      setPinModalOpen(false);
      return;
    }

    setPinModalOpen(false);
    setLoggingInId(pendingChild.id);
    try {
      await dispatch(loginChild({ childId: pendingChild.id, pin })).unwrap();
      navigate('/child/dashboard');
    } catch {
      addToast('Неверный PIN');
    } finally {
      setLoggingInId(null);
      setPendingChild(null);
    }
  };

  return (
    <div className="parent-bg">
      <div className="parent-inner">
        <AppNav />

        <section className="parent-hero">
          <div>
            <div className="eyebrow">Панель родителя</div>
            <h1>Привет, {user?.name || 'родитель'}!</h1>
            <p>Следите за прогрессом детей, открывайте их кабинет и сравнивайте XP в лидерборде.</p>
          </div>
          <div className="parent-hero-actions">
            <Link to="/leaderboard" className="parent-action-card">
              <FaTrophy />
              <span>Лидерборд</span>
            </Link>
            <Link to="/badges" className="parent-action-card">
              <FaChartLine />
              <span>Бейджи</span>
            </Link>
          </div>
        </section>

        <section className="parent-summary">
          <div className="metric-card">
            <FaChild />
            <span>{children.length}</span>
            <p>{childCountLabel}</p>
          </div>
          <div className="metric-card">
            <FaRocket />
            <span>{children.length ? 'Ready' : 'Start'}</span>
            <p>Быстрый вход в детский режим</p>
          </div>
        </section>

        <section className="parent-card">
          <div className="section-head">
            <div>
              <h2>Создать ребёнка</h2>
              <p>PIN понадобится для входа в детский кабинет</p>
            </div>
          </div>
          <div className="create-child-row">
            <input
              className="parent-input"
              type="text"
              placeholder="Имя ребёнка"
              value={newChildName}
              onChange={e => setNewChildName(e.target.value)}
            />
            <input
              className="parent-input pin-input"
              type="text"
              placeholder="PIN"
              value={newChildPin}
              onChange={e => setNewChildPin(e.target.value)}
            />
            <button className="parent-create-btn" onClick={handleCreateChild}>
              <FaPlus /> Создать
            </button>
          </div>
        </section>

        <section className="parent-card">
          <div className="section-head">
            <div>
              <h2>Мои дети</h2>
              <p>Прогресс и быстрый вход</p>
            </div>
          </div>

          {children.length === 0 ? (
            <div className="empty-state compact">У вас пока нет детей</div>
          ) : (
            <div className="children-list">
              {children.map(child => (
                <div key={child.id} className="child-item">
                  <div className="child-avatar">{child.name?.[0]?.toUpperCase() || '?'}</div>
                  <div className="child-info">
                    <div className="child-name">{child.name}</div>
                    <div className="child-id">ID: {child.id.slice(0, 8)}...</div>
                  </div>
                  <div className="child-actions">
                    <Link to={`/parent/child/${child.id}/progress`} className="child-btn child-btn-green">
                      Прогресс
                    </Link>
                    <button
                      className="child-btn child-btn-orange"
                      disabled={loggingInId === child.id}
                      onClick={() => handleOpenLoginModal(child)}
                    >
                      {loggingInId === child.id ? 'Входим...' : 'Войти ребёнком'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <PinModal
          open={pinModalOpen}
          onClose={() => setPinModalOpen(false)}
          childName={pendingChild?.name}
          onConfirm={handleLoginAsChild}
        />
      </div>
    </div>
  );
}
