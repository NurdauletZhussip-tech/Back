import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ textAlign: 'center', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }} className="gradient-text">
          📚 LiteracyBee
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '2rem' }}>
          Интерактивная платформа обучения чтению для детей
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary">Регистрация родителя</Link>
          <Link to="/login" className="btn btn-secondary">Вход для родителя</Link>
          <Link to="/child-login" className="btn btn-orange">Вход для ребёнка</Link>
        </div>
      </div>
    </div>
  );
}