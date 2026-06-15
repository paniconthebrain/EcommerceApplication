import { useState, useEffect, useRef } from 'react';
import { G, APP_CONFIG } from '../globals.js';
import { IconC } from './icons.jsx';

const POPUP_ANALYTICS = {
  track(event, data = {}) {
    console.log("[StorePopup]", event, data);
  }
};

export function StorePopup({ shop, isOpen, onClose, onSelectShop, product = null, promoText = "Free delivery on orders over $25" }) {
  const primaryCTARef = useRef(null);
  const popupRef = useRef(null);
  const dismissTimer = useRef(null);
  const isMobile = window.matchMedia("(max-width: 640px)").matches;
  const isOpen_ = isOpen && !!shop;

  useEffect(() => {
    if (isOpen_) POPUP_ANALYTICS.track("store_popup_impression", { shopId: shop?.id, isMobile });
  }, [isOpen_]);

  useEffect(() => {
    if (isOpen_ && primaryCTARef.current) setTimeout(() => primaryCTARef.current?.focus(), 50);
  }, [isOpen_]);

  useEffect(() => {
    if (isOpen_ && isMobile) {
      dismissTimer.current = setTimeout(() => {
        if (!popupRef.current?.contains(document.activeElement)) {
          POPUP_ANALYTICS.track("store_popup_auto_dismiss", { shopId: shop?.id });
          onClose();
        }
      }, 6000);
    }
    return () => clearTimeout(dismissTimer.current);
  }, [isOpen_]);

  useEffect(() => {
    if (!isOpen_) return;
    const el = popupRef.current;
    const focusable = () => el?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') || [];
    const onKey = (e) => {
      if (e.key === "Escape") { POPUP_ANALYTICS.track("store_popup_dismiss_esc", { shopId: shop?.id }); onClose(); return; }
      if (e.key !== "Tab") return;
      const items = [...focusable()];
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen_]);

  if (!isOpen_) return null;

  const hue = typeof shop.tint === "number" ? shop.tint : 152;
  const storeStatus = "Open";
  const etaRange = "25–40 min";
  const deliveryFee = "$3.99 delivery";
  const isOpenStatus = storeStatus === "Open";

  const handlePrimary = () => { POPUP_ANALYTICS.track("store_popup_cta_primary", { shopId: shop.id }); onSelectShop(shop.id); onClose(); };
  const handleSecondary = () => { POPUP_ANALYTICS.track("store_popup_cta_secondary", { shopId: shop.id }); onSelectShop(shop.id); onClose(); };
  const handleClose = () => { POPUP_ANALYTICS.track("store_popup_dismiss_x", { shopId: shop.id }); onClose(); };

  const popupId = "store-popup-heading";

  const inner = (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, oklch(0.55 0.15 ${hue}), oklch(0.68 0.12 ${hue + 20}))`, color: "#fff", display: "grid", placeItems: "center", flexShrink: 0, boxShadow: `0 4px 12px oklch(0.55 0.13 ${hue} / 0.4)` }}>
          <IconC name="pin" size={24} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 id={popupId} style={{ fontSize: 17, fontWeight: 800, color: "var(--text)", margin: "0 0 4px", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
            {shop.name}<span style={{ margin: "0 6px", color: "var(--text-3)" }}>—</span>
            <span style={{ color: isOpenStatus ? "#059669" : "#dc2626" }}>{storeStatus}</span>
          </h2>
          <p aria-live="polite" style={{ fontSize: 13, color: "var(--text-2)", margin: 0 }}>
            {APP_CONFIG.deliveryEnabled
              ? <>Est. delivery <strong style={{ color: "var(--text)" }}>{etaRange}</strong> · {deliveryFee}</>
              : <>Ready for pickup in <strong style={{ color: "var(--text)" }}>30–45 minutes</strong> · {shop.city || "Local store"}</>
            }
          </p>
        </div>
        <button onClick={handleClose} aria-label="Close store popup" style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "var(--surface-2)", color: "var(--text-2)", cursor: "pointer", fontSize: 18, display: "grid", placeItems: "center", flexShrink: 0, outline: "none" }}
          onFocus={e => e.currentTarget.style.boxShadow = "0 0 0 3px var(--primary)"}
          onBlur={e => e.currentTarget.style.boxShadow = "none"}>×</button>
      </div>

      {product && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--surface-2)", borderRadius: 10, marginBottom: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 10, background: `hsl(${hue},55%,92%)`, overflow: "hidden", flexShrink: 0, display: "grid", placeItems: "center" }}>
            {product.image ? <img src={product.image} alt={product.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "2rem" }}>🛒</span>}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{product.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>{product.unit} · ${(parseFloat(product.price) || 0).toFixed(2)}</div>
            <div style={{ fontSize: 11, color: "#059669", fontWeight: 700, marginTop: 3 }}>Available at {shop.name}</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: isOpenStatus ? "#d1fae5" : "#fee2e2", color: isOpenStatus ? "#065f46" : "#991b1b", padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 800 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />{storeStatus}
        </span>
        {APP_CONFIG.deliveryEnabled
          ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--surface-2)", color: "var(--text-2)", padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>⚡ {etaRange}</span>
          : <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--surface-2)", color: "var(--text-2)", padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>🛒 30–45 min pickup</span>
        }
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--surface-2)", color: "var(--text-2)", padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>📍 {shop.city || shop.code}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "oklch(0.96 0.04 152)", borderRadius: 10, marginBottom: 16, border: "1px solid oklch(0.88 0.08 152)" }}>
        <span style={{ fontSize: 15 }}>🎉</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "oklch(0.35 0.1 152)" }}>
          {APP_CONFIG.deliveryEnabled ? promoText : "Quick pickup · No waiting in line"}
        </span>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button ref={primaryCTARef} onClick={handlePrimary}
          style={{ flex: 1, padding: "14px 0", borderRadius: 10, border: "none", background: "var(--primary)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "filter 0.15s, transform 0.1s", outline: "none" }}
          onMouseEnter={e => { e.currentTarget.style.filter = "brightness(0.92)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "none"; }}
          onFocus={e => e.currentTarget.style.boxShadow = "0 0 0 3px oklch(0.65 0.15 152)"}
          onBlur={e => e.currentTarget.style.boxShadow = "none"}
          aria-describedby={popupId}>
          🛍️ Shop Now
        </button>
        <button onClick={handleSecondary}
          style={{ padding: "14px 18px", borderRadius: 10, border: "2px solid var(--line)", background: "transparent", color: "var(--text)", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "border-color 0.15s", outline: "none", whiteSpace: "nowrap" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "var(--line)"}
          onFocus={e => e.currentTarget.style.boxShadow = "0 0 0 3px oklch(0.65 0.15 152)"}
          onBlur={e => e.currentTarget.style.boxShadow = "none"}>
          View Store
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div role="dialog" aria-modal="true" aria-labelledby={popupId}
        style={{ position: "fixed", bottom: 16, left: 16, right: 16, zIndex: 300, animation: "slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div ref={popupRef} style={{ background: "var(--surface)", borderRadius: 16, padding: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.08)", border: "1px solid var(--line)" }}>
          {inner}
          <div style={{ marginTop: 12, height: 3, background: "var(--line)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "var(--primary)", borderRadius: 999, animation: "shrink 6s linear forwards" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 300, display: "grid", placeItems: "center", padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
      <div ref={popupRef} role="dialog" aria-modal="true" aria-labelledby={popupId}
        style={{ background: "var(--surface)", borderRadius: 20, padding: 24, width: "100%", maxWidth: 480, boxShadow: "0 24px 80px rgba(0,0,0,0.28)", border: "1px solid var(--line)", animation: "fadeScaleIn 0.2s ease" }}>
        {inner}
      </div>
    </div>
  );
}

export function ShopInfoCard({ shop, onChangeShop }) {
  const hue = typeof shop.tint === "number" ? shop.tint : 152;
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 16, position: "sticky", top: 100, zIndex: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 11, background: `linear-gradient(135deg, oklch(0.55 0.15 ${hue}), oklch(0.68 0.12 ${hue + 20}))`, color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <IconC name="pin" size={22} />
        </div>
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", margin: "0 0 2px" }}>{shop.name}</h4>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, background: "#d1fae5", color: "#065f46", padding: "2px 7px", borderRadius: 999 }}>● Open</span>
            <span style={{ fontSize: 10, color: "var(--text-3)", padding: "2px 0" }}>
              {APP_CONFIG.deliveryEnabled ? "⚡ 25–40 min" : "🛒 30–45 min pickup"}
            </span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 14, borderBottom: "1px solid var(--line)", fontSize: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-2)" }}>
          <span>Hours</span><span style={{ fontWeight: 600, color: "var(--text)" }}>{shop.hours}</span>
        </div>
        {APP_CONFIG.deliveryEnabled ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-2)" }}>
              <span>Delivery</span><span style={{ fontWeight: 600, color: "var(--text)" }}>$3.99</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-2)" }}>
              <span>Est. delivery</span><span style={{ fontWeight: 600, color: "var(--text)" }}>25–40 min</span>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-2)" }}>
            <span>Pickup time</span><span style={{ fontWeight: 600, color: "var(--text)" }}>30–45 min</span>
          </div>
        )}
      </div>
      <button onClick={onChangeShop} style={{ marginTop: 14, width: "100%", padding: "10px", borderRadius: 9, border: "1px solid var(--line)", background: "transparent", color: "var(--text)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "border-color 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--line)"}
        onFocus={e => e.currentTarget.style.boxShadow = "0 0 0 3px oklch(0.65 0.15 152)"}
        onBlur={e => e.currentTarget.style.boxShadow = "none"}>
        Change Store
      </button>
    </div>
  );
}

export function ShopSelector({ isOpen, onClose, onSelectShop, currentShopId }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("distance");

  const filteredShops = search
    ? G.SHOPS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || (s.city || "").toLowerCase().includes(search.toLowerCase()))
    : G.SHOPS;

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--surface)", borderRadius: 20, width: "100%", maxWidth: 600, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", margin: 0 }}>Select a Store</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 28, color: "var(--text-2)", cursor: "pointer", width: 40, height: 40, display: "grid", placeItems: "center" }}>×</button>
        </div>
        <div style={{ padding: "16px 20px", background: "var(--surface-2)", display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }}><IconC name="search" size={16} /></span>
            <input aria-label="Search stores" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stores..." style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "var(--font-sans)" }} />
          </div>
          <div style={{ position: "relative" }}>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "10px 32px 10px 12px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)", fontSize: 12, fontFamily: "var(--font-sans)", appearance: "none", cursor: "pointer", outline: "none" }}>
              <option value="distance">Nearest</option>
              <option value="name">Name (A-Z)</option>
            </select>
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-3)" }}><IconC name="chevD" size={14} /></span>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
          {filteredShops.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-3)" }}>
              <IconC name="search" size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>No stores found</p>
            </div>
          ) : (
            filteredShops.map(shop => (
              <button key={shop.id} onClick={() => { onSelectShop(shop.id); onClose(); }}
                style={{ width: "100%", padding: "14px 20px", border: "none", background: shop.id === currentShopId ? "var(--surface-2)" : "transparent", borderLeft: shop.id === currentShopId ? "4px solid var(--primary)" : "4px solid transparent", cursor: "pointer", textAlign: "left", transition: "all 0.2s var(--ease)", display: "flex", alignItems: "center", gap: 14 }}
                onMouseEnter={e => { if (shop.id !== currentShopId) e.currentTarget.style.background = "var(--surface-2)"; }}
                onMouseLeave={e => { if (shop.id !== currentShopId) e.currentTarget.style.background = "transparent"; }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `oklch(0.6 0.13 ${shop.tint || "152"})`, color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}><IconC name="pin" size={22} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{shop.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 4 }}>{shop.city} · Open {shop.hours}</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", display: "flex", gap: 8 }}><span>📍 2.5 miles</span><span>⏱️ 25 min</span></div>
                </div>
                {shop.id === currentShopId && (
                  <div style={{ width: 24, height: 24, borderRadius: 999, background: "var(--primary)", color: "var(--primary-ink)", display: "grid", placeItems: "center", flexShrink: 0, fontWeight: 800, fontSize: 14 }}>✓</div>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function ShopCard({ shop, onSelect }) {
  const hue = typeof shop.tint === "number" ? shop.tint : 152;
  const imageUrl = shop.image ? `http://localhost:3000${shop.image}` : null;
  const itemCount = G.PRODUCTS.filter(p => G.shopStock(p.id, shop.id) > 0).length;
  const pickupMins = [20, 25, 30, 35, 45];
  const pickupBase = pickupMins[shop.id?.charCodeAt(0) % pickupMins.length] || 30;
  const pickupLabel = `${pickupBase}–${pickupBase + 15} min`;

  return (
    <div role="button" tabIndex={0} aria-label={`Shop at ${shop.name}, ${shop.city}`}
      onClick={onSelect} onKeyDown={e => (e.key === "Enter" || e.key === " ") && onSelect()}
      style={{ borderRadius: 18, border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer", transition: "all 0.2s var(--ease)", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.12)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "none"; }}>
      {imageUrl ? (
        <img src={imageUrl} alt={shop.name} style={{ width: "100%", height: 160, objectFit: "cover", display: "block", flexShrink: 0 }} />
      ) : (
        <div style={{ height: 160, background: `linear-gradient(135deg, oklch(0.55 0.13 ${hue}) 0%, oklch(0.65 0.1 ${hue + 20}) 100%)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -16, top: -16, fontSize: "7rem", opacity: 0.18 }}>🏪</div>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(255,255,255,0.25)", display: "grid", placeItems: "center" }}>
            <IconC name="pin" size={32} style={{ color: "#fff" }} />
          </div>
        </div>
      )}
      <div style={{ padding: "20px 20px 20px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text)", marginBottom: 3, letterSpacing: "-0.01em" }}>{shop.name}</div>
          <div style={{ fontSize: 13, color: "var(--text-2)" }}>{shop.city}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#d1fae5", color: "#065f46", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} /> Open
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--surface-2)", color: "var(--text-2)", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
            <IconC name="clock" size={12} /> {shop.hours || "9am–9pm"}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--blue-100)", color: "var(--blue-500)", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
            <IconC name="truck" size={12} /> Pickup {pickupLabel}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--surface-2)", color: "var(--text-2)", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
            <IconC name="box" size={12} /> {itemCount > 0 ? `${itemCount} items` : "Check in store"}
          </span>
        </div>
        <button onClick={onSelect} style={{ marginTop: "auto", width: "100%", padding: "12px", borderRadius: 11, border: "none", background: `oklch(0.45 0.15 ${hue})`, color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
          Shop Now →
        </button>
      </div>
    </div>
  );
}

export function CollectionBanner({ icon, title, subtitle, accentColor, emoji, onClick }) {
  return (
    <div onClick={onClick} style={{ borderRadius: 18, background: `linear-gradient(135deg, oklch(0.38 0.14 ${accentColor}) 0%, oklch(0.52 0.12 ${accentColor + 15}) 100%)`, color: "#fff", cursor: "pointer", transition: "all 0.2s var(--ease)", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 180, position: "relative", overflow: "hidden", boxShadow: `0 4px 20px oklch(0.45 0.12 ${accentColor} / 0.3)` }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 16px 40px oklch(0.45 0.12 ${accentColor} / 0.45)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 4px 20px oklch(0.45 0.12 ${accentColor} / 0.3)`; }}>
      <div style={{ position: "absolute", right: -10, top: -10, fontSize: "7rem", opacity: 0.22, userSelect: "none", lineHeight: 1 }}>{emoji || "🌿"}</div>
      <div style={{ position: "relative", zIndex: 1, padding: 24 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", marginBottom: 14 }}>
          <IconC name={icon} size={24} />
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.02em" }}>{title}</h3>
        <p style={{ fontSize: 13, margin: 0, opacity: 0.88, lineHeight: 1.5 }}>{subtitle}</p>
      </div>
      <div style={{ position: "relative", zIndex: 1, padding: "0 24px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.2)", padding: "6px 14px", borderRadius: 999, backdropFilter: "blur(4px)" }}>View Collection →</span>
      </div>
    </div>
  );
}
