import { useState, useEffect, useRef } from 'react';
import { G } from '../globals.js';
import { IconC } from './icons.jsx';

const SUB_PREFS = [
  { value: "none",    label: "No substitutions",    desc: "Cancel item if unavailable" },
  { value: "similar", label: "Allow similar brand",  desc: "Same product, different brand if needed" },
  { value: "any",     label: "Allow any substitute", desc: "Shopper picks best available option" },
];

const ALLERGEN_ICONS = {
  gluten: "🌾", dairy: "🥛", nuts: "🥜", soy: "🫘",
  eggs: "🥚", fish: "🐟", shellfish: "🦐", sesame: "🫙",
};

function Accordion({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: "1px solid var(--line)", marginBottom: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", background: "transparent", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", textAlign: "left" }}
      >
        <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.01em" }}>{title}</span>
        <span style={{ fontSize: 18, color: "var(--text-3)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", lineHeight: 1, flexShrink: 0 }}>⌄</span>
      </button>
      {open && (
        <div style={{ paddingBottom: 18 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function NutritionPanel({ facts }) {
  if (!facts) return null;
  const rows = [
    { label: "Total Fat",          value: facts.fat,     unit: "g" },
    { label: "Total Carbohydrate", value: facts.carbs,   unit: "g" },
    { label: "Dietary Fiber",      value: facts.fiber,   unit: "g", indent: true },
    { label: "Sugars",             value: facts.sugar,   unit: "g", indent: true },
    { label: "Protein",            value: facts.protein, unit: "g" },
    { label: "Sodium",             value: facts.sodium,  unit: "mg" },
  ].filter(r => r.value != null && r.value !== "");

  return (
    <div style={{ border: "3px solid var(--text)", borderRadius: 6, padding: "12px 14px", fontFamily: "var(--font-sans)", maxWidth: 360 }}>
      <div style={{ fontSize: 22, fontWeight: 900, borderBottom: "8px solid var(--text)", marginBottom: 6, paddingBottom: 6 }}>Nutrition Facts</div>
      {facts.servingSize && (
        <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 4 }}>Serving size <strong>{facts.servingSize}</strong></div>
      )}
      {facts.calories != null && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "4px solid var(--text)", borderTop: "1px solid var(--line)", padding: "6px 0", marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-2)" }}>Calories</span>
          <span style={{ fontSize: 30, fontWeight: 900, color: "var(--text)" }}>{facts.calories}</span>
        </div>
      )}
      {rows.map(r => (
        <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid var(--line)", paddingLeft: r.indent ? 14 : 0 }}>
          <span style={{ fontSize: 12, color: "var(--text)", fontWeight: r.indent ? 400 : 600 }}>{r.label}</span>
          <span style={{ fontSize: 12, fontWeight: 700 }}>{r.value}{r.unit}</span>
        </div>
      ))}
    </div>
  );
}

