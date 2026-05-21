import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying email...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing.');
      return;
    }

    api.get('/auth/verify-email', { params: { token } })
      .then(() => {
        setStatus('success');
        setMessage('Email verified. You can log in now.');
      })
      .catch((error) => {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Email verification failed.');
      });
  }, [searchParams]);

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-text">Email verification</div>
          <div className="auth-logo-sub">{message}</div>
        </div>

        {status === 'loading' ? (
          <button className="btn btn-primary btn-full" disabled>Verifying...</button>
        ) : (
          <Link to="/login" className="btn btn-primary btn-full" style={{ textDecoration: 'none' }}>
            Go to login
          </Link>
        )}
      </div>
    </div>
  );
}
