import { IconC } from './icons.jsx';

export function LogoCustomer({ size = 28, onClick }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: onClick ? "pointer" : "default", padding: 0, fontFamily: "inherit" }}>
      <div style={{
        width: size, height: size, borderRadius: 7, background: "var(--green-500)",
        display: "grid", placeItems: "center", color: "#fff", flexShrink: 0, boxShadow: "0 2px 8px oklch(0.68 0.13 152 / 0.2)"
      }}>
        <IconC name="leaf" size={size * 0.6} stroke={2.2} />
      </div>
      <span style={{ fontWeight: 800, fontSize: size * 0.7, letterSpacing: "-0.02em", color: "var(--text)" }}>
        GoGO<span style={{ color: "var(--primary)" }}>Pantry</span>
      </span>
    </button>
  );
}

export function BtnC({ children, variant = "primary", size = "md", icon, onClick, full, style, type }) {
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
    <button type={type} onClick={onClick} onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.06)"} onMouseLeave={e => e.currentTarget.style.filter = "none"}
      style={{ ...base, ...variants[variant], ...style }}>
      {icon && <IconC name={icon} size={size === "sm" ? 16 : 18} />}
      {children}
    </button>
  );
}

export function BadgeC({ children, tone = "neutral", size = "md", style }) {
  const baseStyle = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    borderRadius: 6, fontWeight: 700, fontFamily: "var(--font-sans)", whiteSpace: "nowrap"
  };
  const sizes = {
    sm: { padding: "4px 8px", fontSize: 11 },
    md: { padding: "6px 12px", fontSize: 12 },
    lg: { padding: "8px 16px", fontSize: 13 }
  };
  const tones = {
    neutral:  { background: "var(--surface-2)", color: "var(--text)" },
    info:     { background: "oklch(0.6 0.1 245 / 0.1)", color: "var(--blue-500)" },
    success:  { background: "oklch(0.6 0.1 152 / 0.1)", color: "var(--green-600)" },
    warn:     { background: "oklch(0.6 0.1 78 / 0.1)", color: "var(--warm-600)" },
    critical: { background: "oklch(0.6 0.1 25 / 0.1)", color: "var(--red-700)" }
  };
  return (
    <span style={{ ...baseStyle, ...sizes[size], ...tones[tone], ...style }}>
      {children}
    </span>
  );
}

export function AuthField({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>{label}</span>
      {children}
    </label>
  );
}

export const authInputStyle = {
  width: "100%", padding: "12px 14px", borderRadius: 11, border: "1px solid var(--line)",
  background: "var(--surface)", color: "var(--text)", fontSize: 15, fontFamily: "var(--font-sans)", outline: "none",
};
export const authContainerStyle = {
  minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)", padding: "20px",
  backgroundImage: "radial-gradient(80% 80% at 50% 0%, oklch(0.24 0.025 152) 0%, var(--bg) 60%)"
};
export const authCardStyle = {
  width: "100%", maxWidth: "420px", background: "var(--surface)", border: "1px solid var(--line)",
  borderRadius: "20px", padding: "40px 36px", boxShadow: "var(--shadow-lg)"
};
export const authHeadingStyle = { fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 8px", color: "var(--text)", textAlign: "center" };
export const authSubtitleStyle = { color: "var(--text-2)", margin: "0 0 24px", fontSize: 14.5, textAlign: "center", lineHeight: 1.5 };
