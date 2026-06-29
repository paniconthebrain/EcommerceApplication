import { useState } from 'react';

export function CookieSettings() {
  const [prefs, setPrefs] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key) => {
    if (key === 'necessary') return;
    setSaved(false);
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  };

  const handleSave = () => {
    try { localStorage.setItem('cookiePrefs', JSON.stringify(prefs)); } catch {}
    setSaved(true);
  };

  const handleAcceptAll = () => {
    const all = { necessary: true, analytics: true, marketing: true, preferences: true };
    setPrefs(all);
    try { localStorage.setItem('cookiePrefs', JSON.stringify(all)); } catch {}
    setSaved(true);
  };

  const COOKIES = [
    {
      key: 'necessary',
      label: 'Strictly Necessary',
      description: 'These cookies are essential for the website to function correctly. They enable core features such as login sessions, cart persistence, and security. They cannot be disabled.',
      examples: 'Session token, cart data, CSRF protection',
      required: true,
    },
    {
      key: 'preferences',
      label: 'Preference & Functionality',
      description: 'These cookies remember your choices and personalise your experience — such as your selected store, saved items, and display preferences.',
      examples: 'Store selection, saved wishlist, UI preferences',
      required: false,
    },
    {
      key: 'analytics',
      label: 'Analytics & Performance',
      description: 'These cookies help us understand how visitors use our website — which pages are most visited, where users drop off, and how we can improve. All data is aggregated and anonymous.',
      examples: 'Page views, session duration, error tracking',
      required: false,
    },
    {
      key: 'marketing',
      label: 'Marketing & Advertising',
      description: 'These cookies are used to deliver relevant promotional content and measure the effectiveness of our marketing campaigns. We do not sell your data to third parties.',
      examples: 'Ad targeting, campaign attribution, retargeting',
      required: false,
    },
  ];

  const body = { fontSize: 15, color: 'var(--text-2)', lineHeight: 1.8, margin: 0 };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(32px, 5vw, 64px) clamp(16px, 4vw, 32px) 64px' }}>

      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'var(--surface-2)', border: '1px solid var(--line)',
          borderRadius: 999, padding: '5px 16px', marginBottom: 20, fontSize: 12,
          fontWeight: 700, color: 'var(--text-3)',
        }}>
          Last updated: June 29, 2026
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text)', margin: '0 0 16px' }}>
          Cookie Settings
        </h1>
        <p style={body}>
          We use cookies and similar technologies to make GoGo Pantry work, improve your experience, and
          understand how our platform is used. You can choose which categories of cookies to allow below.
          Your preferences are saved to this browser.
        </p>
      </div>

      {/* Cookie cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
        {COOKIES.map(({ key, label, description, examples, required }) => {
          const active = prefs[key];
          return (
            <div
              key={key}
              style={{
                background: 'var(--surface)',
                border: `1.5px solid ${active ? 'var(--primary)' : 'var(--line)'}`,
                borderRadius: 16,
                padding: '20px 22px',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{label}</span>
                    {required && (
                      <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--primary-soft)', color: 'var(--green-700)', padding: '2px 8px', borderRadius: 999 }}>
                        Always on
                      </span>
                    )}
                    {!required && active && (
                      <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--primary-soft)', color: 'var(--green-700)', padding: '2px 8px', borderRadius: 999 }}>
                        Enabled
                      </span>
                    )}
                  </div>
                  <p style={{ ...body, fontSize: 14, marginBottom: 10 }}>{description}</p>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>
                    Examples: <span style={{ fontWeight: 400 }}>{examples}</span>
                  </div>
                </div>

                {/* Toggle */}
                <button
                  onClick={() => toggle(key)}
                  aria-label={`${active ? 'Disable' : 'Enable'} ${label} cookies`}
                  style={{
                    flexShrink: 0,
                    width: 48,
                    height: 26,
                    borderRadius: 999,
                    border: 'none',
                    background: active ? 'var(--primary)' : 'var(--line)',
                    cursor: required ? 'not-allowed' : 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                    opacity: required ? 0.6 : 1,
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    top: 3,
                    left: active ? 'calc(100% - 23px)' : 3,
                    width: 20,
                    height: 20,
                    borderRadius: 999,
                    background: '#fff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    transition: 'left 0.2s',
                  }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save bar */}
      <div style={{
        position: 'sticky',
        bottom: 20,
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 16,
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {saved ? (
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--green-700)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>✓</span> Preferences saved
          </span>
        ) : (
          <span style={{ fontSize: 14, color: 'var(--text-2)' }}>
            You have unsaved changes.
          </span>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleAcceptAll}
            style={{
              padding: '10px 20px', borderRadius: 10, border: '1.5px solid var(--line)',
              background: 'var(--surface-2)', color: 'var(--text)', fontWeight: 700,
              fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--line)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}
          >
            Accept all
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px', borderRadius: 10, border: 'none',
              background: 'var(--primary)', color: '#fff', fontWeight: 700,
              fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)',
              boxShadow: 'var(--shadow-primary)', transition: 'filter 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.08)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            Save preferences
          </button>
        </div>
      </div>

      {/* Info note */}
      <p style={{ ...body, fontSize: 13, color: 'var(--text-3)', marginTop: 28, textAlign: 'center' }}>
        Your preferences apply to this browser only. Clearing your browser data will reset these settings.
        For more information, see our{' '}
        <a href="/privacy" style={{ color: 'var(--primary)', fontWeight: 600 }}>Privacy Policy</a>.
      </p>

    </div>
  );
}
