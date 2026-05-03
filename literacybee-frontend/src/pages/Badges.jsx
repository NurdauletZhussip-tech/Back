import React, { useEffect, useState } from 'react';
import api from '../api';
import { useSelector } from 'react-redux';
import { useToast } from '../components/ToastProvider';

export default function Badges() {
  const [badges, setBadges] = useState([]);
  const [awarded, setAwarded] = useState([]);
  const addToast = useToast();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const auth = useSelector(state => state.auth);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/badges');
        setBadges(res.data);
      } catch (err) {
        console.error('Failed to load badges', err);
      }
    }
    load();
  }, []);

  useEffect(() => {
    async function loadAwarded() {
      try {
        if (!auth || !auth.user) return;
        if (auth.role === 'child' || (auth.role === 'parent' && selectedChild)) {
          const targetId = auth.role === 'child' ? auth.user.id : selectedChild;
          if (!targetId) return;
          // Use unified endpoint that returns all badges with `earned` flag
          const res = await api.get(`/badges/for-child/${targetId}`);
          const list = res.data || [];
          setBadges(list);
          const awardedList = list.filter(b => b.earned).map(b => b.id);
          setAwarded(awardedList);

          // show toasts for newly earned badges since last visit
          try {
            const viewerId = auth.role === 'child' ? auth.user.id : targetId;
            const key = `seen_badges_${viewerId}`;
            const seen = JSON.parse(localStorage.getItem(key) || '[]');
            const newOnes = awardedList.filter(id => !seen.includes(id));
            if (newOnes.length) {
              // fetch badge details to show names
              const all = await api.get('/badges');
              const map = (all.data || []).reduce((acc, b) => { acc[b.id]=b; return acc; }, {});
              newOnes.forEach(id => addToast(`You earned: ${map[id]?.name || 'Badge'}`));
              localStorage.setItem(key, JSON.stringify(Array.from(new Set([...seen, ...awardedList]))));
            }
          } catch (e) {
            console.error('toast error', e);
          }
        }
      } catch (err) {
        console.error('Failed to load awarded badges', err);
      }
    }
    loadAwarded();
  }, [auth, selectedChild]);

  useEffect(() => {
    async function loadChildren() {
      try {
        if (auth?.role === 'parent') {
          const res = await api.get('/auth/children');
          setChildren(res.data || []);
        }
      } catch (e) {
        console.error('Failed to load children', e);
      }
    }
    loadChildren();
  }, [auth]);

  // Simple Toast renderer
  function Toast({ message, onClose }) {
    useEffect(() => {
      const t = setTimeout(onClose, 3000);
      return () => clearTimeout(t);
    }, [onClose]);
    return (
      <div style={{ position: 'fixed', right: 20, bottom: 20, background: '#333', color: '#fff', padding: 12, borderRadius: 6, marginTop: 8 }}>{message}</div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Badges</h2>
      {auth?.role === 'parent' && (
        <div style={{ marginBottom: 12 }}>
          <label>Выберите ребёнка: </label>
          <select value={selectedChild || ''} onChange={e => setSelectedChild(e.target.value)}>
            <option value="">-- none --</option>
            {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {badges.map(b => (
          <div key={b.id} style={{ width: 180, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
            <img src={b.icon_url || '/assets/badge_default.png'} alt={b.name} style={{ width: '100%', height: 80, objectFit: 'contain' }} />
            <h4>{b.name}</h4>
            <p style={{ fontSize: 12 }}>{b.description}</p>
            {awarded.includes(b.id) ? (
              <div style={{ color: 'green', fontWeight: 'bold' }}>Earned</div>
            ) : (
              <div style={{ color: '#999' }}>Not earned</div>
            )}
          </div>
        ))}
      </div>
      {toasts.map((m, i) => <Toast key={i} message={m} onClose={() => setToasts(t => t.filter((_, idx) => idx !== i))} />)}
    </div>
  );
}





