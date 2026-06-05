/* GoGO Pantry — Staff shell: Login + App frame (sidebar, topbar) */

/* ---------- LOGIN ---------- */
function StaffLogin({ onLogin }) {
  const [email, setEmail] = useState("alex.rivera@gogopantry.com");
  const [pw, setPw] = useState("••••••••••");
  const [shop, setShop] = useState("msn");
  const [loading, setLoading] = useState(false);
  const submit = (e) => { e.preventDefault(); setLoading(true); setTimeout(() => onLogin(shop), 650); };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)", padding: 40,
      backgroundImage: "radial-gradient(80% 80% at 50% 0%, oklch(0.24 0.025 152) 0%, var(--bg) 60%)" }}>
      <div style={{ width: "100%", maxWidth: 392, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 20, padding: "38px 36px", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}><Logo size={30} /></div>
        <h2 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 5px", color: "var(--text)", textAlign: "center" }}>Sign in to your store</h2>
        <p style={{ color: "var(--text-2)", margin: "0 0 26px", fontSize: 14.5, textAlign: "center" }}>Store Operations Console</p>

        <form onSubmit={submit}>
          <Field label="Work email">
            <input value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Password">
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Store location">
            <div style={{ position: "relative" }}>
              <select value={shop} onChange={e => setShop(e.target.value)} style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
                {G.SHOPS.map(s => <option key={s.id} value={s.id}>{s.name} · {s.code}</option>)}
              </select>
              <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-3)" }}><Icon name="chevD" size={16} /></span>
            </div>
          </Field>

          <Btn full type="submit" style={{ marginTop: 8, opacity: loading ? 0.8 : 1 }}>
            {loading ? "Signing in…" : "Sign in"}
          </Btn>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, fontSize: 13, color: "var(--text-3)" }}>
            <span>Trouble signing in?</span>
            <a href="#" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>Get help</a>
          </div>
        </form>
      </div>
    </div>
  );
}
const inputStyle = {
  width: "100%", padding: "12px 14px", borderRadius: 11, border: "1px solid var(--line)",
  background: "var(--surface)", color: "var(--text)", fontSize: 15, fontFamily: "var(--font-sans)", outline: "none",
};
function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 7 }}>{label}</span>
      {children}
    </label>
  );
}

/* ---------- APP SHELL ---------- */
function Shell({ shopId, route, setRoute, onLogout, children }) {
  const shop = G.SHOPS.find(s => s.id === shopId);
  const nav = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "fulfill", label: "Fulfillment", icon: "clipboard", badge: G.ORDERS.filter(o => o.status === "new").length },
    { id: "receive", label: "Receive Stock", icon: "truck" },
    { id: "transfer", label: "Transfers", icon: "transfer" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "248px 1fr", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside style={{ borderRight: "1px solid var(--line)", background: "var(--bg-sunken)", padding: "22px 16px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "0 8px 18px" }}><Logo size={28} /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 12px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)", marginBottom: 4 }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: `oklch(0.6 0.13 ${shop.tint})`, color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="pin" size={16} /></span>
          <span style={{ flex: 1, lineHeight: 1.2, overflow: "hidden" }}>
            <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{shop.name}</span>
            <span style={{ display: "block", fontSize: 11.5, color: "var(--text-3)" }}>{shop.code} · Open</span>
          </span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 20 }}>
          <div style={navLabel}>Operations</div>
          {nav.map(n => (
            <button key={n.id} onClick={() => setRoute(n.id)} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 11, border: "none", cursor: "pointer",
              background: route === n.id ? "var(--surface)" : "transparent", color: route === n.id ? "var(--text)" : "var(--text-2)",
              fontFamily: "var(--font-sans)", fontSize: 14.5, fontWeight: route === n.id ? 700 : 500, textAlign: "left",
              boxShadow: route === n.id ? "var(--shadow-sm)" : "none", transition: "all .15s var(--ease)",
            }}
            onMouseEnter={e => { if (route !== n.id) e.currentTarget.style.background = "var(--surface-2)"; }}
            onMouseLeave={e => { if (route !== n.id) e.currentTarget.style.background = "transparent"; }}>
              <span style={{ color: route === n.id ? "var(--primary)" : "var(--text-3)" }}><Icon name={n.icon} size={19} /></span>
              <span style={{ flex: 1 }}>{n.label}</span>
              {n.badge ? <span className="tnum" style={{ background: "var(--primary)", color: "var(--primary-ink)", fontSize: 11.5, fontWeight: 800, minWidth: 20, height: 20, borderRadius: 999, display: "grid", placeItems: "center", padding: "0 6px" }}>{n.badge}</span> : null}
            </button>
          ))}
        </nav>
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
          <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 11, border: "none", cursor: "pointer", background: "transparent", color: "var(--text-2)", fontFamily: "var(--font-sans)", fontSize: 14.5, fontWeight: 500, whiteSpace: "nowrap" }}>
            <span style={{ color: "var(--text-3)" }}><Icon name="logout" size={19} /></span> Sign out
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginTop: 6, borderRadius: 12, background: "var(--surface)" }}>
            <div style={{ width: 34, height: 34, borderRadius: 999, background: "var(--green-600)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13 }}>AR</div>
            <div style={{ lineHeight: 1.2, overflow: "hidden" }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Alex Rivera</div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>Store Manager</div>
            </div>
          </div>
        </div>
      </aside>
      {/* Main */}
      <main style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>{children}</main>
    </div>
  );
}
const navLabel = { fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-3)", padding: "4px 12px 8px" };

function ShopSwitch({ shop }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "11px 12px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer", textAlign: "left" }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: `oklch(0.6 0.13 ${shop.tint})`, color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="pin" size={16} /></span>
        <span style={{ flex: 1, lineHeight: 1.2, overflow: "hidden" }}>
          <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{shop.name}</span>
          <span style={{ display: "block", fontSize: 11.5, color: "var(--text-3)" }}>{shop.code} · Open</span>
        </span>
        <Icon name="chevD" size={16} style={{ color: "var(--text-3)" }} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 30, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, boxShadow: "var(--shadow-lg)", padding: 6, animation: "gg-scale-in .14s var(--ease)" }}>
          {G.SHOPS.map(s => (
            <button key={s.id} onClick={() => setOpen(false)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 9, border: "none", background: s.id === shop.id ? "var(--surface-2)" : "transparent", cursor: "pointer", textAlign: "left" }}>
              <span style={{ width: 24, height: 24, borderRadius: 7, background: `oklch(0.6 0.13 ${s.tint})`, color: "#fff", display: "grid", placeItems: "center", flexShrink: 0, fontSize: 11 }}><Icon name="pin" size={13} /></span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{s.name}</span>
              {s.id === shop.id && <Icon name="check" size={15} style={{ color: "var(--primary)" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- Page header (shared across screens) ---- */
function PageHead({ title, subtitle, children }) {
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
          <span style={{ position: "absolute", top: 9, right: 10, width: 7, height: 7, borderRadius: 999, background: "var(--warm-500)", boxShadow: "0 0 0 2px var(--surface)" }} />
        </button>
      </div>
    </header>
  );
}

Object.assign(window, { StaffLogin, Shell, PageHead, Field, inputStyle });
