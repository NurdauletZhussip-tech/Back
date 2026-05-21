import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { forgotPassword } from '../store/authSlice';
import { useToast } from '../components/ToastProvider';

export default function ForgotPassword() {
  const dispatch = useDispatch();
  const addToast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState('');
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await dispatch(forgotPassword({ email })).unwrap();
      setEmailPreviewUrl(result.emailPreviewUrl || '');
      setResetUrl(result.resetUrl || '');
      addToast(result.message || 'Password reset email sent');
    } catch (err) {
      addToast(err || 'Password reset request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-text">Reset password</div>
          <div className="auth-logo-sub">Enter your parent or admin email</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              type="email" className="auth-input" placeholder="ivan@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}
            style={{ marginTop: 8 }}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        {(emailPreviewUrl || resetUrl) && (
          <div className="auth-link-row" style={{ marginTop: 12 }}>
            {emailPreviewUrl ? (
              <a className="auth-link" href={emailPreviewUrl} target="_blank" rel="noreferrer">Open Ethereal email</a>
            ) : (
              <a className="auth-link" href={resetUrl} target="_blank" rel="noreferrer">Open dev reset link</a>
            )}
          </div>
        )}

        <div className="auth-link-row">
          <Link to="/login" className="auth-link">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
