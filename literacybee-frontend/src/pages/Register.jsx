import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { registerParent } from '../store/authSlice';
import { Link } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';

export default function Register() {
  const addToast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await dispatch(registerParent({ email, password, name })).unwrap();
      setEmailPreviewUrl(result.emailPreviewUrl || '');
      setVerificationUrl(result.verificationUrl || '');
      addToast('Registration complete. Verify your email before logging in.');
    } catch (err) {
      addToast(err || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-text">Register</div>
          <div className="auth-logo-sub">Create a parent account</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Name</label>
            <input
              type="text" className="auth-input" placeholder="Your name"
              value={name} onChange={e => setName(e.target.value)} required
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              type="email" className="auth-input" placeholder="ivan@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              type="password" className="auth-input" placeholder="Password"
              value={password} onChange={e => setPassword(e.target.value)} required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}
            style={{ marginTop: 8 }}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {emailPreviewUrl && (
          <div className="auth-link-row" style={{ marginTop: 12 }}>
            Ethereal preview:{' '}
            <a className="auth-link" href={emailPreviewUrl} target="_blank" rel="noreferrer">
              open email
            </a>
          </div>
        )}

        {!emailPreviewUrl && verificationUrl && (
          <div className="auth-link-row" style={{ marginTop: 12 }}>
            Dev verify link:{' '}
            <a className="auth-link" href={verificationUrl} target="_blank" rel="noreferrer">
              verify email
            </a>
          </div>
        )}

        <div className="auth-link-row">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Log in</Link>
        </div>
      </div>
    </div>
  );
}
