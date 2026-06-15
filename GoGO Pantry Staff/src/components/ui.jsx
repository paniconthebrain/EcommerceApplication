import { G } from '../globals.js';
import { Icon } from './icons.jsx';

export function Logo({ size = 30 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: size, height: size, borderRadius: 9, background: "var(--primary)", display: "grid", placeItems: "center", color: "white", flexShrink: 0 }}>
        <Icon name="leaf" size={size * 0.62} stroke={2.4} />
      </div>
      <span style={{ fontWeight: 800, fontSize: size * 0.6, letterSpacing: "-0.02em", color: "var(--text)" }}>
        GoGO<span style={{ color: "var(--primary)" }}>Pantry</span>
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

export function Btn({ children, variant = "primary", size = "md", icon, onClick, full, style, type }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    fontFamily: "var(--font-sans)", fontWeight: 700, cursor: "pointer", border: "1px solid transparent",
    borderRadius: 10, transition: "all .16s var(--ease)", width: full ? "100%" : "auto",
    fontSize: size === "sm" ? 13 : 14, padding: size === "sm" ? "7px 12px" : "11px 18px", whiteSpace: "nowrap",
  };
  const variants = {
    primary: { background: "var(--primary)", color: "white" },
    ghost: { background: "transparent", color: "var(--text)", borderColor: "var(--line)" },
    soft: { background: "var(--surface-2)", color: "var(--text)" },
    danger: { background: "var(--red-500)", color: "white" },
  };
  return (
    <button type={type || "button"} onClick={onClick} style={{ ...base, ...variants[variant], ...style }}>
      {icon && <Icon name={icon} size={size === "sm" ? 16 : 18} />}
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

export const card = (extra) => ({ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 18, boxShadow: "var(--shadow-sm)", ...extra });
export const sectionTitle = { fontSize: 15.5, fontWeight: 700, margin: 0, color: "var(--text)", letterSpacing: "-0.01em" };
export const sectionSub = { fontSize: 12.5, margin: "2px 0 0", color: "var(--text-3)" };
export const th = { fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-3)", padding: "11px 16px", textAlign: "left" };
export const td = { padding: "11px 16px", verticalAlign: "middle" };
export const linkBtn = { display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--primary)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-sans)" };
export const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)", fontSize: 14, fontFamily: "var(--font-sans)", outline: "none", boxSizing: "border-box" };
