import { useState, useEffect, useCallback } from 'react';
import { IconC } from './icons.jsx';

export function LogoCustomer({ size = 28, onClick }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", cursor: onClick ? "pointer" : "default", padding: 0, fontFamily: "inherit", flexShrink: 0 }}>
      <img src="/Logo.webp" alt="Gogo Pantry" style={{ height: size * 1.5, width: size * 1.5, objectFit: "contain", flexShrink: 0 }} />
      <span style={{ fontWeight: 900, fontSize: size * 0.72, letterSpacing: "-0.03em", color: "var(--text)", lineHeight: 1 }}>
        GoGo<span style={{ color: "var(--primary)" }}>Pantry</span>
      </span>
    </button>
  );
}

const BTN_SIZES = {
  sm: { fontSize: 13, padding: "7px 14px", gap: 5, iconSize: 14, borderRadius: 9 },
  md: { fontSize: 14, padding: "11px 20px", gap: 7, iconSize: 17, borderRadius: 12 },
  lg: { fontSize: 16, padding: "14px 28px", gap: 9, iconSize: 20, borderRadius: 14 },
};

export function BtnC({ children, variant = "primary", size = "md", icon, onClick, full, style, type, loading, disabled }) {
  const sz = BTN_SIZES[size] || BTN_SIZES.md;
  const isDisabled = disabled || loading;

  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--font-sans)", fontWeight: 700,
    cursor: isDisabled ? "not-allowed" : "pointer",
    border: "none", borderRadius: sz.borderRadius,
    transition: "all 0.18s var(--ease)",
    width: full ? "100%" : "auto", whiteSpace: "nowrap",
    opacity: isDisabled ? 0.52 : 1,
    fontSize: sz.fontSize, padding: sz.padding, gap: sz.gap,
  };

  const variants = {
    primary: {
      background: "var(--primary)",
      color: "var(--primary-ink)",
      boxShadow: "var(--shadow-primary)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text)",
      border: "1.5px solid var(--line)",
      boxShadow: "none",
    },
    soft: {
      background: "var(--primary-soft)",
      color: "var(--green-700)",
      boxShadow: "none",
    },
    danger: {
      background: "var(--red-100)",
      color: "var(--red-700)",
      boxShadow: "none",
    },
  };

  const handleEnter = (e) => {
    if (isDisabled) return;
    e.currentTarget.style.transform = "translateY(-2px)";
    if (variant === "primary") {
      e.currentTarget.style.boxShadow = "var(--shadow-primary-lg)";
      e.currentTarget.style.background = "var(--primary-hover)";
    } else {
      e.currentTarget.style.filter = "brightness(0.94)";
    }
  };
  const handleLeave = (e) => {
    e.currentTarget.style.transform = "none";
    e.currentTarget.style.filter = "none";
    if (variant === "primary") {
      e.currentTarget.style.boxShadow = "var(--shadow-primary)";
      e.currentTarget.style.background = "var(--primary)";
    }
  };
  const handleDown = (e) => {
    if (!isDisabled) e.currentTarget.style.transform = "translateY(0) scale(0.97)";
  };
  const handleUp = (e) => {
    if (!isDisabled) e.currentTarget.style.transform = "translateY(-1px)";
  };

  return (
    <button
      type={type}
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {loading
        ? <span style={{ width: sz.iconSize, height: sz.iconSize, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.65s linear infinite", display: "inline-block", flexShrink: 0 }} />
        : icon && <IconC name={icon} size={sz.iconSize} />
      }
      {children}
    </button>
  );
}

export function BadgeC({ children, tone = "neutral", size = "md", style }) {
  const baseStyle = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    borderRadius: 6, fontWeight: 700, fontFamily: "var(--font-sans)", whiteSpace: "nowrap",
  };
  const sizes = {
    sm: { padding: "3px 7px", fontSize: 11 },
    md: { padding: "5px 10px", fontSize: 12 },
    lg: { padding: "7px 13px", fontSize: 13 },
  };
  const tones = {
    neutral:  { background: "var(--surface-2)", color: "var(--text-2)" },
    info:     { background: "var(--blue-100)", color: "var(--blue-500)" },
    success:  { background: "var(--green-100)", color: "var(--green-700)" },
    warn:     { background: "var(--amber-100)", color: "oklch(0.55 0.13 78)" },
    critical: { background: "var(--red-100)", color: "var(--red-700)" },
  };
  return (
    <span style={{ ...baseStyle, ...sizes[size], ...tones[tone], ...style }}>
      {children}
    </span>
  );
}

export function AuthField({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 18 }}>
      <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 7, letterSpacing: "0.01em" }}>{label}</span>
      {children}
    </label>
  );
}

export const authInputStyle = {
  width: "100%", padding: "12px 14px", borderRadius: 11, border: "1.5px solid var(--line)",
  background: "var(--surface)", color: "var(--text)", fontSize: 15, fontFamily: "var(--font-sans)", outline: "none",
  transition: "all 0.18s var(--ease)",
};

