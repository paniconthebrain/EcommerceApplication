import { useState } from 'react';
import { API_BASE } from '../globals.js';
import { LogoCustomer, BtnC, AuthField, authInputStyle, authContainerStyle, authCardStyle, authHeadingStyle, authSubtitleStyle } from './ui.jsx';
import { IconC } from './icons.jsx';

/* ── Shared inline style tweaks for compact auth ── */
const cardCompact = {
  ...authCardStyle,
  padding: '32px 32px',
};

const cardWide = {
  ...authCardStyle,
  maxWidth: '500px',
  padding: '28px 32px',
};

const headingCompact = {
  ...authHeadingStyle,
  fontSize: 22,
  margin: '0 0 4px',
};

const subtitleCompact = {
  ...authSubtitleStyle,
  margin: '0 0 18px',
  fontSize: 13,
};

const fieldCompact = { marginBottom: 12 };

const row2 = {}; // responsive class auth-row2 handles this

const linkBtn = {
  background: 'none', border: 'none', color: 'var(--primary)',
  fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-sans)',
};

const inputSm = { ...authInputStyle, padding: '10px 12px', fontSize: 14 };

/* ══════════════════════════════════════════════════════════
   LOGIN
══════════════════════════════════════════════════════════ */
export function CustomerLogin({ onLoginSuccess, onSignupClick, onForgotClick, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customers/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Invalid email or password'); return; }
      localStorage.setItem('customerToken', data.token);
      localStorage.setItem('customerRefreshToken', data.refreshToken || '');
      localStorage.setItem('customerAuth', JSON.stringify(data.customer));
      onLoginSuccess(data.customer);
    } catch {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authContainerStyle}>
      <div style={cardCompact} className="auth-card-responsive">
        {onClose && (
          <button onClick={onClose} style={{ ...linkBtn, color: 'var(--text-2)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
            ← Back
          </button>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <LogoCustomer size={30} />
        </div>
        <h1 style={headingCompact}>Welcome back</h1>
        <p style={subtitleCompact}>Sign in to order fresh groceries</p>

        {error && <ErrorBanner msg={error} />}

        <form onSubmit={handleSubmit}>
          <AuthField label="Email address" style={fieldCompact}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" style={authInputStyle} autoComplete="email" />
          </AuthField>
          <AuthField label="Password" style={fieldCompact}>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" style={authInputStyle} autoComplete="current-password" />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
              <button type="button" onClick={onForgotClick} style={linkBtn}>Forgot password?</button>
            </div>
          </AuthField>

          <BtnC full type="submit" loading={loading} style={{ marginBottom: 14, marginTop: 8 }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </BtnC>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-2)', fontSize: 13, margin: 0 }}>
          Don't have an account?{' '}
          <button onClick={onSignupClick} style={linkBtn}>Create one</button>
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SIGNUP — compact 2-column layout, real API
══════════════════════════════════════════════════════════ */
export function CustomerSignup({ onSignupSuccess, onLoginClick, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => { setForm(f => ({ ...f, [field]: e.target.value })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Full name is required'); return; }
    if (!form.phone.trim()) { setError('Phone number is required'); return; }
    if (!form.email.includes('@')) { setError('Valid email is required'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/\d/.test(form.password)) {
      setError('Password needs uppercase, lowercase, and a number'); return;
    }
    if (form.password !== form.confirmPassword) { setError("Passwords don't match"); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customers/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email,
          phone: form.phone.trim(),
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed. Please try again.'); return; }
      localStorage.setItem('customerToken', data.token);
      localStorage.setItem('customerRefreshToken', data.refreshToken || '');
      localStorage.setItem('customerAuth', JSON.stringify(data.customer));
      onSignupSuccess(data.customer);
    } catch {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authContainerStyle}>
      <div style={cardWide} className="auth-card-responsive">
        {onClose && (
          <button onClick={onClose} style={{ ...linkBtn, color: 'var(--text-2)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
            ← Back
          </button>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <LogoCustomer size={28} />
        </div>
        <h1 style={headingCompact}>Create account</h1>
        <p style={subtitleCompact}>Fresh groceries, delivered fast</p>

        {error && <ErrorBanner msg={error} />}

        <form onSubmit={handleSubmit}>
          {/* Row 1: Name + Phone */}
          <div className="auth-row2" style={{ marginBottom: 0 }}>
            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>Full name *</span>
              <input type="text" value={form.name} onChange={set('name')}
                placeholder="Jane Smith" style={inputSm} autoComplete="name" required />
            </label>
            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>Phone *</span>
              <input type="tel" value={form.phone} onChange={set('phone')}
                placeholder="0400 000 000" style={inputSm} autoComplete="tel" maxLength="15" required />
            </label>
          </div>

          {/* Row 2: Email */}
          <label style={{ display: 'block', marginBottom: 12 }}>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>Email address *</span>
            <input type="email" value={form.email} onChange={set('email')}
              placeholder="you@example.com" style={inputSm} autoComplete="email" required />
          </label>

          {/* Row 3: Password + Confirm */}
          <div className="auth-row2">
            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>Password *</span>
              <input type="password" value={form.password} onChange={set('password')}
                placeholder="Min 8 chars" style={inputSm} autoComplete="new-password" required />
            </label>
            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>Confirm *</span>
              <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')}
                placeholder="••••••••" style={inputSm} autoComplete="new-password" required />
            </label>
          </div>

          <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '0 0 14px', lineHeight: 1.4 }}>
            Use 8+ characters with uppercase, lowercase and a number.
          </p>

          <BtnC full type="submit" loading={loading} style={{ marginBottom: 12 }}>
            {loading ? 'Creating account…' : 'Create account'}
          </BtnC>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-2)', fontSize: 13, margin: 0 }}>
          Already have an account?{' '}
          <button onClick={onLoginClick} style={linkBtn}>Sign in</button>
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   FORGOT PASSWORD
══════════════════════════════════════════════════════════ */
export function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${API_BASE}/customers/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch { /* silent — don't reveal if email exists */ }
    finally { setSent(true); setLoading(false); }
  };

  if (sent) {
    return (
      <div style={authContainerStyle}>
        <div style={cardCompact}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <IconC name="mail" size={30} style={{ color: 'var(--text-2)' }} />
            </div>
            <h1 style={headingCompact}>Check your email</h1>
            <p style={{ ...subtitleCompact, margin: '4px 0 20px' }}>If {email} has an account, we've sent a reset link.</p>
            <BtnC full onClick={onBack}>Back to login</BtnC>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={authContainerStyle}>
      <div style={cardCompact}>
        <button onClick={onBack} style={{ ...linkBtn, color: 'var(--text-2)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
          ← Back
        </button>
        <h1 style={headingCompact}>Reset password</h1>
        <p style={subtitleCompact}>Enter your email to receive a reset link</p>
        <form onSubmit={handleSubmit}>
          <AuthField label="Email address">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" style={authInputStyle} required />
          </AuthField>
          <BtnC full type="submit" loading={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </BtnC>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   RESET PASSWORD PAGE
══════════════════════════════════════════════════════════ */
export function ResetPasswordPage({ onDone }) {
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email') || '';
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!email || !token) {
    return (
      <div style={authContainerStyle}>
        <div style={cardCompact}>
          <h1 style={headingCompact}>Invalid link</h1>
          <p style={{ color: 'var(--text-2)', textAlign: 'center', marginBottom: 20 }}>This reset link is missing required information.</p>
          <BtnC full onClick={onDone}>Back to login</BtnC>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={authContainerStyle}>
        <div style={cardCompact}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--green-100)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <IconC name="checkCircle" size={30} style={{ color: 'var(--green-600)' }} />
            </div>
            <h1 style={headingCompact}>Password updated</h1>
            <p style={{ color: 'var(--text-2)', marginBottom: 20, fontSize: 13 }}>You can now sign in with your new password.</p>
            <BtnC full onClick={onDone}>Go to login</BtnC>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      setError('Password must be 8+ characters with uppercase, lowercase, and a number'); return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customers/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Reset failed. The link may have expired.'); return; }
      setSuccess(true);
      window.history.replaceState({}, '', '/');
    } catch {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authContainerStyle}>
      <div style={cardCompact}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}><LogoCustomer size={28} /></div>
        <h1 style={headingCompact}>Set new password</h1>
        <p style={subtitleCompact}>For <strong>{email}</strong></p>
        {error && <ErrorBanner msg={error} />}
        <form onSubmit={handleSubmit}>
          <AuthField label="New password">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min 8 chars, upper, lower, number" style={authInputStyle} />
          </AuthField>
          <AuthField label="Confirm new password">
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••" style={authInputStyle} />
          </AuthField>
          <BtnC full type="submit" loading={loading}>
            {loading ? 'Resetting…' : 'Reset password'}
          </BtnC>
        </form>
      </div>
    </div>
  );
}

/* ── Helper ── */
function ErrorBanner({ msg }) {
  return (
    <div style={{ background: 'var(--red-100)', color: 'var(--red-700)', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 14, border: '1px solid var(--red-300)' }}>
      {msg}
    </div>
  );
}