/** Branded stand-in for a missing/broken product photo — a grocery basket, not a bare cart icon. */
function ProductPlaceholder({ hue, iconSize = 100 }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, hsl(${hue},45%,92%) 0%, hsl(${hue},50%,87%) 100%)` }}>
      <IconC name="basket" size={iconSize} stroke={1.4} style={{ color: `hsl(${hue},45%,55%)` }} />
    </div>
  );
}

/** Collapsed-by-default "Substitution: <label> ▾" control — expands into the 3 preference options. */
function SubstitutionPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const current = SUB_PREFS.find(o => o.value === value) || SUB_PREFS[0];
  return (
    <div style={{ border: "1.5px solid var(--line)", borderRadius: 12, marginBottom: 20 }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", textAlign: "left" }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
          Substitution: <span style={{ fontWeight: 500, color: "var(--text-3)" }}>{current.label}</span>
        </span>
        <span style={{ fontSize: 16, color: "var(--text-3)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>⌄</span>
      </button>
      {open && (
        <div role="radiogroup" aria-label="Substitution preference" style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 14px 14px" }}>
          {SUB_PREFS.map(opt => {
            const active = value === opt.value;
            return (
              <label
                key={opt.value}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 13px", borderRadius: 10, border: `1.5px solid ${active ? "var(--primary)" : "var(--line)"}`, background: active ? "var(--primary-soft)" : "var(--surface)", cursor: "pointer", transition: "all 0.15s" }}
              >
                <input
                  type="radio"
                  name="subpref"
                  value={opt.value}
                  checked={active}
                  onChange={() => { onChange(opt.value); setOpen(false); }}
                  style={{ accentColor: "var(--primary)", flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 1 }}>{opt.desc}</div>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ProductDetailPage({
  shopId, productId, cartItems, onAddToCart, onUpdateCart, onBack, onSelectProduct, savedItems, onToggleSave, onRequireAuth, user,
}) {
  const product = G.PRODUCTS_MAP[productId];
  const [qty, setQty] = useState(1);
  const [subPref, setSubPref] = useState("none");
  const [heroImg, setHeroImg] = useState(null);
  const [toast, setToast] = useState(null);
  const [notified, setNotified] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const [zoom, setZoom] = useState({ active: false, origin: "50% 50%" });
  const [dataVersion, setDataVersion] = useState(() => (G.PRODUCTS?.length > 0 ? 1 : 0));
  const toastTimerRef = useRef(null);

  const inCart = product ? (cartItems[product.id] || 0) : 0;

  // On a hard reload/deep link, G.PRODUCTS_MAP is still empty while
  // initializeAppData()'s fetch is in flight — without this, the page would
  // permanently show "Product not found" since G is a plain mutable object,
  // not React state, so filling it in later doesn't trigger a re-render.
  useEffect(() => {
    if (G.PRODUCTS?.length > 0) setDataVersion(n => n > 0 ? n : 1);
    const handler = () => setDataVersion(n => n + 1);
    window.addEventListener("dataLoaded", handler);
    return () => window.removeEventListener("dataLoaded", handler);
  }, []);

  useEffect(() => {
    if (product) {
      setHeroImg(product.image || null);
      setQty(inCart > 0 ? inCart : 1);
    }
  }, [productId, product?.id]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onBack(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onBack]);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  if (!product) {
    if (dataVersion === 0) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
          <style>{`@keyframes pdpSpin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid var(--line)", borderTopColor: "var(--primary)", animation: "pdpSpin 0.7s linear infinite" }} />
          <p style={{ color: "var(--text-3)", fontSize: 14, fontWeight: 600 }}>Loading product…</p>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
        <IconC name="box" size={48} style={{ opacity: 0.2 }} />
        <p style={{ color: "var(--text-3)", fontSize: 16, fontWeight: 700 }}>Product not found</p>
        <button onClick={onBack} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "var(--primary)", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14 }}>
          Back to Browse
        </button>
      </div>
    );
  }

  const cat = G.catOf(product.cat);
  const hue = cat?.hue || 152;
  const stock = G.shopStock(product.id, shopId);
  const stockState = G.stockState(stock, product.par || 10);
  const currentShop = G.SHOPS.find(s => s.id === shopId);
  const price = parseFloat(product.price) || 0;
  const salePrice = product.salePrice ? parseFloat(product.salePrice) : null;
  const displayPrice = salePrice || price;
  const savings = salePrice && price > salePrice ? ((1 - salePrice / price) * 100).toFixed(0) : null;
  const gallery = [product.image, ...(product.galleryImages || [])].filter(Boolean);
  const isSaved = savedItems?.has(product.id);
  const related = G.PRODUCTS.filter(p => p.cat === product.cat && p.id !== product.id).slice(0, 8);

  const stockColors = {
    out: { bg: "var(--red-100)",   color: "var(--red-500)",   dot: "var(--red-500)" },
    low: { bg: "var(--amber-100)", color: "var(--amber-600)", dot: "var(--amber-500)" },
    ok:  { bg: "var(--green-100)", color: "var(--green-600)", dot: "var(--green-500)" },
  };
  const sc = stockColors[stockState] || stockColors.ok;

  const showToast = (msg, withUndo = false) => {
    clearTimeout(toastTimerRef.current);
    setToast({ msg, withUndo });
    toastTimerRef.current = setTimeout(() => setToast(null), 8000);
  };

  const handleAdd = () => {
    if (!user) { onRequireAuth?.(); return; }
    setPulseKey(k => k + 1);
    if (inCart > 0) {
      onUpdateCart(product.id, qty);
      showToast(`Cart updated — ${qty} × ${product.name}`, false);
    } else {
      for (let i = 0; i < qty; i++) onAddToCart(product.id);
      showToast(`Added ${qty} × ${product.name} to cart`, true);
    }
  };

  const handleUndo = () => {
    onUpdateCart(product.id, 0);
    clearTimeout(toastTimerRef.current);
    setToast(null);
  };

  const handleNotify = () => {
    setNotified(true);
    showToast("We'll notify you when this is back in stock", false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: `Check out ${product.name} on GoGO Pantry`, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        showToast("Link copied to clipboard", false);
      }
    } catch {
      // User dismissed the native share sheet.
    }
  };

  const specRows = [
    product.size             && { label: "Size",             value: product.size },
    product.weight           && { label: "Weight",           value: product.weight },
    product.countryOfOrigin  && { label: "Country of Origin",value: product.countryOfOrigin },
    product.storageInstructions && { label: "Storage",       value: product.storageInstructions },
    product.barcode          && { label: "Barcode / UPC",    value: product.barcode },
  ].filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 90 }}>
      <style>{`
        @media (min-width: 768px) {
          .pdp-layout { display: grid !important; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
          .pdp-sticky-bar { display: none !important; }
          .pdp-gallery-col { position: sticky; top: 72px; }
        }
        @media (max-width: 767px) {
          .pdp-layout { display: block !important; }
          .pdp-info-col { padding: 0 16px; }
        }
        @keyframes pdpPop { 0% { transform: scale(1); } 40% { transform: scale(0.94); } 100% { transform: scale(1); } }
        @keyframes pdpToastIn { from { transform: translateY(-8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      {/* ── Sticky header ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--surface)", borderBottom: "1px solid var(--line)", padding: "0 20px", height: 56, display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onBack}
          aria-label="Back to browse"
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 999, border: "1.5px solid var(--line)", background: "transparent", color: "var(--text-2)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-sans)", flexShrink: 0, transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--text)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; }}
        >
          <span style={{ fontSize: 16 }}>←</span> Browse
        </button>
        <p style={{ margin: 0, flex: 1, fontSize: 14, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {product.name}
        </p>
        <button
          onClick={() => onToggleSave?.(product.id)}
          aria-label={isSaved ? "Remove from saved" : "Save item"}
          style={{ width: 38, height: 38, borderRadius: 999, border: "1.5px solid var(--line)", background: isSaved ? "var(--primary-soft)" : "transparent", cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0, transition: "all 0.15s" }}
        >
          <IconC name="heart" size={17} style={{ color: isSaved ? "var(--primary)" : "var(--text-3)" }} />
        </button>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div
          role="status"
          aria-live="assertive"
          aria-atomic="true"
          style={{ margin: "12px 20px 0", padding: "11px 16px", background: "var(--text)", color: "#fff", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, fontSize: 13, maxWidth: 760, marginLeft: "auto", marginRight: "auto", animation: "pdpToastIn 0.2s ease-out" }}
        >
          <span style={{ flex: 1 }}>{toast.msg}</span>
          {toast.withUndo && (
            <button onClick={handleUndo} style={{ background: "none", border: "none", color: "#6ee7b7", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-sans)", padding: 0 }}>
              Undo
            </button>
          )}
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px 0" }}>
        <div className="pdp-layout" style={{ display: "block" }}>

          {/* ── LEFT: Image gallery ── */}
          <div className="pdp-gallery-col">
            {/* Hero */}
            <div
              style={{ borderRadius: 20, overflow: "hidden", aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", cursor: heroImg ? "zoom-in" : "default" }}
              onMouseEnter={() => heroImg && setZoom(z => ({ ...z, active: true }))}
              onMouseLeave={() => setZoom({ active: false, origin: "50% 50%" })}
              onMouseMove={e => {
                if (!heroImg) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setZoom({ active: true, origin: `${x}% ${y}%` });
              }}
            >
              {heroImg
                ? (
                  <img
                    src={heroImg}
                    alt={product.name}
                    onError={() => setHeroImg(null)}
                    style={{ width: "100%", height: "100%", objectFit: "contain", padding: 20, background: `linear-gradient(135deg, hsl(${hue},45%,92%) 0%, hsl(${hue},50%,87%) 100%)`, transform: zoom.active ? "scale(1.8)" : "scale(1)", transformOrigin: zoom.origin, transition: "transform 0.15s ease-out" }}
                  />
                )
                : <ProductPlaceholder hue={hue} />
              }
              {salePrice && savings && (
                <div style={{ position: "absolute", top: 14, left: 14, background: "#ef4444", color: "#fff", padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 800, letterSpacing: "0.02em" }}>
                  {savings}% OFF
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div style={{ display: "flex", gap: 8, marginTop: 10, overflowX: "auto", paddingBottom: 4 }}>
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroImg(img)}
                    style={{ width: 64, height: 64, flexShrink: 0, borderRadius: 10, border: `2px solid ${heroImg === img ? "var(--primary)" : "var(--line)"}`, overflow: "hidden", cursor: "pointer", padding: 0, background: `hsl(${hue},50%,92%)`, transition: "border-color 0.15s" }}
                  >
                    <img src={img} alt={`View ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product info ── */}
          <div className="pdp-info-col" style={{ marginTop: 24 }}>

            {/* Category + badges */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `hsl(${hue},60%,93%)`, color: `hsl(${hue},55%,34%)`, padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: `hsl(${hue},60%,42%)`, display: "inline-block" }} />
                {cat?.name}
              </span>
              {product.isRestricted18Plus && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--red-100)", color: "var(--red-500)", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 800, border: "1px solid #fecaca" }}>
                  18+ Only
                </span>
              )}
            </div>

            {/* Name */}
            <h1 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 900, color: "var(--text)", margin: "0 0 4px", lineHeight: 1.2, letterSpacing: "-0.025em", textAlign: "left" }}>
              {product.name}
            </h1>
            {product.brand && (
              <p style={{ fontSize: 14, color: "var(--text-3)", margin: "0 0 18px", textAlign: "left" }}>by {product.brand}</p>
            )}

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              <span style={{ fontSize: "clamp(28px, 5vw, 36px)", fontWeight: 900, color: salePrice ? "#dc2626" : "var(--text)", letterSpacing: "-0.03em" }}>
                ${displayPrice.toFixed(2)}
              </span>
              <span style={{ fontSize: 15, color: "var(--text-3)" }}>/ {product.unit}</span>
              {salePrice && (
                <>
                  <span style={{ fontSize: 18, color: "var(--text-3)", textDecoration: "line-through" }}>${price.toFixed(2)}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, background: "#dcfce7", color: "#166534", padding: "3px 10px", borderRadius: 999 }}>
                    Save {savings}%
                  </span>
                </>
              )}
            </div>

            {/* Stock + fulfillment — single inline row */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: sc.color, background: sc.bg, padding: "5px 12px", borderRadius: 999 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: sc.dot, display: "inline-block", flexShrink: 0 }} />
                {stockState === "out" ? "Out of stock" : stockState === "low" ? `Only ${stock} left` : "In stock"}
              </span>
              {currentShop && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-2)" }}>
                  <IconC name="pin" size={14} style={{ color: "var(--text-3)" }} />
                  Pickup at <strong style={{ color: "var(--text)" }}>{currentShop.name}</strong>
                </span>
              )}
              {currentShop?.pickupTime && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-2)" }}>
                  <IconC name="clock" size={14} style={{ color: "var(--text-3)" }} />
                  Ready in {currentShop.pickupTime}
                </span>
              )}
            </div>

            {/* Size / tags */}
            {(product.size || product.weight || product.tags?.length > 0) && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {(product.size || product.weight) && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, border: "1px solid var(--line)", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>
                    <IconC name="box" size={12} style={{ color: "var(--text-3)" }} /> {product.size || product.weight}
                  </span>
                )}
                {product.tags?.map(t => (
                  <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 5, border: "1px solid var(--line)", padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>
                    <IconC name="tag" size={12} style={{ color: "var(--text-3)" }} /> {t}
                  </span>
                ))}
              </div>
            )}

            {/* Low stock warning */}
            {stockState === "low" && (
              <div style={{ marginBottom: 16, padding: "9px 13px", background: "var(--amber-100)", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#92400e", border: "1px solid #fde68a" }}>
                Only {stock} left — add to cart now to secure yours.
              </div>
            )}

            <div style={{ height: 1, background: "var(--line)", margin: "4px 0 20px" }} />

            {/* CTA */}
            {stockState === "out" ? (
              <button
                onClick={handleNotify}
                disabled={notified}
                style={{ width: "100%", height: 54, borderRadius: 14, border: `2px solid ${notified ? "var(--green-500)" : "var(--primary)"}`, background: notified ? "var(--green-100)" : "transparent", color: notified ? "#166534" : "var(--primary)", fontWeight: 800, fontSize: 16, cursor: notified ? "default" : "pointer", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.18s", marginBottom: 20 }}
              >
                <IconC name="bell" size={18} />
                {notified ? "You'll be notified when it's back" : "Notify me when available"}
              </button>
            ) : (
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                {/* Qty stepper */}
                <div
                  role="group"
                  aria-label="Quantity"
                  style={{ display: "flex", alignItems: "center", background: "var(--surface-2)", borderRadius: 14, border: "1.5px solid var(--line)", flexShrink: 0 }}
                >
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    style={{ width: 48, height: 54, border: "none", background: "transparent", color: "var(--text)", fontWeight: 700, fontSize: 22, cursor: "pointer", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)", borderRadius: "14px 0 0 14px" }}
                  >−</button>
                  <span aria-label={`Quantity: ${qty}`} style={{ minWidth: 40, textAlign: "center", fontWeight: 900, fontSize: 18, color: "var(--text)" }}>{qty}</span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    aria-label="Increase quantity"
                    style={{ width: 48, height: 54, border: "none", background: "transparent", color: "var(--text)", fontWeight: 700, fontSize: 22, cursor: "pointer", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)", borderRadius: "0 14px 14px 0" }}
                  >+</button>
                </div>
                {/* Add button */}
                <button
                  onClick={handleAdd}
                  style={{ flex: 1, height: 54, borderRadius: 14, border: "none", background: "var(--primary)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "var(--font-sans)", boxShadow: "var(--shadow-primary)", letterSpacing: "-0.01em", transition: "all 0.18s var(--spring)" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-primary-lg)"; e.currentTarget.style.background = "var(--primary-hover)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow-primary)"; e.currentTarget.style.background = "var(--primary)"; }}
                >
                  <span key={pulseKey} style={{ display: "inline-block", animation: "pdpPop 0.22s ease-out" }}>
                    {inCart > 0
                      ? `Update Cart (${qty}) · $${(displayPrice * qty).toFixed(2)}`
                      : `Add ${qty} to Cart · $${(displayPrice * qty).toFixed(2)}`}
                  </span>
                </button>
              </div>
            )}

            {/* Quick specs panel — shown inline on desktop */}
            {specRows.length > 0 && (
              <div style={{ background: "var(--surface-2)", borderRadius: 14, padding: "14px 16px", marginBottom: 20, border: "1px solid var(--line)" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Product Details</div>
                <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 20, rowGap: 6 }}>
                  {specRows.map(r => (
                    <>
                      <dt key={`dt-${r.label}`} style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 600, whiteSpace: "nowrap", margin: 0 }}>{r.label}</dt>
                      <dd key={`dd-${r.label}`} style={{ fontSize: 13, color: "var(--text)", fontWeight: 700, margin: 0 }}>{r.value}</dd>
                    </>
                  ))}
                </dl>
              </div>
            )}

            {/* Substitution preference — collapsed by default */}
            {stockState !== "out" && (
              <SubstitutionPicker value={subPref} onChange={setSubPref} />
            )}

            {/* Secondary actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <button
                onClick={handleShare}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "var(--text-2)" }}
              >
                <IconC name="share" size={15} /> Share
              </button>
            </div>
          </div>
        </div>

        {/* ── Below-fold accordions ── */}
        <div style={{ maxWidth: 760, marginTop: 32 }}>

          {/* Description */}
          {product.description && (
            <Accordion title="About this item" defaultOpen>
              <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75, margin: 0, textAlign: "left" }}>
                {product.description}
              </p>
            </Accordion>
          )}

          {/* Attributes */}
          {product.attributes?.length > 0 && (
            <Accordion title="Specifications">
              <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 24, rowGap: 8 }}>
                {product.attributes.map((attr, i) => (
                  <>
                    <dt key={`dt-${i}`} style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 600, margin: 0 }}>{attr.key || attr.name || attr.label}</dt>
                    <dd key={`dd-${i}`} style={{ fontSize: 13, color: "var(--text)", fontWeight: 700, margin: 0 }}>{attr.value}</dd>
                  </>
                ))}
              </dl>
            </Accordion>
          )}

          {/* Nutrition Facts */}
          {product.nutritionFacts && (
            <Accordion title="Nutrition Facts">
              <NutritionPanel facts={product.nutritionFacts} />
            </Accordion>
          )}

          {/* Ingredients & Allergens */}
          {(product.ingredients || product.allergens?.length > 0) && (
            <Accordion title="Ingredients & Allergens">
              {product.ingredients && (
                <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7, margin: "0 0 16px", textAlign: "left" }}>
                  <strong style={{ color: "var(--text)" }}>Ingredients:</strong> {product.ingredients}
                </p>
              )}
              {product.allergens?.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Contains</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {product.allergens.map(a => (
                      <span key={a} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--amber-100)", color: "#92400e", padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, border: "1px solid #fde68a" }}>
                        {ALLERGEN_ICONS[a] || "⚠️"} {a.charAt(0).toUpperCase() + a.slice(1)}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </Accordion>
          )}
        </div>

        {/* ── You might also like ── */}
        {related.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--text)", margin: "0 0 14px" }}>You might also like</h2>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6 }}>
              {related.map(rp => {
                const rpHue = G.catOf(rp.cat)?.hue || 152;
                const rpPrice = rp.salePrice ? parseFloat(rp.salePrice) : parseFloat(rp.price) || 0;
                return (
                  <button
                    key={rp.id}
                    onClick={() => onSelectProduct?.(rp.id)}
                    style={{ width: 132, flexShrink: 0, textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-sans)" }}
                  >
                    <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: 14, overflow: "hidden", marginBottom: 8 }}>
                      {rp.image
                        ? <img src={rp.image} alt={rp.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 10, background: `hsl(${rpHue},50%,95%)` }} />
                        : <ProductPlaceholder hue={rpHue} iconSize={40} />
                      }
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)", lineHeight: 1.35, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {rp.name}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>${rpPrice.toFixed(2)}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Customer reviews ── */}
        <div style={{ maxWidth: 760, margin: "40px 0 20px" }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--text)", margin: "0 0 14px" }}>Customer reviews</h2>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "32px 20px", border: "1.5px dashed var(--line)", borderRadius: 16, textAlign: "center" }}>
            <IconC name="star" size={26} style={{ color: "var(--text-3)", opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-2)" }}>No reviews yet</p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-3)", maxWidth: 320 }}>Be the first to try this item and share what you thought.</p>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky CTA ── */}
      {stockState !== "out" && (
        <div className="pdp-sticky-bar" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--surface)", borderTop: "1px solid var(--line)", padding: "12px 16px 20px", zIndex: 40, display: "flex", gap: 10, alignItems: "center", backdropFilter: "blur(8px)" }}>
          <div
            role="group"
            aria-label="Quantity"
            style={{ display: "flex", alignItems: "center", background: "var(--surface-2)", borderRadius: 12, border: "1.5px solid var(--line)", flexShrink: 0 }}
          >
            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 44, height: 48, border: "none", background: "transparent", color: "var(--text)", fontWeight: 700, fontSize: 20, cursor: "pointer", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)" }}>−</button>
            <span style={{ minWidth: 36, textAlign: "center", fontWeight: 900, fontSize: 16, color: "var(--text)" }}>{qty}</span>
            <button onClick={() => setQty(q => q + 1)} style={{ width: 44, height: 48, border: "none", background: "transparent", color: "var(--text)", fontWeight: 700, fontSize: 20, cursor: "pointer", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)" }}>+</button>
          </div>
          <button
            onClick={handleAdd}
            style={{ flex: 1, height: 50, borderRadius: 12, border: "none", background: "var(--primary)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "var(--font-sans)", boxShadow: "var(--shadow-primary)", letterSpacing: "-0.01em" }}
          >
            {inCart > 0
              ? `Update Cart · $${(displayPrice * qty).toFixed(2)}`
              : `Add to Cart · $${(displayPrice * qty).toFixed(2)}`}
          </button>
        </div>
      )}
    </div>
  );
}
