/* GoGO Pantry — Customer App shared UI */
const { useState, useEffect, useRef, useMemo } = React;
const G = window.GOGO;

/* ---- Customer app icons (subset) ---- */
const ICONS_CUSTOMER = {
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3",
  heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z",
  user: "M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  cart: "M2 3h2l2.4 12.4a1 1 0 0 0 1 .8h9.7a1 1 0 0 0 1-.8L21 6H6M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  pin: "M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11ZM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  leaf: "M11 20A7 7 0 0 1 4 13c0-6 5-9 16-9 0 9-4 12-9 12ZM4 20c2-3 5-6 9-8",
  chevR: "M9 6l6 6-6 6",
  chevD: "M6 9l6 6 6-6",
  x: "M18 6 6 18M6 6l12 12",
  check: "M20 6L9 17l-5-5",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2",
  truck: "M3 4h11v10H3zM14 8h4l3 3v3h-7M5.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  alert: "M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
  checkCircle: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4l-8.97 8.97",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
};

function IconC({ name, size = 20, stroke = 2, fill = "none", style }) {
  const d = ICONS_CUSTOMER[name] || "";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill === "current" ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {d.split("M").filter(Boolean).map((seg, i) => <path key={i} d={"M" + seg} />)}
    </svg>
  );
}

/* ---- Logo for customer app ---- */
function LogoCustomer({ size = 28 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        width: size, height: size, borderRadius: 7, background: "var(--green-500)",
        display: "grid", placeItems: "center", color: "#fff", flexShrink: 0, boxShadow: "0 2px 8px oklch(0.68 0.13 152 / 0.2)"
      }}>
        <IconC name="leaf" size={size * 0.6} stroke={2.2} />
      </div>
      <span style={{ fontWeight: 800, fontSize: size * 0.7, letterSpacing: "-0.02em", color: "var(--text)" }}>
        GoGO<span style={{ color: "var(--primary)" }}>Pantry</span>
      </span>
    </div>
  );
}

/* ---- Pill badge ---- */
function BadgeC({ tone = "neutral", children, dot = false, size = "md" }) {
  const map = {
    ok:       ["var(--green-100)", "var(--green-700)"],
    low:      ["var(--amber-100)", "oklch(0.42 0.14 78)"],
    critical: ["var(--red-100)",   "var(--red-700)"],
    out:      ["var(--red-100)",   "var(--red-700)"],
    info:     ["var(--blue-100)",  "oklch(0.42 0.16 245)"],
    warn:     ["var(--warm-100)",  "oklch(0.46 0.14 45)"],
    neutral:  ["var(--surface-2)", "var(--text)"],
  };
  const [bg, fg] = map[tone] || map.neutral;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, background: bg, color: fg,
      fontSize: size === "sm" ? 11 : 12, fontWeight: 700, padding: size === "sm" ? "2px 8px" : "4px 10px",
      borderRadius: 999, lineHeight: 1.4, whiteSpace: "nowrap", letterSpacing: "0.01em"
    }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: 999, background: fg }} />}
      {children}
    </span>
  );
}

/* ---- Button ---- */
function BtnC({ children, variant = "primary", size = "md", icon, onClick, full, style }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    fontFamily: "var(--font-sans)", fontWeight: 700, cursor: "pointer", border: "none",
    borderRadius: 11, transition: "all .16s var(--ease)", width: full ? "100%" : "auto",
    fontSize: size === "sm" ? 13 : 14, padding: size === "sm" ? "8px 14px" : "12px 20px", whiteSpace: "nowrap",
  };
  const variants = {
    primary: { background: "var(--primary)", color: "var(--primary-ink)" },
    ghost:   { background: "transparent", color: "var(--text)", border: "1px solid var(--line)" },
    soft:    { background: "var(--surface-2)", color: "var(--text)" },
  };
  return (
    <button onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.06)"}
      onMouseLeave={e => e.currentTarget.style.filter = "none"}
      style={{ ...base, ...variants[variant], ...style }}>
      {icon && <IconC name={icon} size={size === "sm" ? 16 : 18} />}
      {children}
    </button>
  );
}

Object.assign(window, { IconC, LogoCustomer, BadgeC, BtnC });
