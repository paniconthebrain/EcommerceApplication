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
      {/* Coloured header band */}
      <div style={{ margin: "-24px -24px 20px", padding: "20px 24px 20px", background: `linear-gradient(135deg, oklch(0.38 0.13 ${hue}), oklch(0.52 0.11 ${hue + 18}))`, borderRadius: "20px 20px 0 0", display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center", flexShrink: 0, border: "1px solid rgba(255,255,255,0.25)" }}>
          <IconC name="pin" size={26} style={{ color: "#fff" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 id={popupId} style={{ fontSize: 18, fontWeight: 900, color: "#fff", margin: "0 0 3px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>{shop.name}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: isOpenStatus ? "#4ade80" : "#f87171", display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>{storeStatus}</span>
            {shop.city && <><span style={{ color: "rgba(255,255,255,0.4)" }}>·</span><span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{shop.city}</span></>}
          </div>
        </div>
        <button onClick={handleClose} aria-label="Close store popup"
          style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.18)", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0, outline: "none", backdropFilter: "blur(4px)" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
          onFocus={e => e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,255,255,0.5)"}
          onBlur={e => e.currentTarget.style.boxShadow = "none"}>
          <IconC name="x" size={16} />
        </button>
      </div>

      {/* Store detail rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 16, borderRadius: 12, border: "1px solid var(--line)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `oklch(0.94 0.05 ${hue})`, display: "grid", placeItems: "center", flexShrink: 0 }}>
            <IconC name="clock" size={16} style={{ color: `oklch(0.45 0.14 ${hue})` }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 1 }}>Hours</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{shop.hours || "9:00 AM – 9:00 PM"}</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, background: "#d1fae5", color: "#065f46", padding: "3px 10px", borderRadius: 999 }}>Open now</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `oklch(0.94 0.05 ${hue})`, display: "grid", placeItems: "center", flexShrink: 0 }}>
            <IconC name="truck" size={16} style={{ color: `oklch(0.45 0.14 ${hue})` }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 1 }}>
              {APP_CONFIG.deliveryEnabled ? "Delivery" : "Pickup"}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
              {APP_CONFIG.deliveryEnabled ? `${etaRange} · ${deliveryFee}` : "Ready in 30–45 minutes"}
            </div>
          </div>
        </div>

        {shop.address && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `oklch(0.94 0.05 ${hue})`, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <IconC name="pin" size={16} style={{ color: `oklch(0.45 0.14 ${hue})` }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 1 }}>Address</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{shop.address}</div>
            </div>
          </div>
        )}
      </div>

      {product && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--surface-2)", borderRadius: 10, marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 10, background: `hsl(${hue},55%,92%)`, overflow: "hidden", flexShrink: 0, display: "grid", placeItems: "center" }}>
            {product.image
              ? <img src={product.image} alt={product.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <IconC name="box" size={24} style={{ color: `hsl(${hue},45%,50%)` }} />}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{product.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>{product.unit} · ${(parseFloat(product.price) || 0).toFixed(2)}</div>
            <div style={{ fontSize: 11, color: "#059669", fontWeight: 700, marginTop: 3 }}>Available at this store</div>
          </div>
        </div>
      )}

      {/* Promo strip */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: `oklch(0.96 0.04 ${hue})`, borderRadius: 10, marginBottom: 18, border: `1px solid oklch(0.88 0.08 ${hue})` }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: `oklch(0.88 0.1 ${hue})`, display: "grid", placeItems: "center", flexShrink: 0 }}>
          <IconC name="checkCircle" size={16} style={{ color: `oklch(0.4 0.14 ${hue})` }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: `oklch(0.32 0.1 ${hue})` }}>
          {APP_CONFIG.deliveryEnabled ? promoText : "Quick pickup — no waiting in line"}
        </span>
      </div>

      {/* CTAs */}
      <div style={{ display: "flex", gap: 10 }}>
        <button ref={primaryCTARef} onClick={handlePrimary} aria-describedby={popupId}
          style={{ flex: 1, padding: "14px 0", borderRadius: 11, border: "none", background: `oklch(0.45 0.15 ${hue})`, color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "filter 0.15s, transform 0.1s", outline: "none" }}
          onMouseEnter={e => { e.currentTarget.style.filter = "brightness(0.92)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "none"; }}
          onFocus={e => e.currentTarget.style.boxShadow = `0 0 0 3px oklch(0.65 0.15 ${hue})`}
          onBlur={e => e.currentTarget.style.boxShadow = "none"}>
          <IconC name="cart" size={18} />
          Shop Now
        </button>
        <button onClick={handleSecondary}
          style={{ padding: "14px 20px", borderRadius: 11, border: "1px solid var(--line)", background: "var(--surface-2)", color: "var(--text)", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "border-color 0.15s, background 0.15s", outline: "none", whiteSpace: "nowrap" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = `oklch(0.55 0.13 ${hue})`; e.currentTarget.style.background = "var(--surface)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.background = "var(--surface-2)"; }}
          onFocus={e => e.currentTarget.style.boxShadow = `0 0 0 3px oklch(0.65 0.15 ${hue})`}
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
              {APP_CONFIG.deliveryEnabled ? "25–40 min" : "30–45 min pickup"}
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

  const filteredShops = (search
    ? G.SHOPS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || (s.city || "").toLowerCase().includes(search.toLowerCase()))
    : [...G.SHOPS]
  ).sort((a, b) => sortBy === "name" ? a.name.localeCompare(b.name) : 0);

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16, backdropFilter: "blur(2px)" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: "var(--surface)", borderRadius: 20, width: "100%", maxWidth: 520, maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.28)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "22px 24px 18px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: "oklch(0.94 0.06 152)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <IconC name="pin" size={20} style={{ color: "oklch(0.45 0.14 152)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--text)", margin: "0 0 2px", letterSpacing: "-0.02em" }}>Select a Store</h2>
            <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>{G.SHOPS.length} locations available</p>
          </div>
          <button onClick={onClose} aria-label="Close"
            style={{ width: 34, height: 34, borderRadius: 9, border: "none", background: "var(--surface-2)", color: "var(--text-2)", cursor: "pointer", display: "grid", placeItems: "center", outline: "none" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--line)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--surface-2)"}>
            <IconC name="x" size={16} />
          </button>
        </div>

        {/* Search + sort toolbar */}
        <div style={{ padding: "14px 20px", background: "var(--bg)", borderBottom: "1px solid var(--line)", display: "flex", gap: 10 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }}>
              <IconC name="search" size={15} />
            </span>
            <input
              aria-label="Search stores"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or city..."
              style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box" }}
              onFocus={e => e.currentTarget.style.borderColor = "oklch(0.55 0.13 152)"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--line)"}
            />
          </div>
          <div style={{ position: "relative" }}>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ padding: "10px 30px 10px 12px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-sans)", appearance: "none", cursor: "pointer", outline: "none" }}>
              <option value="distance">Nearest</option>
              <option value="name">A – Z</option>
            </select>
            <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-3)" }}>
              <IconC name="chevD" size={13} />
            </span>
          </div>
        </div>

        {/* Store list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filteredShops.length === 0 ? (
            <div style={{ textAlign: "center", padding: "56px 20px", color: "var(--text-3)" }}>
              <IconC name="search" size={36} style={{ opacity: 0.25, marginBottom: 14 }} />
              <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 4px", color: "var(--text-2)" }}>No stores found</p>
              <p style={{ fontSize: 12, margin: 0 }}>Try a different name or city</p>
            </div>
          ) : (
            filteredShops.map((shop, i) => {
              const active = shop.id === currentShopId;
              const hue = typeof shop.tint === "number" ? shop.tint : 152;
              return (
                <button key={shop.id} onClick={() => { onSelectShop(shop.id); onClose(); }}
                  style={{ width: "100%", padding: "16px 20px", border: "none", borderTop: i === 0 ? "none" : "1px solid var(--line)", background: active ? `oklch(0.97 0.03 ${hue})` : "transparent", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 14, transition: "background 0.15s", outline: "none" }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--surface-2)"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>

                  {/* Store icon */}
                  <div style={{ width: 46, height: 46, borderRadius: 13, background: `linear-gradient(135deg, oklch(0.5 0.15 ${hue}), oklch(0.65 0.11 ${hue + 18}))`, color: "#fff", display: "grid", placeItems: "center", flexShrink: 0, boxShadow: `0 3px 10px oklch(0.55 0.12 ${hue} / 0.35)` }}>
                    <IconC name="pin" size={22} />
                  </div>

                  {/* Store info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.01em" }}>{shop.name}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#d1fae5", color: "#065f46", padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 800 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
                        Open
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>
                      {shop.city && <span>{shop.city}</span>}
                      {shop.address && <span style={{ color: "var(--text-3)" }}> · {shop.address}</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>
                        <IconC name="clock" size={12} style={{ color: "var(--text-3)" }} />
                        {shop.hours || "9am – 9pm"}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>
                        <IconC name="truck" size={12} style={{ color: "var(--text-3)" }} />
                        {APP_CONFIG.deliveryEnabled ? "25–40 min delivery" : "30–45 min pickup"}
                      </span>
                    </div>
                  </div>

                  {/* Active check */}
                  {active ? (
                    <div style={{ width: 28, height: 28, borderRadius: 999, background: `oklch(0.5 0.15 ${hue})`, color: "#fff", display: "grid", placeItems: "center", flexShrink: 0, boxShadow: `0 2px 8px oklch(0.5 0.13 ${hue} / 0.4)` }}>
                      <IconC name="check" size={14} />
                    </div>
                  ) : (
                    <div style={{ width: 28, height: 28, borderRadius: 999, border: "2px solid var(--line)", flexShrink: 0 }} />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid var(--line)", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>{filteredShops.length} store{filteredShops.length !== 1 ? "s" : ""} shown</span>
          <button onClick={onClose}
            style={{ padding: "9px 20px", borderRadius: 9, border: "1px solid var(--line)", background: "transparent", color: "var(--text)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-sans)" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            Close
          </button>
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
          <div style={{ position: "absolute", right: -16, top: -16, opacity: 0.2, color: "#fff", pointerEvents: "none" }}><IconC name="pin" size={96} stroke={1} /></div>
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

export function CollectionBanner({ icon, title, subtitle, accentColor, onClick }) {
  return (
    <div onClick={onClick} style={{ borderRadius: 18, background: `linear-gradient(135deg, oklch(0.38 0.14 ${accentColor}) 0%, oklch(0.52 0.12 ${accentColor + 15}) 100%)`, color: "#fff", cursor: "pointer", transition: "all 0.2s var(--ease)", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 180, position: "relative", overflow: "hidden", boxShadow: `0 4px 20px oklch(0.45 0.12 ${accentColor} / 0.3)` }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 16px 40px oklch(0.45 0.12 ${accentColor} / 0.45)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 4px 20px oklch(0.45 0.12 ${accentColor} / 0.3)`; }}>
      <div style={{ position: "absolute", right: -10, top: -10, opacity: 0.18, color: "#fff", pointerEvents: "none" }}><IconC name={icon || "leaf"} size={96} stroke={1} /></div>
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
