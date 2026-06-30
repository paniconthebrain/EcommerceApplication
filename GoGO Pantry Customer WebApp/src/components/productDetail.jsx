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
    <div style={{ border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", marginBottom: 10 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "var(--surface)", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", textAlign: "left" }}
      >
        <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.01em" }}>{title}</span>
        <span style={{ fontSize: 18, color: "var(--text-3)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", lineHeight: 1 }}>⌄</span>
      </button>
      {open && (
        <div style={{ padding: "0 18px 18px", background: "var(--surface)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function NutritionPanel({ facts }) {
  if (!facts) return null;
  const rows = [
    { label: "Total Fat",        value: facts.fat,      unit: "g" },
    { label: "Total Carbohydrate", value: facts.carbs,  unit: "g" },
    { label: "  Dietary Fiber",  value: facts.fiber,    unit: "g", indent: true },
    { label: "  Sugars",         value: facts.sugar,    unit: "g", indent: true },
    { label: "Protein",          value: facts.protein,  unit: "g" },
    { label: "Sodium",           value: facts.sodium,   unit: "mg" },
  ].filter(r => r.value != null && r.value !== "");

  return (
    <div style={{ border: "3px solid var(--text)", borderRadius: 4, padding: "10px 12px", fontFamily: "var(--font-sans)" }}>
      <div style={{ fontSize: 22, fontWeight: 900, borderBottom: "8px solid var(--text)", marginBottom: 6, paddingBottom: 6, color: "var(--text)" }}>
        Nutrition Facts
      </div>
      {facts.servingSize && (
        <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 4 }}>
          Serving size <strong>{facts.servingSize}</strong>
        </div>
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
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{r.value}{r.unit}</span>
        </div>
      ))}
    </div>
  );
}

