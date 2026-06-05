/* GoGO Pantry — Customer App shell & navigation */

function CustomerShell({ page, setPage, cartCount, user, onLogout, onNavigate, shopId, onSelectShop }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [shopSelectorOpen, setShopSelectorOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      {/* Top bar */}
      <header style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 40, boxShadow: "0 1px 3px oklch(0 0 0 / 0.05)" }}>
        <LogoCustomer size={26} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setShopSelectorOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--line)",
              background: "var(--surface-2)",
              color: "var(--text-2)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              transition: "all 0.15s"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "var(--primary)";
              e.currentTarget.style.color = "var(--primary-ink)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "var(--surface-2)";
              e.currentTarget.style.color = "var(--text-2)";
            }}
            className="hideOnMobile"
            id="shopName"
          >
            <IconC name="pin" size={16} />
            <span>Select Store</span>
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button style={topBarIconBtn}><IconC name="search" size={20} /></button>
          <button style={topBarIconBtn}><IconC name="heart" size={20} /></button>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={topBarIconBtn}
              title={user?.email}
            >
              <IconC name="user" size={20} />
            </button>
            {userMenuOpen && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                boxShadow: "var(--shadow-lg)",
                zIndex: 50,
                minWidth: 200,
                animation: "gg-scale-in .14s var(--ease)"
              }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{user?.name || "Account"}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{user?.email}</div>
                </div>
                <button style={{
                  width: "100%",
                  padding: "10px 16px",
                  background: "transparent",
                  border: "none",
                  textAlign: "left",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--text-2)",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)"
                }}>
                  My orders
                </button>
                <button style={{
                  width: "100%",
                  padding: "10px 16px",
                  background: "transparent",
                  border: "none",
                  textAlign: "left",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--text-2)",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)"
                }}>
                  Account settings
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onLogout();
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--red-500)",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    borderTop: "1px solid var(--line)"
                  }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
          <button onClick={() => setPage("cart")} style={{ ...topBarIconBtn, position: "relative" }}>
            <IconC name="cart" size={20} />
            {cartCount > 0 && <span style={{ position: "absolute", top: -6, right: -4, background: "var(--primary)", color: "var(--primary-ink)", fontSize: 10, fontWeight: 800, width: 18, height: 18, borderRadius: 999, display: "grid", placeItems: "center" }}>{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0 }}>{onNavigate}</main>

      {/* Footer */}
      <footer style={{ background: "var(--surface)", borderTop: "1px solid var(--line)", padding: "20px 16px", color: "var(--text-3)", fontSize: 13, textAlign: "center" }}>
        <p style={{ margin: 0 }}>About · Help · Contact · Privacy · © 2026 GoGO Pantry</p>
      </footer>

      {/* Shop Selector Modal */}
      <ShopSelector
        isOpen={shopSelectorOpen}
        onClose={() => setShopSelectorOpen(false)}
        onSelectShop={onSelectShop}
        currentShopId={shopId}
      />
    </div>
  );
}

const topBarIconBtn = {
  width: 40, height: 40, borderRadius: 10, border: "none", background: "transparent", color: "var(--text-2)", cursor: "pointer", display: "grid", placeItems: "center", transition: "all .15s", fontFamily: "var(--font-sans)"
};

Object.assign(window, { CustomerShell, topBarIconBtn });
