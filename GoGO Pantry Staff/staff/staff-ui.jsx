/* GoGO Pantry — Staff shared UI primitives */
const { useState, useEffect, useRef, useMemo } = React;
const G = window.GOGO;

/* ---- Icon set (simple line icons) ---- */
const ICONS = {
  dashboard: "M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z",
  orders: "M3 7l1.5 12.5a1 1 0 0 0 1 .9h13a1 1 0 0 0 1-.9L21 7M3 7l2-3h14l2 3M3 7h18M9 11v4M15 11v4",
  truck: "M3 4h11v10H3zM14 8h4l3 3v3h-7M5.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  transfer: "M17 3l4 4-4 4M21 7H7M7 21l-4-4 4-4M3 17h14",
  clipboard: "M9 4h6v3H9zM7 5H5v16h14V5h-2M9 12h6M9 16h4",
  box: "M21 8l-9-5-9 5 9 5 9-5ZM3 8v8l9 5 9-5V8M12 13v8",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  chevR: "M9 6l6 6-6 6",
  chevD: "M6 9l6 6 6-6",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  check: "M20 6L9 17l-5-5",
  alert: "M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
  arrowUp: "M12 19V5M5 12l7-7 7 7",
  arrowDown: "M12 5v14M5 12l7 7 7-7",
  leaf: "M11 20A7 7 0 0 1 4 13c0-6 5-9 16-9 0 9-4 12-9 12ZM4 20c2-3 5-6 9-8",
  x: "M18 6 6 18M6 6l12 12",
  scan: "M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2",
  store: "M3 9l1.5-5h15L21 9M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M3 9h18M9 20v-6h6v6",
  user: "M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  trend: "M22 7l-8.5 8.5-5-5L2 17M16 7h6v6",
  cart: "M2 3h2l2.4 12.4a1 1 0 0 0 1 .8h9.7a1 1 0 0 0 1-.8L21 6H6M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  pin: "M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11ZM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  filter: "M3 5h18M6 12h12M10 19h4",
  more: "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  sparkle: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z",
};
function Icon({ name, size = 20, stroke = 2, fill = "none", style }) {
  const d = ICONS[name] || "";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill === "current" ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {d.split("M").filter(Boolean).map((seg, i) => <path key={i} d={"M" + seg} />)}
    </svg>
  );
}

/* ---- Logo mark ---- */
function Logo({ size = 30, dark = true }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: size, height: size, borderRadius: 9, background: "var(--green-500)",
        display: "grid", placeItems: "center", color: "var(--green-700)", flexShrink: 0,
        boxShadow: "inset 0 0 0 2px oklch(1 0 0 / 0.2)"
      }}>
        <Icon name="leaf" size={size * 0.62} stroke={2.4} />
      </div>
      <span style={{ fontWeight: 800, fontSize: size * 0.6, letterSpacing: "-0.02em", color: "var(--text)" }}>
        GoGO<span style={{ color: "var(--primary)" }}>Pantry</span>
      </span>
    </div>
  );
}

/* ---- Status pill ---- */
function Pill({ tone = "neutral", children, dot = false, size = "md" }) {
  const map = {
    ok:       ["var(--green-100)", "var(--green-700)"],
    low:      ["var(--amber-100)", "oklch(0.5 0.12 78)"],
    critical: ["var(--red-100)",   "var(--red-500)"],
    out:      ["var(--red-100)",   "var(--red-500)"],
    info:     ["var(--blue-100)",  "var(--blue-500)"],
    promo:    ["var(--warm-100)",  "var(--warm-600)"],
    neutral:  ["var(--surface-2)", "var(--text-2)"],
  };
  const dk = {
    ok:       ["oklch(0.55 0.1 152 / 0.22)", "var(--green-300)"],
    low:      ["oklch(0.6 0.12 78 / 0.2)",   "var(--amber-500)"],
    critical: ["oklch(0.6 0.16 25 / 0.2)",   "oklch(0.78 0.16 25)"],
    out:      ["oklch(0.6 0.16 25 / 0.2)",   "oklch(0.78 0.16 25)"],
    info:     ["oklch(0.6 0.12 245 / 0.2)",  "oklch(0.78 0.1 245)"],
    promo:    ["oklch(0.6 0.13 45 / 0.2)",   "oklch(0.8 0.13 45)"],
    neutral:  ["var(--surface-2)",           "var(--text-2)"],
  };
  const isDark = document.body.classList.contains("theme-dark");
  const [bg, fg] = (isDark ? dk : map)[tone] || map.neutral;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, background: bg, color: fg,
      fontSize: size === "sm" ? 11 : 12, fontWeight: 700, padding: size === "sm" ? "2px 8px" : "4px 10px",
      borderRadius: 999, lineHeight: 1.4, whiteSpace: "nowrap", letterSpacing: "0.01em"
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 999, background: fg }} />}
      {children}
    </span>
  );
}

/* ---- Stock bar ---- */
function StockBar({ stock, par }) {
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

/* ---- Generic button ---- */
function Btn({ children, variant = "primary", size = "md", icon, onClick, full, style, type }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    fontFamily: "var(--font-sans)", fontWeight: 700, cursor: "pointer", border: "1px solid transparent",
    borderRadius: 10, transition: "all .16s var(--ease)", width: full ? "100%" : "auto",
    fontSize: size === "sm" ? 13 : 14, padding: size === "sm" ? "7px 12px" : "11px 18px", whiteSpace: "nowrap",
  };
  const variants = {
    primary: { background: "var(--primary)", color: "var(--primary-ink)" },
    ghost:   { background: "transparent", color: "var(--text)", borderColor: "var(--line-strong)" },
    soft:    { background: "var(--surface-2)", color: "var(--text)" },
    danger:  { background: "transparent", color: "var(--red-500)", borderColor: "var(--red-500)" },
  };
  return (
    <button type={type || "button"} onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.06)"}
      onMouseLeave={e => e.currentTarget.style.filter = "none"}
      style={{ ...base, ...variants[variant], ...style }}>
      {icon && <Icon name={icon} size={size === "sm" ? 16 : 18} />}
      {children}
    </button>
  );
}

window.StaffUI = { Icon, Logo, Pill, StockBar, Btn };
Object.assign(window, { Icon, Logo, Pill, StockBar, Btn });