export const authContainerStyle = {
  minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)", padding: "20px",
  backgroundImage: "radial-gradient(80% 80% at 50% 0%, oklch(0.24 0.025 152) 0%, var(--bg) 60%)",
};

export const authCardStyle = {
  width: "100%", maxWidth: "420px", background: "var(--surface)", border: "1px solid var(--line)",
  borderRadius: "24px", padding: "44px 40px", boxShadow: "var(--shadow-lg)",
};

export const authHeadingStyle = {
  fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 8px", color: "var(--text)", textAlign: "center",
};

export const authSubtitleStyle = {
  color: "var(--text-3)", margin: "0 0 28px", fontSize: 14, textAlign: "center", lineHeight: 1.55,
};

// ===== TOAST =====
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-2), { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);
  const dismiss = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  return { toasts, toast, dismiss };
}

const TOAST_ICON = { success: 'check', error: 'alert', warn: 'alert', info: 'bell' };
const TOAST_COLOR = {
  success: 'var(--green-700)',
  error: 'var(--red-500)',
  warn: 'oklch(0.55 0.13 78)',
  info: 'var(--blue-500)',
};

export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end', pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          position: 'relative', display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden',
          background: TOAST_COLOR[t.type] || TOAST_COLOR.success,
          color: 'white', borderRadius: 12, padding: '12px 16px',
          boxShadow: 'var(--shadow-lg)', pointerEvents: 'all',
          animation: 'toastIn 0.28s var(--spring) both',
          maxWidth: 320, minWidth: 200, fontSize: 14, fontWeight: 600,
        }}>
          <IconC name={TOAST_ICON[t.type] || 'check'} size={16} />
          <span style={{ flex: 1, lineHeight: 1.4 }}>{t.msg}</span>
          <button onClick={() => onDismiss(t.id)} style={{
            background: 'none', border: 'none', color: 'white', opacity: 0.75,
            cursor: 'pointer', padding: 2, display: 'grid', placeItems: 'center',
            fontSize: 18, lineHeight: 1, fontFamily: 'inherit', flexShrink: 0,
          }}>×</button>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
            background: 'oklch(1 0 0 / 0.35)', animation: 'shrink 4s linear both',
          }} />
        </div>
      ))}
    </div>
  );
}

// ===== CONFIRM DIALOG =====
export function ConfirmDialog({ open, title, body, confirm = 'Confirm', cancel = 'Cancel', tone = 'primary', onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onCancel?.(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmVariant = tone === 'danger' ? 'danger' : 'primary';
  const confirmStyle = tone === 'warn' ? { background: 'oklch(0.55 0.13 78)', color: 'white', boxShadow: 'none' } : {};

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998, background: 'oklch(0 0 0 / 0.5)',
      display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.18s var(--ease)',
    }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)', border: '1px solid var(--line)',
        borderRadius: 20, padding: '32px 32px 28px', width: '92%', maxWidth: 400,
        boxShadow: 'var(--shadow-xl)', animation: 'scaleIn 0.22s var(--spring)',
      }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>{title}</h2>
        {body && <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 24px' }}>{body}</p>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <BtnC variant="ghost" onClick={onCancel}>{cancel}</BtnC>
          <BtnC variant={confirmVariant} style={confirmStyle} onClick={onConfirm}>{confirm}</BtnC>
        </div>
      </div>
    </div>
  );
}

// ===== SKELETON =====
export function SkeletonBox({ style }) {
  return <div className="skeleton" style={style} />;
}

export function SkeletonText({ lines = 1, gap = 8 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 12, borderRadius: 6, width: i === lines - 1 && lines > 1 ? '70%' : '100%' }} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div style={{ borderRadius: 18, overflow: 'hidden', background: 'var(--surface)', boxShadow: 'var(--shadow-sm)' }}>
      <div className="skeleton" style={{ width: '100%', paddingBottom: '68%' }} />
      <div style={{ padding: '12px 13px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="skeleton" style={{ height: 13, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 11, borderRadius: 6, width: '60%' }} />
        <div style={{ marginTop: 8 }}>
          <div className="skeleton" style={{ height: 16, borderRadius: 6, width: '45%' }} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonRow({ cols = 4 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '11px 16px' }}>
          <div className="skeleton" style={{ height: 14, borderRadius: 6 }} />
        </td>
      ))}
    </tr>
  );
}

// ===== EMPTY STATE =====
export function EmptyState({ icon, title, sub, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '80px 24px', textAlign: 'center' }}>
      {icon && (
        <div style={{ width: 64, height: 64, borderRadius: 22, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', marginBottom: 4 }}>
          <IconC name={icon} size={30} style={{ color: 'var(--text-3)' }} />
        </div>
      )}
      <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>{title}</h3>
      {sub && <p style={{ fontSize: 14, color: 'var(--text-3)', margin: 0, maxWidth: 320, lineHeight: 1.6 }}>{sub}</p>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
