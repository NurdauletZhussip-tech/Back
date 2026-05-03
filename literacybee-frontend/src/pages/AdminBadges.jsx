import React, { useEffect, useState } from 'react';
import api from '../api';
import { useToast } from '../components/ToastProvider';

export default function AdminBadges() {
  const addToast = useToast();
  const [badges, setBadges] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', criteria_type: 'lessons_completed', criteria_value: 1, icon_url: '' });
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      const res = await api.get('/admin/badges');
      setBadges(res.data || []);
    } catch (err) {
      addToast('Failed to load badges');
      console.error(err);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/admin/badges/${editing}`, form);
        addToast('Badge updated');
      } else {
        await api.post('/admin/badges', form);
        addToast('Badge created');
      }
      setForm({ name: '', description: '', criteria_type: 'lessons_completed', criteria_value: 1, icon_url: '' });
      setEditing(null);
      load();
    } catch (err) {
      addToast('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = (b) => {
    setEditing(b.id);
    setForm({ name: b.name, description: b.description || '', criteria_type: b.criteria_type, criteria_value: b.criteria_value, icon_url: b.icon_url || '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить бейдж?')) return; // Добавлено window.
    try {
      await api.delete(`/admin/badges/${id}`);
      addToast('Badge deleted');
      load();
    } catch (err) {
      addToast('Error deleting');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Управление бейджами</h2>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8 }}>
            <input placeholder="Название" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <input placeholder="Icon URL" value={form.icon_url} onChange={e => setForm({...form, icon_url: e.target.value})} />
            <textarea placeholder="Описание" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            <select value={form.criteria_type} onChange={e => setForm({...form, criteria_type: e.target.value})}>
              <option value="lessons_completed">lessons_completed</option>
              <option value="total_xp">total_xp</option>
              <option value="streak_days">streak_days</option>
            </select>
            <input type="number" value={form.criteria_value} onChange={e => setForm({...form, criteria_value: Number(e.target.value)})} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="admin-btn green" type="submit">{editing ? 'Save' : 'Create'}</button>
              {editing && <button type="button" className="admin-btn" onClick={() => { setEditing(null); setForm({ name: '', description: '', criteria_type: 'lessons_completed', criteria_value: 1, icon_url: '' }); }}>Cancel</button>}
            </div>
          </form>
        </div>

        <div style={{ flex: 2 }}>
          <h3>Существующие бейджи</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {badges.map(b => (
              <div key={b.id} style={{ padding: 10, border: '1px solid #eee', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{b.name}</strong>
                  <div style={{ fontSize: 12, color: '#666' }}>{b.description}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{b.criteria_type} = {b.criteria_value}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleEdit(b)} className="admin-btn">Edit</button>
                  <button onClick={() => handleDelete(b.id)} className="admin-btn red">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* toasts handled by ToastProvider */}
    </div>
  );
}


