import { useState, useEffect } from 'react';

const API_AUTH = 'http://localhost:8080/api/auth';

function AuthModal({ isOpen, onClose, onLoginSuccess, initialTab = 'login' }) {
  const [tab, setTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Sync tab with initialTab when modal opens or initialTab changes
  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, initialTab]);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    password: ''
  });

  if (!isOpen) return null;

  const handleTabSwitch = (newTab) => {
    setTab(newTab);
    setError(null);
    setSuccess(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setError('Please enter your email or contact number.');
      return;
    }
    if (!loginPassword) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_AUTH}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          password: loginPassword
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(data.message || 'Login successful!');
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 800);
      } else {
        setError(data.message || 'Invalid email/contact number or password.');
      }
    } catch (err) {
      setError('Server connection error. Make sure backend is running: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, contactNumber, password } = registerForm;

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!contactNumber.trim() || contactNumber.replace(/\D/g, '').length < 7) {
      setError('Please enter a valid contact number (at least 7 digits).');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_AUTH}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('🎉 Account registered successfully! Welcome.');
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 1000);
      } else {
        setError(data.message || 'Registration failed. Please check your details.');
      }
    } catch (err) {
      setError('Server connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Header */}
        <div className="auth-header">
          <div className="auth-brand-chip">
            <span className="auth-logo-icon">✨</span>
            <span>SmartMail AI Enterprise</span>
          </div>
          <button className="btn-close" onClick={onClose} title="Close">×</button>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs-wrapper">
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('login')}
          >
            <span>🔐</span> Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('register')}
          >
            <span>👤</span> Create Account
          </button>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="auth-alert error">
            <span>⚠️ {error}</span>
          </div>
        )}
        {success && (
          <div className="auth-alert success">
            <span>{success}</span>
          </div>
        )}

        {/* LOGIN TAB */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="input-field-group">
              <label className="field-label">
                <span>Email Address or Contact Number *</span>
                <span className="field-hint">e.g. rahul@company.com or 9876543210</span>
              </label>
              <div className="text-input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  className="text-input"
                  placeholder="Enter email or contact number..."
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="input-field-group">
              <label className="field-label">
                <span>Password *</span>
              </label>
              <div className="text-input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="text-input"
                  placeholder="Enter your password..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '18px', height: '18px' }}></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>

            <div className="auth-footer-prompt">
              Don’t have an account yet?{' '}
              <button
                type="button"
                className="btn-link"
                onClick={() => handleTabSwitch('register')}
              >
                Create Account
              </button>
            </div>
          </form>
        ) : (
          /* REGISTER TAB */
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="input-field-group">
              <label className="field-label">
                <span>Full Name *</span>
              </label>
              <div className="text-input-wrapper">
                <span className="input-icon">💼</span>
                <input
                  type="text"
                  className="text-input"
                  placeholder="e.g. Anand Patel"
                  value={registerForm.fullName}
                  onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="input-field-group">
              <label className="field-label">
                <span>Email Address *</span>
                <span className="field-hint">Used for login and mail sender ID</span>
              </label>
              <div className="text-input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  className="text-input"
                  placeholder="e.g. anand@company.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="input-field-group">
              <label className="field-label">
                <span>Contact Number (Phone) *</span>
                <span className="field-hint">Can be used directly to sign in</span>
              </label>
              <div className="text-input-wrapper">
                <span className="input-icon">📱</span>
                <input
                  type="tel"
                  className="text-input"
                  placeholder="e.g. +91 98765 43210"
                  value={registerForm.contactNumber}
                  onChange={(e) => setRegisterForm({ ...registerForm, contactNumber: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="input-field-group">
              <label className="field-label">
                <span>Password *</span>
                <span className="field-hint">Minimum 6 characters</span>
              </label>
              <div className="text-input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="text-input"
                  placeholder="Create a strong password..."
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="btn-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '18px', height: '18px' }}></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Register & Continue</span>
                </>
              )}
            </button>

            <div className="auth-footer-prompt">
              Already have an account?{' '}
              <button
                type="button"
                className="btn-link"
                onClick={() => handleTabSwitch('login')}
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
