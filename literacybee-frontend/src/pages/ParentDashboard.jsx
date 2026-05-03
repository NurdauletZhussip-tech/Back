import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChildren, createChild } from '../store/childSlice';
import { logout, loginChild } from '../store/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import PinModal from '../components/PinModal';

export default function ParentDashboard() {
  const addToast = useToast();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { children } = useSelector((state) => state.child);
  const { user }     = useSelector((state) => state.auth);

  const [newChildName, setNewChildName] = useState('');
  const [newChildPin,  setNewChildPin]  = useState('');
  const [loggingInId,  setLoggingInId]  = useState(null);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingChild, setPendingChild] = useState(null);

  useEffect(() => { dispatch(fetchChildren()); }, [dispatch]);

  const handleCreateChild = async () => {
    if (!newChildName || !newChildPin) { addToast('Введите имя и PIN'); return; }
    try {
      await dispatch(createChild({ name: newChildName, pin: newChildPin })).unwrap();
      setNewChildName(''); setNewChildPin('');
    } catch { addToast('Ошибка создания ребёнка'); }
  };

  const handleOpenLoginModal = (child) => {
    setPendingChild(child);
    setPinModalOpen(true);
  };

  const handleLoginAsChild = async (pin) => {
    if (!pin || !pendingChild) { setPinModalOpen(false); return; }
    setPinModalOpen(false);
    setLoggingInId(pendingChild.id);
    try {
      await dispatch(loginChild({ childId: pendingChild.id, pin })).unwrap();
      navigate('/child/dashboard');
    } catch { addToast('Неверный PIN'); }
    finally { setLoggingInId(null); setPendingChild(null); }
  };

  return (
    <div className="parent-bg">
      <div className="parent-inner">
        {/* Header */}
        <div className="parent-header">
          <div>
            <div className="parent-title">👨‍👩‍👧 Панель родителя</div>
            <div style={{ color: 'rgba(255,255,255,.5)', fontWeight: 600, fontSize: '.95rem', marginTop: 4 }}>
              Привет, {user?.name}!
            </div>
          </div>
          <button className="logout-btn" onClick={() => dispatch(logout())}>Выйти</button>
        </div>

        {/* Create child */}
        <div className="parent-card">
          <div className="parent-card-title">➕ Создать ребёнка</div>
          <div className="create-child-row">
            <input
              className="parent-input" type="text" placeholder="Имя ребёнка"
              value={newChildName} onChange={e => setNewChildName(e.target.value)}
            />
            <input
              className="parent-input" type="text" placeholder="PIN-код"
              value={newChildPin} onChange={e => setNewChildPin(e.target.value)}
              style={{ maxWidth: 160 }}
            />
            <button className="parent-create-btn" onClick={handleCreateChild}>
              Создать
            </button>
          </div>
        </div>

        {/* Children list */}
        <div className="parent-card">
          <div className="parent-card-title">👧 Мои дети</div>
          {children.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,.35)', fontFamily: "'Fredoka One',cursive", fontSize: '1.2rem' }}>
              У вас пока нет детей
            </div>
          ) : (
            children.map(child => (
              <div key={child.id} className="child-item">
                <div>
                  <div className="child-name">{child.name}</div>
                  <div className="child-id">ID: {child.id.slice(0,8)}...</div>
                </div>
                <div className="child-actions">
                  <Link
                    to={`/parent/child/${child.id}/progress`}
                    className="child-btn child-btn-green"
                  >
                    📊 Прогресс
                  </Link>
                  <button
                    className="child-btn child-btn-orange"
                    disabled={loggingInId === child.id}
                    onClick={() => handleOpenLoginModal(child)}
                  >
                    {loggingInId === child.id ? 'Входим...' : '🚀 Войти как ребёнок'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      <PinModal open={pinModalOpen} onClose={() => setPinModalOpen(false)} childName={pendingChild?.name} onConfirm={handleLoginAsChild} />
      </div>
    </div>
  );
}