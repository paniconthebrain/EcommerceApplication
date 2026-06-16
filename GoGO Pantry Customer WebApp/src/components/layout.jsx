import { useState, useRef, useEffect } from 'react';
import { G } from '../globals.js';
import { IconC } from './icons.jsx';
import { LogoCustomer } from './ui.jsx';
import { ShopSelector, StorePopup } from './shop.jsx';

export function MobileBottomNav({ page, setPage, cartCount, shopId, onOpenShopSelector }) {
  const tabs = [
    { id: "home",    label: "Home",    icon: "home" },
    { id: "stores",  label: "Stores",  icon: "pin" },
    { id: "cart",    label: "Cart",    icon: "cart" },
    { id: "account", label: "Account", icon: "user" },
  ];

  const handleTab = (id) => {
    if (id === "stores") { onOpenShopSelector(); return; }
    if (id === "account") return;
    if (id === "cart") { setPage("cart"); return; }
    setPage("home");
  };

  const activeTab = page === "cart" ? "cart" : page === "home" ? "home" : page === "browse" ? "stores" : "home";

  return (
    <nav aria-label="Main navigation" className="showOnMobile mobile-bottom-nav" style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
      background: "var(--surface)", borderTop: "1px solid var(--line)",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      boxShadow: "0 -4px 20px oklch(0 0 0 / 0.08)"
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        const isCart = tab.id === "cart";
        return (
          <button key={tab.id} aria-label={tab.label} aria-current={isActive ? "page" : undefined}
            onClick={() => handleTab(tab.id)}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 4, padding: "10px 0 8px",
              border: "none", background: "transparent",
              color: isActive ? "var(--primary)" : "var(--text-3)",
              cursor: "pointer", fontFamily: "var(--font-sans)",
              transition: "color 0.15s", position: "relative"
            }}>
            <div style={{ position: "relative" }}>
              <IconC name={tab.icon} size={22} stroke={isActive ? 2.5 : 1.8} />
              {isCart && cartCount > 0 && (
                <span style={{
                  position: "absolute", top: -6, right: -8,
                  background: "var(--primary)", color: "var(--primary-ink)",
                  fontSize: 9, fontWeight: 800, width: 16, height: 16,
                  borderRadius: 999, display: "grid", placeItems: "center"
                }}>{cartCount > 9 ? "9+" : cartCount}</span>
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{tab.label}</span>
            {isActive && (
              <span style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: 24, height: 3, borderRadius: "0 0 3px 3px", background: "var(--primary)"
              }} />
            )}
          </button>
        );
      })}
    </nav>
  );
}

