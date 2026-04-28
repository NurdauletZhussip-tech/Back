import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="auth-bg">
      <div className="auth-card" style={{ maxWidth: 560, textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 8 }}>📚</div>
        <h1 className="auth-logo-text" style={{ fontSize: '2.8rem' }}>LiteracyBee</h1>
        <p style={{ color: '#475569', fontSize: '1.1rem', fontWeight: 600, margin: '12px 0 32px' }}>
          Интерактивная платформа обучения чтению для детей
        </p>
        <div className="landing-btns">
          <Link to="/register" className="btn btn-primary">📝 Регистрация родителя</Link>
          <Link to="/login"    className="btn btn-secondary">🔑 Вход для родителя</Link>
          <Link to="/child-login" className="btn btn-orange">🚀 Вход для ребёнка</Link>
        </div>
      </div>
    </div>
  );
}