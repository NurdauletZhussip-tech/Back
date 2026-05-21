import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginParent, resendVerification } from '../store/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';

export default function Login() {
  const addToast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState('');
  const [emailPreviewUrl, setEmailPreviewUrl] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await dispatch(loginParent({ email, password })).unwrap();

      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/parent/dashboard');
      }
    } catch (err) {
      addToast(err || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      addToast('Enter your email first');
      return;
    }

    setResending(true);
    try {
      const result = await dispatch(resendVerification({ email })).unwrap();
      setEmailPreviewUrl(result.emailPreviewUrl || '');
      setVerificationUrl(result.verificationUrl || '');
      addToast(result.message || 'Verification email sent');
    } catch (err) {
      addToast(err || 'Could not resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-text">LiteracyBee</div>
          <div className="auth-logo-sub">Log in to your account</div>
        </div>

        <form onSubmit={handleSubmit}>
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
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="auth-link-row">
          No account? <Link to="/register" className="auth-link">Register</Link>
        </div>
        <div className="auth-link-row" style={{ marginTop: 8 }}>
          <button type="button" className="auth-link" onClick={handleResendVerification} disabled={resending}
            style={{ border: 0, background: 'transparent', cursor: 'pointer' }}>
            {resending ? 'Sending...' : 'Resend verification email'}
          </button>
        </div>
        {(emailPreviewUrl || verificationUrl) && (
          <div className="auth-link-row" style={{ marginTop: 8 }}>
            {emailPreviewUrl ? (
              <a className="auth-link" href={emailPreviewUrl} target="_blank" rel="noreferrer">Open Ethereal email</a>
            ) : (
              <a className="auth-link" href={verificationUrl} target="_blank" rel="noreferrer">Open dev verify link</a>
            )}
          </div>
        )}
        <div className="auth-link-row" style={{ marginTop: 8 }}>
          <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
        </div>
        <div className="auth-link-row" style={{ marginTop: 8 }}>
          <Link to="/child-login" className="auth-link">Child login</Link>
        </div>
      </div>
    </div>
  );
}