export function CustomerShell({ page, setPage, cartCount, user, onLogout, onLoginClick, onNavigate, shopId, onSelectShop }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [shopSelectorOpen, setShopSelectorOpen] = useState(false);
  const [storePopupShop, setStorePopupShop] = useState(null);
  const currentShopName = shopId ? (G.SHOPS.find(s => s.id === shopId)?.name || shopId) : null;
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      {/* Header */}
      <header style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 40, boxShadow: "0 1px 3px oklch(0 0 0 / 0.05)" }}>
        <LogoCustomer size={26} onClick={() => setPage("home")} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => { if (G.SHOPS.length === 1) { setStorePopupShop(G.SHOPS[0]); } else { setShopSelectorOpen(true); } }} className="hideOnMobile"
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--surface-2)", color: "var(--text-2)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.color = "var(--primary-ink)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--text-2)"; }}>
            <IconC name="pin" size={16} />
            <span>{currentShopName || "Select Store"}</span>
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button aria-label="Search" className="hideOnMobile" style={{ width: 40, height: 40, borderRadius: 10, border: "none", background: "transparent", color: "var(--text-2)", cursor: "pointer", display: "grid", placeItems: "center" }}>
            <IconC name="search" size={20} />
          </button>
          <button aria-label="Saved items" className="hideOnMobile" style={{ width: 40, height: 40, borderRadius: 10, border: "none", background: "transparent", color: "var(--text-2)", cursor: "pointer", display: "grid", placeItems: "center" }}>
            <IconC name="heart" size={20} />
          </button>

          <div ref={userMenuRef} style={{ position: "relative" }}>
            <button
              aria-label={user ? "Account menu" : "Sign in"}
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
              onClick={() => user ? setUserMenuOpen(!userMenuOpen) : onLoginClick?.()}
              style={{ width: 40, height: 40, borderRadius: 10, border: "none", background: "transparent", color: "var(--text-2)", cursor: "pointer", display: "grid", placeItems: "center" }}>
              <IconC name="user" size={20} />
            </button>
            {userMenuOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                background: "var(--surface)", border: "1px solid var(--line)",
                borderRadius: 12, boxShadow: "var(--shadow-lg)", zIndex: 50, minWidth: 200,
                animation: "fadeIn 0.14s var(--ease)"
              }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{user?.name || "Account"}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{user?.email}</div>
                </div>
                {["My orders", "Account settings"].map(label => (
                  <button key={label} style={{ width: "100%", padding: "10px 16px", background: "transparent", border: "none", textAlign: "left", fontSize: 13, fontWeight: 500, color: "var(--text-2)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                    {label}
                  </button>
                ))}
                <button onClick={() => { setUserMenuOpen(false); onLogout(); }}
                  style={{ width: "100%", padding: "10px 16px", background: "transparent", border: "none", textAlign: "left", fontSize: 13, fontWeight: 500, color: "var(--red-500)", cursor: "pointer", fontFamily: "var(--font-sans)", borderTop: "1px solid var(--line)" }}>
                  Sign out
                </button>
              </div>
            )}
          </div>

          <button
            aria-label={cartCount > 0 ? `Cart, ${cartCount} item${cartCount !== 1 ? "s" : ""}` : "Cart"}
            onClick={() => setPage("cart")}
            style={{ position: "relative", width: 40, height: 40, borderRadius: 10, border: "none", background: "transparent", color: "var(--text-2)", cursor: "pointer", display: "grid", placeItems: "center" }}>
            <IconC name="cart" size={20} />
            {cartCount > 0 && (
              <span aria-hidden="true" style={{ position: "absolute", top: -6, right: -4, background: "var(--primary)", color: "var(--primary-ink)", fontSize: 10, fontWeight: 800, width: 18, height: 18, borderRadius: 999, display: "grid", placeItems: "center" }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0 }} className="app-main">{onNavigate}</main>

      <MobileBottomNav
        page={page}
        setPage={setPage}
        cartCount={cartCount}
        shopId={shopId}
        onOpenShopSelector={() => setShopSelectorOpen(true)}
      />

      {/* Footer */}
      <footer style={{ background: "oklch(0.18 0.02 152)", color: "#fff", marginTop: "auto" }}>
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "48px 20px" }}>
          <div className="footer-newsletter">
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.1)", borderRadius: 99, padding: "5px 13px", marginBottom: 14 }}>
                <IconC name="leaf" size={16} />
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", opacity: 0.85 }}>Newsletter</span>
              </div>
              <h3 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 10px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>Stay fresh, save more</h3>
              <p style={{ fontSize: 14, margin: "0 0 16px", opacity: 0.65, lineHeight: 1.6, maxWidth: 360 }}>Join 12,000+ local shoppers getting exclusive weekly deals, seasonal picks, and early access to new arrivals.</p>
              <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                {["Weekly deals", "New arrivals", "Zero spam"].map(b => (
                  <div key={b} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, opacity: 0.75 }}>
                    <IconC name="check" size={14} style={{ color: "var(--green-500)", flexShrink: 0 }} /> {b}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: "28px 24px" }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Get your first deal today</div>
                <div style={{ fontSize: 13, opacity: 0.55, marginBottom: 18 }}>No commitment — unsubscribe anytime.</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <input type="email" placeholder="your@email.com"
                    style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 14, fontFamily: "var(--font-sans)", outline: "none", minWidth: 0 }}
                    onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.4)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.18)"} />
                  <button style={{ padding: "12px 22px", borderRadius: 10, border: "none", background: "var(--primary)", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "var(--font-sans)", whiteSpace: "nowrap" }}>
                    Subscribe →
                  </button>
                </div>
                <div style={{ fontSize: 12, opacity: 0.4, marginTop: 12 }}>By subscribing you agree to our Privacy Policy.</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "32px 20px" }} className="footer-links">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <img src="/Logo.webp" alt="Gogo Pantry" style={{ height: 44, objectFit: "contain" }} />
              <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-0.01em" }}>GoGo<span style={{ color: "var(--primary)" }}>Pantry</span></span>
            </div>
            <p style={{ fontSize: 13, opacity: 0.6, lineHeight: 1.6, margin: 0 }}>Fresh groceries, delivered fast. Supporting local stores every day.</p>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.5, marginBottom: 14 }}>Company</div>
            {["About Us", "Careers", "Press", "Blog"].map(l => <div key={l} style={{ fontSize: 13, opacity: 0.7, marginBottom: 8, cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}>{l}</div>)}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.5, marginBottom: 14 }}>Support</div>
            {["Help Center", "Track Order", "Returns", "Contact Us"].map(l => <div key={l} style={{ fontSize: 13, opacity: 0.7, marginBottom: 8, cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}>{l}</div>)}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.5, marginBottom: 14 }}>Follow Us</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {[["F","Facebook"],["I","Instagram"],["X","Twitter"],["Y","YouTube"]].map(([ic, lb]) => (
                <button key={lb} title={lb} style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.07)", cursor: "pointer", fontSize: 14, fontWeight: 800, color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "none"; }}>
                  {ic}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, opacity: 0.5, display: "flex", alignItems: "center", gap: 6 }}><IconC name="bell" size={12} />App coming soon</div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "16px 20px" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, fontSize: 12, opacity: 0.5 }}>
            <span>© 2026 GoGoPantry. All rights reserved.</span>
            <div style={{ display: "flex", gap: 20 }}>
              {["Privacy Policy", "Terms of Service", "Cookie Settings"].map(l => <span key={l} style={{ cursor: "pointer" }}>{l}</span>)}
            </div>
          </div>
        </div>
      </footer>

      <ShopSelector
        isOpen={shopSelectorOpen && !storePopupShop}
        onClose={() => setShopSelectorOpen(false)}
        onSelectShop={(id) => {
          const s = G.SHOPS.find(x => x.id === id);
          setStorePopupShop(s || null);
          setShopSelectorOpen(false);
        }}
        currentShopId={shopId}
      />

      <StorePopup
        shop={storePopupShop}
        isOpen={!!storePopupShop}
        onClose={() => setStorePopupShop(null)}
        onSelectShop={(id) => { onSelectShop(id); setStorePopupShop(null); }}
      />
    </div>
  );
}
