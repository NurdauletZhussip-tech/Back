import React, { useEffect } from 'react';

export default function PinModal({ open, onClose, onConfirm, childName }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  let pinInput = '';

  return (
    <div style={{ position: 'fixed', left:0, top:0, right:0, bottom:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10000 }}>
      <div style={{ background:'#fff', padding:20, borderRadius:8, width:320 }}>
        <h3>Войти как {childName}</h3>
        <input autoFocus placeholder="Введите PIN" onChange={e => pinInput = e.target.value} style={{ width:'100%', padding:8, marginBottom:12 }} />
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button className="admin-btn" onClick={onClose}>Отмена</button>
          <button className="admin-btn green" onClick={() => { onConfirm(pinInput); }}>Войти</button>
        </div>
      </div>
    </div>
  );
}

