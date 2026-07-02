import { useState, useEffect, useCallback } from 'react';
import { G } from '../globals.js';
import { Icon } from './icons.jsx';

export function Logo({ size = 30 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <img src="/Logo.webp" alt="Gogo Pantry" style={{ height: size * 1.4, objectFit: "contain", flexShrink: 0 }} />
      <span style={{ fontWeight: 800, fontSize: size * 0.6, letterSpacing: "-0.02em", color: "var(--text)" }}>
        GoGo<span style={{ color: "var(--primary)" }}>Pantry</span>
      </span>
    </div>
  );
}

export function Pill({ tone = "neutral", children, dot = false, size = "md" }) {
  const map = {
    ok: ["var(--green-100)", "var(--green-700)"],
    low: ["var(--amber-100)", "oklch(0.5 0.12 78)"],
    critical: ["var(--red-100)", "var(--red-500)"],
    out: ["var(--red-100)", "var(--red-500)"],
    info: ["var(--blue-100)", "var(--blue-500)"],
    warn: ["var(--amber-100)", "var(--amber-600)"],
    neutral: ["var(--surface-2)", "var(--text-2)"],
  };
  const [bg, fg] = map[tone] || map.neutral;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: bg, color: fg, fontSize: size === "sm" ? 11 : 12, fontWeight: 700, padding: size === "sm" ? "2px 8px" : "4px 10px", borderRadius: 999, lineHeight: 1.4, whiteSpace: "nowrap" }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: fg }} />}
      {children}
    </span>
  );
}

export function StockBar({ stock, par }) {
  const state = G.stockState(stock, par);
  const pct = Math.min(100, Math.round((stock / Math.max(par, 1)) * 100));
  const color = { ok: "var(--green-500)", low: "var(--amber-500)", critical: "var(--red-500)", out: "var(--red-500)" }[state];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 120 }}>
      <div style={{ flex: 1, height: 6, background: "var(--surface-2)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: Math.max(pct, stock > 0 ? 6 : 0) + "%", height: "100%", background: color, borderRadius: 999, transition: "width .5s var(--ease)" }} />
      </div>
      <span className="mono tnum" style={{ fontSize: 12, color: "var(--text-2)", minWidth: 28, textAlign: "right" }}>{stock}</span>
    </div>
  );
}

