import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetPassword } from '../store/authSlice';
import { useToast } from '../components/ToastProvider';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const addToast = useToast();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const token = searchParams.get('token') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      addToast('Password reset token is missing');
      return;
    }

    setLoading(true);
    try {
      await dispatch(resetPassword({ token, password })).unwrap();
      setDone(true);
      addToast('Password reset complete');
    } catch (err) {
      addToast(err || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-text">New password</div>
          <div className="auth-logo-sub">{done ? 'You can log in now' : 'Choose a new password'}</div>
        </div>

        {!done ? (
          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input
                type="password" className="auth-input" placeholder="New password"
                value={password} onChange={e => setPassword(e.target.value)} minLength={6} required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}
              style={{ marginTop: 8 }}>
              {loading ? 'Saving...' : 'Reset password'}
            </button>
          </form>
        ) : (
          <Link to="/login" className="btn btn-primary btn-full" style={{ textDecoration: 'none' }}>
            Go to login
          </Link>
        )}
      </div>
    </div>
  );
}
