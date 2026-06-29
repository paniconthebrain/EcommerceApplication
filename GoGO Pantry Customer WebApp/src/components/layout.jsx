import { useState, useRef, useEffect, useMemo } from 'react';
import { G } from '../globals.js';
import { IconC } from './icons.jsx';
import { LogoCustomer } from './ui.jsx';
import { ShopSelector, StorePopup } from './shop.jsx';
import { ProductDetailModal } from './browse.jsx';

/* ── Search Overlay ── */
function SearchOverlay({ onClose, onAddToCart, cartItems, onUpdateCart }) {
  const [q, setQ] = useState('');
  const [modalProduct, setModalProduct] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const lq = q.toLowerCase();
    return G.PRODUCTS
      .filter(p => p.name.toLowerCase().includes(lq) || (p.brand || '').toLowerCase().includes(lq))
      .slice(0, 8);
  }, [q]);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 400, backdropFilter: 'blur(6px)' }} />
      <div style={{ position: 'fixed', top: 70, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 620, padding: '0 16px', zIndex: 401, animation: 'slideInDown 0.18s var(--ease)' }}>
        {/* Input bar */}
        <div style={{ background: 'var(--surface)', borderRadius: 18, padding: '4px 6px 4px 18px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'var(--shadow-xl)', border: '1.5px solid var(--line)' }}>
          <IconC name="search" size={18} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search products…"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 17, fontFamily: 'var(--font-sans)', background: 'transparent', color: 'var(--text)', padding: '12px 0' }}
          />
          <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 10, border: 'none', background: 'var(--surface-2)', color: 'var(--text-3)', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-sans)', flexShrink: 0 }}>ESC</button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={{ background: 'var(--surface)', borderRadius: 16, marginTop: 8, boxShadow: 'var(--shadow-xl)', border: '1px solid var(--line)', overflow: 'hidden', animation: 'slideInDown 0.14s var(--ease)' }}>
            {results.map((p, i) => {
              const cat = G.catOf(p.cat);
              const inCart = cartItems[p.id] || 0;
              return (
                <div key={p.id}
                  onClick={() => setModalProduct(p)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', cursor: 'pointer', borderBottom: i < results.length - 1 ? '1px solid var(--line)' : 'none', transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 46, height: 46, borderRadius: 10, background: `hsl(${cat.hue || 152},45%,92%)`, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.image ? <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <IconC name="cart" size={22} style={{ color: `hsl(${cat.hue || 152},50%,62%)` }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{cat.name} · ${parseFloat(p.price).toFixed(2)} / {p.unit}</div>
                  </div>
                  {inCart > 0 && <span style={{ background: 'var(--primary-soft)', color: 'var(--green-700)', fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap' }}>{inCart} in cart</span>}
                  <IconC name="chevD" size={14} style={{ color: 'var(--text-3)', transform: 'rotate(-90deg)', flexShrink: 0 }} />
                </div>
              );
            })}
          </div>
        )}

        {q.trim() && results.length === 0 && (
          <div style={{ background: 'var(--surface)', borderRadius: 16, marginTop: 8, padding: '24px 20px', textAlign: 'center', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--line)', color: 'var(--text-3)', fontSize: 14, fontWeight: 600 }}>
            No products found for "{q}"
          </div>
        )}
      </div>

      {modalProduct && (
        <div style={{ zIndex: 500, position: 'relative' }}>
          <ProductDetailModal
            product={modalProduct}
            inCart={cartItems[modalProduct.id] || 0}
            onClose={() => setModalProduct(null)}
            onAdd={() => { onAddToCart(modalProduct.id); }}
            onUpdateCart={onUpdateCart}
          />
        </div>
      )}
    </>
  );
}

/* ── Wishlist Panel ── */
function WishlistPanel({ savedItems, onClose, onAddToCart, cartItems, onUpdateCart, onToggleSave }) {
  const [modalProduct, setModalProduct] = useState(null);
  const savedProducts = useMemo(() => G.PRODUCTS.filter(p => savedItems.has(p.id)), [savedItems]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300, backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 400, background: 'var(--surface)', zIndex: 301, boxShadow: '-8px 0 40px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.22s var(--ease)' }}>
        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: '0 0 2px', letterSpacing: '-0.02em' }}>Saved Items</h2>
            <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>{savedProducts.length} item{savedProducts.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 999, border: 'none', background: 'var(--surface-2)', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'var(--text-2)' }}>
            <IconC name="x" size={18} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {savedProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--text-3)' }}>
              <IconC name="heart" size={44} style={{ opacity: 0.18, marginBottom: 14 }} />
              <p style={{ fontSize: 15, fontWeight: 700, margin: '0 0 6px', color: 'var(--text-2)' }}>No saved items yet</p>
              <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5 }}>Tap the heart icon on any product to save it here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {savedProducts.map(p => {
                const cat = G.catOf(p.cat);
                const inCart = cartItems[p.id] || 0;
                return (
                  <div key={p.id} style={{ background: 'var(--bg)', borderRadius: 14, padding: 14, border: '1px solid var(--line)', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div onClick={() => setModalProduct(p)} style={{ width: 58, height: 58, borderRadius: 10, background: `hsl(${cat.hue || 152},45%,92%)`, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      {p.image ? <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <IconC name="cart" size={24} style={{ color: `hsl(${cat.hue || 152},50%,62%)` }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={() => setModalProduct(p)}>{p.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 800, marginTop: 2 }}>${parseFloat(p.price).toFixed(2)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                      <button onClick={() => onToggleSave(p.id)}
                        title="Remove from saved"
                        style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'var(--red-100)', color: 'var(--red-500)', cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--red-100)'}>
                        <IconC name="heart" size={15} />
                      </button>
                      {inCart > 0 ? (
                        <span style={{ background: 'var(--primary-soft)', color: 'var(--green-700)', fontSize: 12, fontWeight: 700, padding: '6px 10px', borderRadius: 8 }}>{inCart} in cart</span>
                      ) : (
                        <button onClick={() => onAddToCart(p.id)}
                          style={{ padding: '7px 12px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}>
                          Add to cart
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {modalProduct && (
        <div style={{ position: 'relative', zIndex: 500 }}>
          <ProductDetailModal
            product={modalProduct}
            inCart={cartItems[modalProduct.id] || 0}
            onClose={() => setModalProduct(null)}
            onAdd={() => { onAddToCart(modalProduct.id); }}
            onUpdateCart={onUpdateCart}
          />
        </div>
      )}
    </>
  );
}

export function MobileBottomNav({ page, setPage, cartCount, onOpenShopSelector, onOpenSearch, onOpenWishlist, savedCount = 0 }) {
  const tabs = [
    { id: "home",   label: "Home",   icon: "home" },
    { id: "search", label: "Search", icon: "search" },
    { id: "cart",   label: "Cart",   icon: "cart" },
    { id: "saved",  label: "Saved",  icon: "heart" },
  ];

  const handleTab = (id) => {
    if (id === "search") { onOpenSearch?.(); return; }
    if (id === "saved") { onOpenWishlist?.(); return; }
    if (id === "cart") { setPage("cart"); return; }
    setPage("home");
  };

  const activeTab = page === "cart" ? "cart" : page === "home" ? "home" : "home";

  return (
    <nav
      aria-label="Main navigation"
      className="showOnMobile mobile-bottom-nav"
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "oklch(1 0 0 / 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid var(--line)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        boxShadow: "0 -4px 24px oklch(0 0 0 / 0.07)",
        display: "flex",
      }}
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        const isCart = tab.id === "cart";
        return (
          <button
            key={tab.id}
            aria-label={tab.label}
            aria-current={isActive ? "page" : undefined}
            onClick={() => handleTab(tab.id)}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 3, padding: "10px 0 8px",
              border: "none", background: "transparent",
              color: isActive ? "var(--primary)" : "var(--text-3)",
              cursor: "pointer", fontFamily: "var(--font-sans)",
              transition: "color 0.15s", position: "relative",
            }}
          >
            <div style={{ position: "relative" }}>
              <IconC name={tab.icon} size={22} stroke={isActive ? 2.5 : 1.8} />
              {isCart && cartCount > 0 && (
                <span style={{
                  position: "absolute", top: -6, right: -8,
                  background: "var(--primary)", color: "var(--primary-ink)",
                  fontSize: 9, fontWeight: 800, width: 17, height: 17,
                  borderRadius: 999, display: "grid", placeItems: "center",
                  boxShadow: "0 2px 6px oklch(0.55 0.17 152 / 0.4)",
                }}>{cartCount > 9 ? "9+" : cartCount}</span>
              )}
              {tab.id === "saved" && savedCount > 0 && (
                <span style={{
                  position: "absolute", top: -6, right: -8,
                  background: "var(--red-500)", color: "#fff",
                  fontSize: 9, fontWeight: 800, width: 17, height: 17,
                  borderRadius: 999, display: "grid", placeItems: "center",
                }}>{savedCount > 9 ? "9+" : savedCount}</span>
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, letterSpacing: "0.01em" }}>{tab.label}</span>
            {isActive && (
              <span style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: 32, height: 3, borderRadius: "0 0 4px 4px",
                background: "var(--primary)",
                boxShadow: "0 2px 8px oklch(0.55 0.17 152 / 0.4)",
              }} />
            )}
          </button>
        );
      })}
    </nav>
  );
}

export function CustomerShell({ page, setPage, cartCount, user, onLogout, onLoginClick, onNavigate, shopId, onSelectShop, savedItems = new Set(), onToggleSave, onAddToCart, onUpdateCart, cartItems = {} }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [shopSelectorOpen, setShopSelectorOpen] = useState(false);
  const [storePopupShop, setStorePopupShop] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
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

  const userInitials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : null;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>

      {/* ── Header ── */}
      <header className="app-header" style={{ padding: "0 20px", height: 62, display: "flex", alignItems: "center", gap: 14 }}>
        <LogoCustomer size={24} onClick={() => setPage("home")} />

        {/* Store selector */}
        <button
          onClick={() => { if (G.SHOPS.length === 1) { setStorePopupShop(G.SHOPS[0]); } else { setShopSelectorOpen(true); } }}
          className="hideOnMobile"
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "7px 12px",
            borderRadius: 999, border: "1.5px solid var(--line)",
            background: currentShopName ? "var(--primary-soft)" : "var(--surface-2)",
            color: currentShopName ? "var(--green-700)" : "var(--text-3)",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: "var(--font-sans)", transition: "all 0.16s var(--ease)",
            maxWidth: 200, overflow: "hidden",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "var(--primary)";
            e.currentTarget.style.color = "var(--primary-ink)";
            e.currentTarget.style.borderColor = "var(--primary)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = currentShopName ? "var(--primary-soft)" : "var(--surface-2)";
            e.currentTarget.style.color = currentShopName ? "var(--green-700)" : "var(--text-3)";
            e.currentTarget.style.borderColor = "var(--line)";
          }}
        >
          <IconC name="pin" size={14} stroke={2.5} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {currentShopName || "Select store"}
          </span>
          <IconC name="chevD" size={12} stroke={2.5} />
        </button>

        {/* Mobile store pill — shows only on mobile */}
        <button
          onClick={() => { if (G.SHOPS.length === 1) { setStorePopupShop(G.SHOPS[0]); } else { setShopSelectorOpen(true); } }}
          className="showOnMobile"
          style={{
            display: "flex", alignItems: "center", gap: 5, padding: "6px 10px",
            borderRadius: 999, border: "1.5px solid var(--line)",
            background: currentShopName ? "var(--primary-soft)" : "var(--surface-2)",
            color: currentShopName ? "var(--green-700)" : "var(--text-3)",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
            fontFamily: "var(--font-sans)", transition: "all 0.16s var(--ease)",
            maxWidth: 120, overflow: "hidden",
          }}
        >
          <IconC name="pin" size={12} stroke={2.5} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {currentShopName || "Store"}
          </span>
        </button>

        <div style={{ flex: 1 }} />

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>

          {/* Search */}
          <button
            aria-label="Search"
            title="Search products"
            className="hideOnMobile"
            onClick={() => setShowSearch(true)}
            style={{ width: 38, height: 38, borderRadius: 10, border: "none", background: "transparent", color: "var(--text-3)", cursor: "pointer", display: "grid", placeItems: "center", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-3)"; }}
          >
            <IconC name="search" size={19} />
          </button>

          {/* Saved / Wishlist */}
          <button
            aria-label="Saved items"
            title="Saved items"
            className="hideOnMobile"
            onClick={() => setShowWishlist(true)}
            style={{ width: 38, height: 38, borderRadius: 10, border: "none", background: savedItems.size > 0 ? "var(--red-100)" : "transparent", color: savedItems.size > 0 ? "var(--red-500)" : "var(--text-3)", cursor: "pointer", display: "grid", placeItems: "center", transition: "all 0.15s", position: "relative" }}
            onMouseEnter={e => { e.currentTarget.style.background = savedItems.size > 0 ? "#fecaca" : "var(--surface-2)"; e.currentTarget.style.color = savedItems.size > 0 ? "var(--red-500)" : "var(--text)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = savedItems.size > 0 ? "var(--red-100)" : "transparent"; e.currentTarget.style.color = savedItems.size > 0 ? "var(--red-500)" : "var(--text-3)"; }}
          >
            <IconC name="heart" size={19} />
            {savedItems.size > 0 && (
              <span style={{ position: "absolute", top: 4, right: 4, width: 14, height: 14, borderRadius: 999, background: "var(--red-500)", color: "#fff", fontSize: 8, fontWeight: 800, display: "grid", placeItems: "center" }}>
                {savedItems.size > 9 ? "9+" : savedItems.size}
              </span>
            )}
          </button>

          {/* User avatar */}
          <div ref={userMenuRef} style={{ position: "relative" }}>
            <button
              aria-label={user ? "Account menu" : "Sign in"}
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
              onClick={() => user ? setUserMenuOpen(!userMenuOpen) : onLoginClick?.()}
              style={{
                width: 38, height: 38, borderRadius: 10, border: "none", cursor: "pointer",
                display: "grid", placeItems: "center", transition: "all 0.15s",
                background: user ? "var(--primary-soft)" : "transparent",
                color: user ? "var(--green-700)" : "var(--text-3)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={e => {
                e.currentTarget.style.background = user ? "var(--primary-soft)" : "transparent";
                e.currentTarget.style.color = user ? "var(--green-700)" : "var(--text-3)";
              }}
            >
              {user && userInitials
                ? <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "-0.02em" }}>{userInitials}</span>
                : <IconC name="user" size={19} />
              }
            </button>

            {userMenuOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 10px)", right: 0,
                background: "var(--surface)", border: "1px solid var(--line)",
                borderRadius: 16, boxShadow: "var(--shadow-lg)", zIndex: 50, minWidth: 210,
                animation: "scaleIn 0.15s var(--ease)",
                transformOrigin: "top right",
              }}>
                <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid var(--line)" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>{user?.name || "Account"}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{user?.email}</div>
                </div>
                {["My orders", "Account settings"].map(label => (
                  <button
                    key={label}
                    style={{ width: "100%", padding: "10px 16px", background: "transparent", border: "none", textAlign: "left", fontSize: 13, fontWeight: 500, color: "var(--text-2)", cursor: "pointer", fontFamily: "var(--font-sans)", transition: "background 0.12s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {label}
                  </button>
                ))}
                <button
                  onClick={() => { setUserMenuOpen(false); onLogout(); }}
                  style={{ width: "100%", padding: "10px 16px", background: "transparent", border: "none", textAlign: "left", fontSize: 13, fontWeight: 600, color: "var(--red-500)", cursor: "pointer", fontFamily: "var(--font-sans)", borderTop: "1px solid var(--line)", transition: "background 0.12s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--red-100)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>

          {/* Cart button / pill */}
          <button
            aria-label={cartCount > 0 ? `Cart, ${cartCount} item${cartCount !== 1 ? "s" : ""}` : "Cart"}
            onClick={() => setPage("cart")}
            style={{
              display: "flex", alignItems: "center", gap: cartCount > 0 ? 7 : 0,
              height: 38,
              padding: cartCount > 0 ? "0 14px 0 10px" : "0 10px",
              borderRadius: 999,
              border: "none",
              background: cartCount > 0 ? "var(--primary)" : "transparent",
              color: cartCount > 0 ? "var(--primary-ink)" : "var(--text-3)",
              cursor: "pointer",
              transition: "all 0.2s var(--spring)",
              boxShadow: cartCount > 0 ? "var(--shadow-primary)" : "none",
              position: "relative",
            }}
            onMouseEnter={e => {
              if (cartCount === 0) { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--text)"; }
              else { e.currentTarget.style.filter = "brightness(1.06)"; e.currentTarget.style.transform = "translateY(-1px)"; }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = cartCount > 0 ? "var(--primary)" : "transparent";
              e.currentTarget.style.color = cartCount > 0 ? "var(--primary-ink)" : "var(--text-3)";
              e.currentTarget.style.filter = "none";
              e.currentTarget.style.transform = "none";
            }}
          >
            <IconC name="cart" size={19} stroke={cartCount > 0 ? 2.5 : 1.8} />
            {cartCount > 0 && (
              <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.02em" }}>{cartCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ flex: 1, minWidth: 0 }} className="app-main">{onNavigate}</main>

      <MobileBottomNav
        page={page}
        setPage={setPage}
        cartCount={cartCount}
        onOpenShopSelector={() => setShopSelectorOpen(true)}
        onOpenSearch={() => setShowSearch(true)}
        onOpenWishlist={() => setShowWishlist(true)}
        savedCount={savedItems.size}
      />

      {/* ── Footer ── */}
      <footer style={{ background: "oklch(0.13 0.022 152)", color: "#fff", marginTop: "auto" }}>

        {/* Newsletter band */}
        <div style={{ background: "linear-gradient(135deg, oklch(0.22 0.08 152) 0%, oklch(0.18 0.05 170) 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="footer-newsletter" style={{ maxWidth: 1200, margin: "0 auto", padding: "52px 32px" }}>
            {/* Left */}
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "oklch(0.55 0.17 152 / 0.25)", border: "1px solid oklch(0.55 0.17 152 / 0.4)", borderRadius: 999, padding: "5px 14px", marginBottom: 18 }}>
                <IconC name="leaf" size={12} style={{ color: "oklch(0.78 0.14 152)" }} />
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: "oklch(0.78 0.14 152)" }}>Newsletter</span>
              </div>
              <h3 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, margin: "0 0 12px", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                Stay fresh,<br /><span style={{ color: "oklch(0.72 0.15 152)" }}>save more</span>
              </h3>
              <p style={{ fontSize: 14, margin: "0 0 22px", opacity: 0.6, lineHeight: 1.7, maxWidth: 320 }}>
                Join 12,000+ local shoppers getting exclusive weekly deals, seasonal picks, and early access to new arrivals.
              </p>
              <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                {[["check", "Weekly deals"], ["star", "New arrivals"], ["bell", "Zero spam"]].map(([ic, lb]) => (
                  <div key={lb} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "oklch(0.75 0.05 152)" }}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, background: "oklch(0.55 0.17 152 / 0.3)", display: "grid", placeItems: "center" }}>
                      <IconC name={ic} size={10} style={{ color: "oklch(0.72 0.14 152)" }} />
                    </div>
                    {lb}
                  </div>
                ))}
              </div>
            </div>
            {/* Right — form card */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20, padding: "32px 28px", backdropFilter: "blur(12px)" }}>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4, letterSpacing: "-0.01em" }}>Get your first deal today</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>No commitment — unsubscribe anytime.</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  style={{ flex: 1, padding: "13px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, fontFamily: "var(--font-sans)", outline: "none", minWidth: 0, transition: "border-color 0.15s" }}
                  onFocus={e => e.target.style.borderColor = "oklch(0.55 0.17 152 / 0.7)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                />
                <button style={{ padding: "13px 20px", borderRadius: 12, border: "none", background: "var(--primary)", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "var(--font-sans)", whiteSpace: "nowrap", boxShadow: "0 4px 20px oklch(0.55 0.17 152 / 0.45)", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--primary-hover)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.transform = "none"; }}>
                  Subscribe →
                </button>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 14 }}>By subscribing you agree to our Privacy Policy.</div>
            </div>
          </div>
        </div>

        {/* Main links grid */}
        <div className="footer-links-wrap" style={{ maxWidth: 1200, margin: "0 auto", padding: "52px 32px 40px" }}>
          <div className="footer-links">

            {/* Brand col */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--primary)", display: "grid", placeItems: "center", boxShadow: "0 2px 12px oklch(0.55 0.17 152 / 0.5)" }}>
                  <img src="/Logo.webp" alt="" style={{ height: 22, objectFit: "contain" }} />
                </div>
                <span style={{ fontSize: 17, fontWeight: 900, letterSpacing: "-0.03em" }}>GoGo<span style={{ color: "oklch(0.72 0.15 152)" }}>Pantry</span></span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.45)", margin: "0 0 22px", maxWidth: 210 }}>
                Fresh groceries from local stores. Order online, pick up same day.
              </p>
              {/* Social row */}
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { label: "Facebook",  letter: "f", color: "#1877f2" },
                  { label: "Instagram", letter: "ig", color: "#e1306c" },
                  { label: "Twitter",   letter: "𝕏",  color: "#fff" },
                  { label: "YouTube",   letter: "▶",  color: "#ff0000" },
                ].map(({ label, letter, color }) => (
                  <button key={label} title={label}
                    style={{ width: 36, height: 36, borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", cursor: "pointer", fontSize: 12, fontWeight: 900, color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = color + "22"; e.currentTarget.style.borderColor = color + "66"; e.currentTarget.style.color = color; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "none"; }}
                  >{letter}</button>
                ))}
              </div>
            </div>

            {/* Shop col */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 18 }}>Shop</div>
              {["All Products", "Fresh Produce", "Dairy & Eggs", "Bakery", "Snacks", "Beverages"].map(l => (
                <div key={l} style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", marginBottom: 11, cursor: "pointer", transition: "color 0.15s", fontWeight: 500 }}
                  onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}>{l}</div>
              ))}
            </div>

            {/* Company col */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 18 }}>Company</div>
              {["About Us", "Careers", "Press", "Blog", "Partners"].map(l => (
                <div key={l} style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", marginBottom: 11, cursor: "pointer", transition: "color 0.15s", fontWeight: 500 }}
                  onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}>{l}</div>
              ))}
            </div>

            {/* Support col */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 18 }}>Support</div>
              {["Help Center", "Track Order", "Returns", "Contact Us", "Accessibility"].map(l => (
                <div key={l} style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", marginBottom: 11, cursor: "pointer", transition: "color 0.15s", fontWeight: 500 }}
                  onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}>{l}</div>
              ))}
            </div>

            {/* App col */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 18 }}>Get the App</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 16, lineHeight: 1.55 }}>Shop even faster with our mobile app. Coming soon.</p>
              {[
                { store: "App Store", sub: "Download on the", icon: "" },
                { store: "Google Play", sub: "Get it on", icon: "▶" },
              ].map(({ store, sub, icon }) => (
                <div key={store} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 14px", marginBottom: 10, cursor: "default", opacity: 0.6 }}>
                  <span style={{ fontSize: 18 }}>{store === "App Store" ? "🍎" : "▶"}</span>
                  <div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", lineHeight: 1 }}>{sub}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.4 }}>{store}</div>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 10, background: "rgba(255,255,255,0.1)", padding: "2px 7px", borderRadius: 999, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Soon</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom-bar" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "18px 32px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", fontWeight: 500 }}>© 2026 GoGoPantry Pty Ltd. All rights reserved.</span>
              <span style={{ width: 1, height: 12, background: "rgba(255,255,255,0.15)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                <IconC name="checkCircle" size={12} style={{ color: "oklch(0.62 0.14 152)" }} />
                <span>Verified local stores</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {["Privacy Policy", "Terms of Service", "Cookie Settings"].map(l => (
                <span key={l} style={{ fontSize: 12, color: "rgba(255,255,255,0.32)", cursor: "pointer", fontWeight: 500, transition: "color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.32)"}>{l}</span>
              ))}
            </div>
          </div>
        </div>

      </footer>

      {showSearch && (
        <SearchOverlay
          onClose={() => setShowSearch(false)}
          onAddToCart={onAddToCart}
          cartItems={cartItems}
          onUpdateCart={onUpdateCart}
        />
      )}

      {showWishlist && (
        <WishlistPanel
          savedItems={savedItems}
          onClose={() => setShowWishlist(false)}
          onAddToCart={onAddToCart}
          cartItems={cartItems}
          onUpdateCart={onUpdateCart}
          onToggleSave={onToggleSave}
        />
      )}

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