export function ProductDetailPage({
  shopId, productId, cartItems, onAddToCart, onUpdateCart, onBack, savedItems, onToggleSave, onRequireAuth, user,
}) {
  const product = G.PRODUCTS_MAP[productId];
  const [qty, setQty] = useState(1);
  const [subPref, setSubPref] = useState("none");
  const [heroImg, setHeroImg] = useState(null);
  const [toast, setToast] = useState(null);
  const [notified, setNotified] = useState(false);
  const toastTimerRef = useRef(null);

  const inCart = product ? (cartItems[product.id] || 0) : 0;

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

  const stockColors = {
    out:  { bg: "var(--red-100)",   color: "var(--red-500)",   dot: "var(--red-500)" },
    low:  { bg: "var(--amber-100)", color: "var(--amber-600)", dot: "var(--amber-500)" },
    ok:   { bg: "var(--green-100)", color: "var(--green-600)", dot: "var(--green-500)" },
  };
  const sc = stockColors[stockState] || stockColors.ok;

  const showToast = (msg, withUndo = false) => {
    clearTimeout(toastTimerRef.current);
    setToast({ msg, withUndo });
    toastTimerRef.current = setTimeout(() => setToast(null), 8000);
  };

  const handleAdd = () => {
    if (!user) { onRequireAuth?.(); return; }
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

  const isSaved = savedItems?.has(product.id);

  const specRows = [
    product.size            && { label: "Size",               value: product.size },
    product.weight          && { label: "Weight",             value: product.weight },
    product.countryOfOrigin && { label: "Country of Origin",  value: product.countryOfOrigin },
    product.storageInstructions && { label: "Storage",        value: product.storageInstructions },
    product.barcode         && { label: "Barcode",            value: product.barcode },
  ].filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 100 }}>

      {/* ── Sticky header ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--surface)", borderBottom: "1px solid var(--line)", padding: "0 16px", height: 56, display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onBack}
          aria-label="Back to browse"
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 999, border: "1.5px solid var(--line)", background: "transparent", color: "var(--text-2)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-sans)", flexShrink: 0, transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--text)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>←</span> Browse
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {product.name}
          </p>
        </div>
        <button
          onClick={() => onToggleSave?.(product.id)}
          aria-label={isSaved ? "Remove from saved" : "Save item"}
          style={{ width: 38, height: 38, borderRadius: 999, border: "1.5px solid var(--line)", background: isSaved ? "var(--primary-soft)" : "transparent", cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0, transition: "all 0.15s" }}
        >
          <IconC name="heart" size={17} style={{ color: isSaved ? "var(--primary)" : "var(--text-3)", fill: isSaved ? "var(--primary)" : "none" }} />
        </button>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 16px" }}>

        {/* ── Hero image ── */}
        <div style={{ position: "relative", background: `linear-gradient(135deg, hsl(${hue},50%,90%) 0%, hsl(${hue},55%,85%) 100%)`, minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: "0 0 20px 20px", marginBottom: 16 }}>
          {heroImg
            ? <img src={heroImg} alt={product.name} style={{ width: "100%", maxHeight: 380, objectFit: "contain" }} />
            : <div style={{ color: `hsl(${hue},45%,62%)` }}><IconC name="cart" size={100} stroke={1.2} /></div>
          }
          {product.tags?.includes("sale") && salePrice && (
            <div style={{ position: "absolute", top: 14, left: 14, background: "#ef4444", color: "#fff", padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 800 }}>
              SALE
            </div>
          )}
        </div>

        {/* Gallery thumbnails */}
        {gallery.length > 1 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
            {gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setHeroImg(img)}
                style={{ width: 64, height: 64, flexShrink: 0, borderRadius: 10, border: `2px solid ${heroImg === img ? "var(--primary)" : "var(--line)"}`, overflow: "hidden", cursor: "pointer", padding: 0, background: `hsl(${hue},50%,92%)` }}
              >
                <img src={img} alt={`View ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </button>
            ))}
          </div>
        )}

        {/* ── Toast ── */}
        {toast && (
          <div
            role="status"
            aria-live="assertive"
            aria-atomic="true"
            style={{ marginBottom: 12, padding: "10px 14px", background: "var(--text)", color: "#fff", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}
          >
            <span style={{ flex: 1 }}>{toast.msg}</span>
            {toast.withUndo && (
              <button onClick={handleUndo} style={{ background: "none", border: "none", color: "#6ee7b7", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-sans)", padding: 0 }}>
                Undo
              </button>
            )}
          </div>
        )}

        {/* ── Identity block ── */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `hsl(${hue},60%,93%)`, color: `hsl(${hue},55%,34%)`, padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
          <div style={{ width: 7, height: 7, borderRadius: 999, background: `hsl(${hue},60%,42%)` }} />
          {cat?.name}
        </div>

        {product.isRestricted18Plus && (
          <span style={{ marginLeft: 8, display: "inline-flex", alignItems: "center", gap: 4, background: "var(--red-100)", color: "var(--red-500)", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800, verticalAlign: "middle" }}>
            18+ Only
          </span>
        )}

        <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", margin: "8px 0 4px", lineHeight: 1.2, letterSpacing: "-0.025em" }}>
          {product.name}
        </h1>
        {product.brand && (
          <p style={{ fontSize: 14, color: "var(--text-3)", margin: "0 0 14px" }}>by {product.brand}</p>
        )}

        {/* ── Price block ── */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 34, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.03em" }}>
            ${displayPrice.toFixed(2)}
          </span>
          {salePrice && (
            <>
              <span style={{ fontSize: 18, color: "var(--text-3)", textDecoration: "line-through", marginBottom: 4 }}>
                ${price.toFixed(2)}
              </span>
              <span style={{ fontSize: 13, fontWeight: 800, background: "#dcfce7", color: "#166534", padding: "3px 10px", borderRadius: 999, marginBottom: 4 }}>
                Save {savings}%
              </span>
            </>
          )}
          <span style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 4 }}>per {product.unit}</span>
        </div>

        {/* Stock badge + pickup chip */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: stockState !== "ok" ? 10 : 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: sc.color, background: sc.bg, padding: "5px 12px", borderRadius: 999 }}>
            <div style={{ width: 6, height: 6, borderRadius: 999, background: sc.dot }} />
            {stockState === "out" ? "Out of stock" : stockState === "low" ? `Only ${stock} left` : "In stock"}
          </div>
          {currentShop && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--text-2)", background: "var(--surface-2)", padding: "5px 12px", borderRadius: 999, border: "1px solid var(--line)" }}>
              🏪 Ready for pickup at {currentShop.name}
            </div>
          )}
        </div>

        {/* Low/out microcopy */}
        {stockState !== "ok" && (
          <div style={{ marginBottom: 16, padding: "9px 13px", background: stockState === "out" ? "var(--red-100)" : "var(--amber-100)", borderRadius: 10, fontSize: 13, fontWeight: 600, color: stockState === "out" ? "#991b1b" : "#92400e", border: `1px solid ${stockState === "out" ? "#fecaca" : "#fde68a"}` }}>
            {stockState === "out"
              ? "Out of stock — we'll let you know when it's back."
              : `Only ${stock} left — add now to avoid missing out.`}
          </div>
        )}

        <div style={{ height: 1, background: "var(--line)", margin: "4px 0 20px" }} />

        {/* ── CTA: Add to Cart or Notify Me ── */}
        {stockState === "out" ? (
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={handleNotify}
              disabled={notified}
              style={{ width: "100%", height: 52, borderRadius: 14, border: `2px solid ${notified ? "var(--green-500)" : "var(--primary)"}`, background: notified ? "var(--green-100)" : "transparent", color: notified ? "#166534" : "var(--primary)", fontWeight: 800, fontSize: 16, cursor: notified ? "default" : "pointer", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.18s" }}
            >
              <IconC name="bell" size={18} />
              {notified ? "You'll be notified when it's back" : "Notify me when available"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <div
              role="group"
              aria-label="Quantity"
              style={{ display: "flex", alignItems: "center", background: "var(--surface-2)", borderRadius: 14, overflow: "hidden", border: "1.5px solid var(--line)", flexShrink: 0 }}
            >
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                style={{ width: 48, height: 52, border: "none", background: "transparent", color: "var(--text)", fontWeight: 700, fontSize: 22, cursor: "pointer", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)", transition: "background 0.12s" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--line)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >−</button>
              <span aria-label={`Quantity: ${qty}`} style={{ minWidth: 40, textAlign: "center", fontWeight: 900, fontSize: 18, color: "var(--text)", letterSpacing: "-0.02em" }}>{qty}</span>
              <button
                onClick={() => setQty(q => q + 1)}
                aria-label="Increase quantity"
                style={{ width: 48, height: 52, border: "none", background: "transparent", color: "var(--text)", fontWeight: 700, fontSize: 22, cursor: "pointer", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)", transition: "background 0.12s" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--line)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >+</button>
            </div>
            <button
              onClick={handleAdd}
              style={{ flex: 1, height: 52, borderRadius: 14, border: "none", background: "var(--primary)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.18s var(--spring)", boxShadow: "var(--shadow-primary)", letterSpacing: "-0.01em" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-primary-lg)"; e.currentTarget.style.background = "var(--primary-hover)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow-primary)"; e.currentTarget.style.background = "var(--primary)"; }}
            >
              {inCart > 0 ? `Update Cart (${qty}) · $${(displayPrice * qty).toFixed(2)}` : `Add ${qty} to Cart · $${(displayPrice * qty).toFixed(2)}`}
            </button>
          </div>
        )}

        {/* ── Accordions ── */}

        {/* About this item */}
        <Accordion title="About this item" defaultOpen>
          {product.description && (
            <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, margin: "0 0 12px" }}>
              {product.description}
            </p>
          )}
          {specRows.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", marginTop: 4 }}>
              {specRows.map(r => (
                <div key={r.label} style={{ padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{r.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{r.value}</div>
                </div>
              ))}
            </div>
          )}
          {!product.description && specRows.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>No details available yet.</p>
          )}
        </Accordion>

        {/* Specifications / Attributes */}
        {product.attributes?.length > 0 && (
          <Accordion title="Specifications">
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {product.attributes.map((attr, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < product.attributes.length - 1 ? "1px solid var(--line)" : "none" }}>
                  <span style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 600 }}>{attr.key || attr.name || attr.label}</span>
                  <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 700 }}>{attr.value}</span>
                </div>
              ))}
            </div>
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
              <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65, margin: "0 0 14px" }}>
                <strong style={{ color: "var(--text)" }}>Ingredients:</strong> {product.ingredients}
              </p>
            )}
            {product.allergens?.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                  Contains
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {product.allergens.map(a => (
                    <span key={a} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--amber-100)", color: "#92400e", padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, border: "1px solid #fde68a" }}>
                      {ALLERGEN_ICONS[a] || "⚠️"} {a.charAt(0).toUpperCase() + a.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Accordion>
        )}

        {/* Substitution preference */}
        {stockState !== "out" && (
          <Accordion title="Substitution preference">
            <div role="radiogroup" aria-label="Substitution preference" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SUB_PREFS.map(opt => {
                const active = subPref === opt.value;
                return (
                  <label
                    key={opt.value}
                    style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 13px", borderRadius: 12, border: `1.5px solid ${active ? "var(--primary)" : "var(--line)"}`, background: active ? `hsl(${hue},60%,96%)` : "var(--surface)", cursor: "pointer", transition: "border-color 0.15s, background 0.15s" }}
                  >
                    <input
                      type="radio"
                      name={`subpref-${product.id}`}
                      value={opt.value}
                      checked={active}
                      onChange={() => setSubPref(opt.value)}
                      style={{ accentColor: "var(--primary)", marginTop: 3, flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 1 }}>{opt.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </Accordion>
        )}
      </div>

      {/* ── Sticky bottom CTA bar ── */}
      {stockState !== "out" && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--surface)", borderTop: "1px solid var(--line)", padding: "12px 20px 20px", zIndex: 40, display: "flex", gap: 12, alignItems: "center", backdropFilter: "blur(8px)" }}>
          <div
            role="group"
            aria-label="Quantity"
            style={{ display: "flex", alignItems: "center", background: "var(--surface-2)", borderRadius: 12, overflow: "hidden", border: "1.5px solid var(--line)", flexShrink: 0 }}
          >
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              style={{ width: 42, height: 46, border: "none", background: "transparent", color: "var(--text)", fontWeight: 700, fontSize: 20, cursor: "pointer", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)" }}
            >−</button>
            <span style={{ minWidth: 34, textAlign: "center", fontWeight: 900, fontSize: 16, color: "var(--text)" }}>{qty}</span>
            <button
              onClick={() => setQty(q => q + 1)}
              style={{ width: 42, height: 46, border: "none", background: "transparent", color: "var(--text)", fontWeight: 700, fontSize: 20, cursor: "pointer", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)" }}
            >+</button>
          </div>
          <button
            onClick={handleAdd}
            style={{ flex: 1, height: 48, borderRadius: 12, border: "none", background: "var(--primary)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "var(--font-sans)", boxShadow: "var(--shadow-primary)", letterSpacing: "-0.01em", transition: "all 0.15s" }}
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
