import { useState, useRef, useEffect } from 'react';
import { G } from '../globals.js';
import { Logo, Btn } from './ui.jsx';
import { Icon } from './icons.jsx';

const NAV_ITEMS = [
  { key: "dashboard", icon: "dashboard", label: "Dashboard" },
  { key: "fulfill", icon: "orders", label: "Fulfillment" },
  { key: "receive", icon: "box", label: "Receiving" },
  { key: "transfer", icon: "transfer", label: "Transfers" },
];

const ADMIN_ITEMS = [
  { key: "manage-shops", icon: "building", label: "Shops" },
  { key: "manage-staff", icon: "users", label: "Staff" },
  { key: "manage-categories", icon: "folder", label: "Catalog" },
  { key: "email-settings", icon: "settings", label: "Email" },
];

export function AdminOnly({ user, children }) {
  if (!user || user.role !== "admin") return null;
  return children;
}

export default function Shell({ user, currentPage, navigate, onLogout, children }) {
  const [shopDropOpen, setShopDropOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(G.SHOPS[0] || null);
  const shopRef = useRef(null);

  useEffect(() => {
    function handler(e) { if (shopRef.current && !shopRef.current.contains(e.target)) setShopDropOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isAdmin = user?.role === "admin";

  const navLink = (key, icon, label) => {
    const active = currentPage === key;
    return (
      <button key={key} onClick={() => navigate(key)}
        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 14px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: active ? 700 : 500, fontSize: 13.5, textAlign: "left", transition: "all .12s", background: active ? "var(--primary)" : "transparent", color: active ? "white" : "var(--text-2)" }}>
        <Icon name={icon} size={18} />
        {label}
      </button>
    );
  };

  const initials = user ? (user.name || user.email || "?").split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() : "?";

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, flexShrink: 0, background: "var(--surface)", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", padding: "20px 14px", overflow: "hidden" }}>
        <div style={{ marginBottom: 28, padding: "0 4px" }}>
          <Logo size={30} />
        </div>

        {/* Shop switcher */}
        <div ref={shopRef} style={{ position: "relative", marginBottom: 20 }}>
          <button onClick={() => setShopDropOpen(v => !v)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--surface-2)", cursor: "pointer", fontFamily: "var(--font-sans)", color: "var(--text)" }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: selectedShop ? `oklch(0.75 0.1 ${selectedShop.tint})` : "var(--primary)", flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedShop?.name || "Select shop"}</span>
            <Icon name="chevD" size={14} style={{ color: "var(--text-3)" }} />
          </button>
          {shopDropOpen && (
            <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 11, boxShadow: "var(--shadow-lg)", zIndex: 50, overflow: "hidden" }}>
              {G.SHOPS.map(shop => (
                <button key={shop.id} onClick={() => { setSelectedShop(shop); setShopDropOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "10px 14px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text)", textAlign: "left" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, background: `oklch(0.75 0.1 ${shop.tint})`, flexShrink: 0 }} />
                  {shop.name}
                  {selectedShop?.id === shop.id && <Icon name="check" size={14} style={{ marginLeft: "auto", color: "var(--primary)" }} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, overflow: "auto" }}>
          {NAV_ITEMS.map(({ key, icon, label }) => navLink(key, icon, label))}

          {isAdmin && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-3)", padding: "16px 14px 6px" }}>Admin</div>
              {ADMIN_ITEMS.map(({ key, icon, label }) => navLink(key, icon, label))}
            </>
          )}
        </nav>

        {/* User strip */}
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--primary)", color: "white", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name || user?.email}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "capitalize" }}>{user?.role || "staff"}</div>
            </div>
            <button onClick={onLogout} title="Sign out"
              style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-3)", display: "grid", placeItems: "center", padding: 4, borderRadius: 6 }}>
              <Icon name="logout" size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
        {children}
      </main>
    </div>
  );
}