export function Btn({ children, variant = "primary", size = "md", icon, onClick, full, style, type, loading, disabled }) {
  const isDisabled = disabled || loading;
  const iconSize = size === "sm" ? 16 : 18;
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    fontFamily: "var(--font-sans)", fontWeight: 700, cursor: isDisabled ? "not-allowed" : "pointer",
    border: "1px solid transparent", borderRadius: 10, transition: "all .16s var(--ease)",
    width: full ? "100%" : "auto", opacity: isDisabled ? 0.55 : 1,
    fontSize: size === "sm" ? 13 : 14, padding: size === "sm" ? "7px 12px" : "11px 18px", whiteSpace: "nowrap",
  };
  const variants = {
    primary: { background: "var(--primary)", color: "white" },
    ghost: { background: "transparent", color: "var(--text)", borderColor: "var(--line)" },
    soft: { background: "var(--surface-2)", color: "var(--text)" },
    danger: { background: "var(--red-500)", color: "white" },
  };
  return (
    <button type={type || "button"} onClick={!isDisabled ? onClick : undefined} disabled={isDisabled}
      style={{ ...base, ...variants[variant], ...style }}>
      {loading
        ? <span style={{ width: iconSize, height: iconSize, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.65s linear infinite", display: "inline-block", flexShrink: 0 }} />
        : icon && <Icon name={icon} size={iconSize} />}
      {children}
    </button>
  );
}

export function PageHead({ title, subtitle, children }) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 20, background: "color-mix(in oklch, var(--bg) 86%, transparent)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--line)", padding: "18px 34px", display: "flex", alignItems: "center", gap: 20 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", margin: 0, color: "var(--text)" }}>{title}</h1>
        {subtitle && <p style={{ margin: "3px 0 0", fontSize: 13.5, color: "var(--text-2)" }}>{subtitle}</p>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {children}
        <button style={{ position: "relative", width: 40, height: 40, borderRadius: 11, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text-2)", cursor: "pointer", display: "grid", placeItems: "center" }}>
          <Icon name="bell" size={19} />
          <span style={{ position: "absolute", top: 9, right: 10, width: 7, height: 7, borderRadius: 999, background: "var(--primary)" }} />
        </button>
      </div>
    </header>
  );
}

export function ProductSwatch({ p, size = 40, radius }) {
  const c = G.catOf(p.cat);
  const bg = `oklch(0.9 0.07 ${c.hue})`;
  const fg = `oklch(0.4 0.1 ${c.hue})`;
  const initials = p.name.split(" ").slice(0, 2).map(w => w[0]).join("");
  return (
    <div style={{ width: size, height: size, borderRadius: radius != null ? radius : size * 0.26, background: bg, color: fg, display: "grid", placeItems: "center", flexShrink: 0, fontWeight: 800, fontSize: size * 0.34, letterSpacing: "-0.02em" }}>
      {initials}
    </div>
  );
}

export const plural = (n, word, suffix = "s") => `${n} ${word}${n === 1 ? "" : suffix}`;
export const card = (extra) => ({ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 18, boxShadow: "var(--shadow-sm)", ...extra });
export const sectionTitle = { fontSize: 15.5, fontWeight: 700, margin: 0, color: "var(--text)", letterSpacing: "-0.01em" };
export const sectionSub = { fontSize: 12.5, margin: "2px 0 0", color: "var(--text-3)" };
export const th = { fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-3)", padding: "11px 16px", textAlign: "left" };
export const td = { padding: "11px 16px", verticalAlign: "middle" };
export const linkBtn = { display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--primary)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-sans)" };
export const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)", fontSize: 14, fontFamily: "var(--font-sans)", outline: "none", boxSizing: "border-box" };

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
  warn: 'var(--amber-600)',
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
          animation: 'toastIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          maxWidth: 320, minWidth: 200, fontSize: 14, fontWeight: 600,
        }}>
          <Icon name={TOAST_ICON[t.type] || 'check'} size={16} />
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

  const TONE_STYLE = {
    danger: { background: 'var(--red-500)', color: 'white' },
    primary: { background: 'var(--primary)', color: 'white' },
    warn: { background: 'var(--amber-600)', color: 'white' },
  };
  const confirmBtnStyle = TONE_STYLE[tone] || TONE_STYLE.primary;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998, background: 'oklch(0 0 0 / 0.5)',
      display: 'grid', placeItems: 'center', backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.18s ease',
    }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)', border: '1px solid var(--line)',
        borderRadius: 20, padding: '32px 32px 28px', width: '92%', maxWidth: 400,
        boxShadow: 'var(--shadow-xl)', animation: 'scaleIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>{title}</h2>
        {body && <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 24px' }}>{body}</p>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={onCancel}>{cancel}</Btn>
          <button onClick={onConfirm} style={{
            ...confirmBtnStyle, padding: '10px 20px', borderRadius: 10, border: 'none',
            fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-sans)',
          }}>{confirm}</button>
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
    <div style={{ borderRadius: 14, overflow: 'hidden', background: 'var(--surface)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--line)' }}>
      <div className="skeleton" style={{ width: '100%', paddingBottom: '60%' }} />
      <div style={{ padding: '12px 14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="skeleton" style={{ height: 14, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 12, borderRadius: 6, width: '60%' }} />
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '64px 24px', textAlign: 'center' }}>
      {icon && (
        <div style={{ width: 56, height: 56, borderRadius: 18, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', marginBottom: 4 }}>
          <Icon name={icon} size={26} style={{ color: 'var(--text-3)' }} />
        </div>
      )}
      <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>{title}</h3>
      {sub && <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0, maxWidth: 300, lineHeight: 1.6 }}>{sub}</p>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}

// ===== SORTABLE TABLE HEADER =====
export function SortableTh({ label, sortKey, currentSort, onSort, style: extraStyle }) {
  const active = currentSort?.key === sortKey;
  const dir = active ? currentSort.dir : null;
  return (
    <th
      onClick={() => onSort({ key: sortKey, dir: active && dir === 'asc' ? 'desc' : 'asc' })}
      style={{ ...th, cursor: 'pointer', userSelect: 'none', ...extraStyle }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {label}
        <span style={{ opacity: active ? 1 : 0.3, fontSize: 9 }}>{dir === 'desc' ? '▼' : '▲'}</span>
      </span>
    </th>
  );
}
