import { useState } from 'react';
import { G, API_BASE, apiFetch } from '../globals.js';
import { Logo } from './ui.jsx';
import { Icon } from './icons.jsx';

export default function StaffLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || "Invalid credentials");
        return;
      }
      const user = { ...data.user, role: data.user.role || data.user.userType };
      G.token = data.token;
      G.currentUser = user;
      sessionStorage.setItem("staff_token", data.token);
      sessionStorage.setItem("staff_user", JSON.stringify(user));
      if (data.refreshToken) sessionStorage.setItem("staff_refresh_token", data.refreshToken);
      onLogin(user);
    } catch {
      setError("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  }

  const field = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)", fontSize: 14.5, fontFamily: "var(--font-sans)", outline: "none", boxSizing: "border-box" };

  return (
    // width:100% matters — #root is display:flex (for the app shell), so
    // without it this container shrinks to content width and hugs the left edge.
    <div style={{ minHeight: "100vh", width: "100%", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <Logo size={38} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 6px", color: "var(--text)" }}>Staff Portal</h1>
          <p style={{ fontSize: 14.5, color: "var(--text-2)", margin: 0 }}>Sign in to manage your store</p>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, padding: 32, boxShadow: "var(--shadow-md)" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "var(--text-2)", marginBottom: 7 }}>Email address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@gogopantry.com" required autoComplete="email" autoFocus
                style={field}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "var(--text-2)", marginBottom: 7 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required autoComplete="current-password"
                  style={{ ...field, paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", display: "grid", placeItems: "center" }}>
                  <Icon name={showPwd ? "eyeOff" : "eye"} size={17} />
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--red-100)", color: "var(--red-500)", borderRadius: 10, padding: "10px 14px", marginBottom: 18, fontSize: 13.5, fontWeight: 600 }}>
                <Icon name="alert" size={16} />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "13px", borderRadius: 11, background: "var(--primary)", color: "white", border: "none", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
