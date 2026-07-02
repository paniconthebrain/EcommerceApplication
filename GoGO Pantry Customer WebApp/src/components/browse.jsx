import { useState, useEffect, useMemo, useRef } from 'react';
import { G, API_BASE } from '../globals.js';
import { IconC } from './icons.jsx';
import { BtnC } from './ui.jsx';

export function PriceRangeInput({ value, onChange, cap = 100, floor = 0 }) {
  const [lo, hi] = value;
  const numStyle = {
    width: "100%", padding: "9px 10px", borderRadius: 10, border: "1.5px solid var(--line)",
    background: "var(--surface)", color: "var(--text)", fontSize: 14, fontFamily: "var(--font-sans)",
    outline: "none", textAlign: "center", fontWeight: 600,
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Min</div>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", fontSize: 13 }}>$</span>
          <input type="number" min={floor} max={cap} value={lo}
            onChange={e => { const v = Math.max(floor, Math.min(parseInt(e.target.value) || floor, hi - 1)); onChange([v, hi]); }}
            style={{ ...numStyle, paddingLeft: 20 }} />
        </div>
      </div>
      <div style={{ color: "var(--text-3)", marginTop: 20, fontWeight: 700 }}>—</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Max</div>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", fontSize: 13 }}>$</span>
          <input type="number" min={floor} max={cap} value={hi}
            onChange={e => { const v = Math.min(cap, Math.max(parseInt(e.target.value) || cap, lo + 1)); onChange([lo, v]); }}
            style={{ ...numStyle, paddingLeft: 20 }} />
        </div>
      </div>
    </div>
  );
}

export function FilterSidebar({ priceRange = [0, 500], onPriceChange, priceCap = 100, priceFloor = 0, showInStockOnly = false, onStockToggle, showOnSaleOnly = false, onSaleToggle, resetFilters }) {
  const [showMore, setShowMore] = useState(false);
  const activeCount = (showInStockOnly ? 1 : 0) + (showOnSaleOnly ? 1 : 0) + (priceRange[0] > priceFloor || priceRange[1] < priceCap ? 1 : 0);

  return (
    <div style={{ width: 272, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", margin: 0, letterSpacing: "-0.01em" }}>Filters</h3>
          {activeCount > 0 && (
            <span style={{ background: "var(--primary)", color: "#fff", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 999, boxShadow: "var(--shadow-primary)" }}>
              {activeCount}
            </span>
          )}
        </div>
        <button onClick={resetFilters} style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)", padding: "4px 8px", borderRadius: 6, transition: "background 0.12s" }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--primary-soft)"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}>
          Reset all
        </button>
      </div>

      {/* Price range */}
      <div style={{ background: "var(--surface)", borderRadius: 14, padding: "14px 14px 12px", border: "1px solid var(--line)" }}>
        <label style={{ fontSize: 11, fontWeight: 800, color: "var(--text-2)", display: "block", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Price Range</label>
        <PriceRangeInput value={priceRange} onChange={onPriceChange} cap={priceCap} floor={priceFloor} />
      </div>

      {/* In stock toggle */}
      <ToggleRow label="In Stock Only" checked={showInStockOnly} onChange={onStockToggle} badge={showInStockOnly ? "ON" : null} badgeTone="success" />

      {/* More filters */}
      <button
        onClick={() => setShowMore(v => !v)}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "1.5px dashed var(--line)", borderRadius: 12, padding: "9px 13px", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--text-3)", transition: "all 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; e.currentTarget.style.background = "var(--primary-soft)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.background = "none"; }}
      >
        <IconC name="sliders" size={14} />
        {showMore ? "Fewer filters" : "More filters"}
        {showOnSaleOnly && (
          <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 800, background: "var(--red-100)", color: "var(--red-700)", padding: "2px 7px", borderRadius: 999 }}>+1</span>
        )}
        <IconC name="chevD" size={12} style={{ marginLeft: "auto", transform: showMore ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {showMore && (
        <div style={{ animation: "slideInUp 0.18s var(--ease)" }}>
          <ToggleRow label="On Sale" checked={showOnSaleOnly} onChange={onSaleToggle} badge={showOnSaleOnly ? "ON" : null} badgeTone="critical" />
        </div>
      )}
    </div>
  );
}

function ToggleRow({ label, checked, onChange, badge, badgeTone }) {
  const toneColors = {
    success: { bg: "var(--green-100)", color: "var(--green-700)" },
    critical: { bg: "var(--red-100)", color: "var(--red-700)" },
  };
  const tc = toneColors[badgeTone] || {};
  return (
    <div style={{ background: "var(--surface)", borderRadius: 14, padding: "4px 13px", border: "1px solid var(--line)" }}>
      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 0" }}>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
          style={{ width: 18, height: 18, cursor: "pointer", accentColor: "var(--primary)", borderRadius: 5, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", userSelect: "none", flex: 1 }}>{label}</span>
        {badge && (
          <span style={{ fontSize: 10, fontWeight: 800, background: tc.bg, color: tc.color, padding: "2px 8px", borderRadius: 999 }}>{badge}</span>
        )}
      </label>
    </div>
  );
}

const TAG_STYLES = {
  popular: { bg: "#fef3c7", color: "#92400e", icon: "star",  label: "Popular" },
  organic: { bg: "#d1fae5", color: "#065f46", icon: "leaf",  label: "Organic" },
  sale:    { bg: "#fee2e2", color: "#991b1b", icon: "tag",   label: "On Sale" },
  new:     { bg: "#ede9fe", color: "#5b21b6", icon: "zap",   label: "New"     },
};

export function ProductCardEnhanced({ product, inCart, disabled, stockState, onAdd, onAddQty, onRemoveQty, onClick, isSaved, onToggleSave, closedForOrder }) {
  const cat = G.catOf(product.cat);
  const hue = cat?.hue || 152;
  const price = parseFloat(product.price) || 0;
  const tagStyle = product.tag ? TAG_STYLES[product.tag] : null;

  return (
    <div
      className={`prod-card${disabled ? " out-of-stock" : ""}`}
      onClick={!disabled ? onClick : undefined}
    >
      {/* Image area */}
      <div className="prod-img-area" style={{ background: `hsl(${hue}, 45%, 92%)` }}>
        {product.image
          ? <img src={product.image} alt={product.name} loading="lazy" />
          : (
            <div className="prod-img-placeholder" style={{ color: `hsl(${hue}, 50%, 62%)` }}>
              <IconC name="cart" size={44} stroke={1.2} />
            </div>
          )
        }

        {/* Stock badge */}
        {stockState !== "ok" && (
          <div style={{ position: "absolute", top: 9, left: 9, background: stockState === "low" ? "var(--amber-500)" : "var(--red-500)", color: "#fff", padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 800, boxShadow: "0 2px 6px rgba(0,0,0,0.18)", zIndex: 4 }}>
            {stockState === "low" ? "Low stock" : "Out of stock"}
          </div>
        )}

        {/* Tag badge */}
        {tagStyle && (
          <div style={{ position: "absolute", top: 9, right: 9, background: tagStyle.bg, color: tagStyle.color, padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4, zIndex: 4 }}>
            <IconC name={tagStyle.icon} size={9} fill="current" />{tagStyle.label}
          </div>
        )}

        {/* Heart / save button */}
        {onToggleSave && (
          <button
            onClick={e => { e.stopPropagation(); onToggleSave(product.id); }}
            aria-label={isSaved ? 'Remove from saved' : 'Save item'}
            title={isSaved ? 'Remove from saved' : 'Save for later'}
            style={{ position: 'absolute', bottom: 8, left: 8, width: 28, height: 28, borderRadius: 8, border: 'none', background: isSaved ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.88)', color: isSaved ? 'var(--red-500)' : 'var(--text-3)', cursor: 'pointer', display: 'grid', placeItems: 'center', zIndex: 4, backdropFilter: 'blur(4px)', transition: 'all 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.color = 'var(--red-500)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = isSaved ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.88)'; e.currentTarget.style.color = isSaved ? 'var(--red-500)' : 'var(--text-3)'; }}
          >
            <IconC name="heart" size={14} />
          </button>
        )}

      </div>

      {/* Card body */}
      <div className="prod-body">
        <div className="prod-name">{product.name}</div>
        {product.unit && <div className="prod-unit">{product.unit}</div>}

        <div className="prod-price-row" style={closedForOrder && inCart === 0 && !disabled ? { flexDirection: "column", alignItems: "stretch", gap: 8 } : undefined}>
          <span className="prod-price">${price.toFixed(2)}</span>

          {inCart > 0 ? (
            <div className="prod-stepper" onClick={e => e.stopPropagation()}>
              <button className="prod-stepper-btn" onClick={() => onRemoveQty && onRemoveQty()}>−</button>
              <span className="prod-stepper-count">{inCart}</span>
              <button className="prod-stepper-btn" onClick={() => onAddQty && onAddQty()}>+</button>
            </div>
          ) : disabled ? null : closedForOrder ? (
            <button
              onClick={e => { e.stopPropagation(); onAdd(); }}
              aria-label={`Pre-order ${product.name} for tomorrow`}
              style={{ width: "100%", padding: "7px 8px", borderRadius: 9, border: "1.5px solid var(--primary)", background: "transparent", color: "var(--primary)", cursor: "pointer", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, lineHeight: 1.2, transition: "all 0.16s var(--spring)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.color = "var(--primary-ink)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--primary)"; }}
            >Pre-order for tomorrow</button>
          ) : (
            <button
              onClick={e => { e.stopPropagation(); onAdd(); }}
              style={{ width: 32, height: 32, borderRadius: 9, border: "1.5px solid var(--line)", background: "transparent", color: "var(--text-2)", cursor: "pointer", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)", fontSize: 19, fontWeight: 400, transition: "all 0.16s var(--spring)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.color = "var(--primary-ink)"; e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "var(--shadow-primary)"; e.currentTarget.style.transform = "scale(1.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
            >+</button>
          )}
        </div>
      </div>
    </div>
  );
}

const SUB_PREFS = [
  { value: "none",    label: "No substitutions",   desc: "Cancel item if unavailable" },
  { value: "similar", label: "Allow similar brand", desc: "Same product, different brand if needed" },
  { value: "any",     label: "Allow any substitute",desc: "Shopper picks best available option" },
];

export function ProductDetailModal({ product, inCart, onClose, onAdd, onUpdateCart, onNotify }) {
  const [qty, setQty] = useState(inCart > 0 ? inCart : 1);
  const [subPref, setSubPref] = useState("none");
  const [toast, setToast] = useState(null);
  const [notified, setNotified] = useState(false);
  const toastTimerRef = useRef(null);

  const cat = G.catOf(product.cat);
  const hue = cat?.hue || 152;
  const stock = product.stock || 0;
  const stockState = G.stockState(stock, product.par || 10);
  const price = parseFloat(product.price) || 0;
  const tagStyle = product.tag ? TAG_STYLES[product.tag] : null;

  useEffect(() => { if (inCart > 0) setQty(inCart); }, [inCart]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  const showToast = (msg, withUndo = false) => {
    clearTimeout(toastTimerRef.current);
    setToast({ msg, withUndo });
    toastTimerRef.current = setTimeout(() => setToast(null), 8000);
  };

  const handleAdd = () => {
    if (inCart > 0) {
      onUpdateCart(product.id, qty);
      showToast(`Cart updated — ${qty} × ${product.name}`, false);
    } else {
      for (let i = 0; i < qty; i++) onAdd();
      showToast(`Added to cart — ${qty} × ${product.name}`, true);
    }
  };

  const handleUndo = () => {
    onUpdateCart(product.id, 0);
    clearTimeout(toastTimerRef.current);
    setToast(null);
  };

  const handleNotify = () => {
    setNotified(true);
    onNotify?.(product.id);
    showToast("We'll email you when this is back in stock", false);
  };

  const stockColors = {
    out:  { bg: "var(--red-100)",   color: "var(--red-500)",   dot: "var(--red-500)" },
    low:  { bg: "var(--amber-100)", color: "var(--amber-600)", dot: "var(--amber-500)" },
    ok:   { bg: "var(--green-100)", color: "var(--green-600)", dot: "var(--green-500)" },
  };
  const sc = stockColors[stockState] || stockColors.ok;

  const stockMicrocopy = stockState === "out"
    ? "Out of stock — we'll let you know when it's back."
    : stockState === "low"
      ? `Only ${stock} left — add now to avoid missing out.`
      : null;

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(6px)" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "var(--surface)", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 600, maxHeight: "94vh", overflowY: "auto", boxShadow: "var(--shadow-xl)", animation: "slideInUp 0.25s var(--spring)", display: "flex", flexDirection: "column" }}
      >
        {/* Hero image */}
        <div style={{ position: "relative", background: `linear-gradient(135deg, hsl(${hue},50%,90%) 0%, hsl(${hue},55%,85%) 100%)`, height: 220, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "24px 24px 0 0", flexShrink: 0, overflow: "hidden" }}>
          {product.image
            ? <img src={product.image} alt={product.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ color: `hsl(${hue},45%,62%)` }}><IconC name="cart" size={80} stroke={1.2} /></div>
          }
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: 999, background: "rgba(0,0,0,0.28)", border: "none", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center", backdropFilter: "blur(4px)", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.45)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.28)"}
          >
            <IconC name="x" size={18} />
          </button>
          {tagStyle && (
            <div style={{ position: "absolute", top: 14, left: 14, background: tagStyle.bg, color: tagStyle.color, padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 5 }}>
              <IconC name={tagStyle.icon} size={10} />{tagStyle.label}
            </div>
          )}
        </div>

        {/* Undo toast */}
        {toast && (
          <div
            role="status"
            aria-live="assertive"
            aria-atomic="true"
            style={{ margin: "12px 26px 0", padding: "10px 14px", background: "var(--text)", color: "#fff", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, fontSize: 13, flexShrink: 0 }}
          >
            <span style={{ flex: 1 }}>{toast.msg}</span>
            {toast.withUndo && (
              <button
                onClick={handleUndo}
                style={{ background: "none", border: "none", color: "#6ee7b7", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-sans)", padding: 0, flexShrink: 0 }}
              >
                Undo
              </button>
            )}
          </div>
        )}

        <div style={{ padding: "20px 26px 32px", display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Category chip */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `hsl(${hue},60%,93%)`, color: `hsl(${hue},55%,34%)`, padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 10, alignSelf: "flex-start" }}>
            <div style={{ width: 7, height: 7, borderRadius: 999, background: `hsl(${hue},60%,42%)` }} />
            {cat?.name}
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", margin: "0 0 4px", lineHeight: 1.2, letterSpacing: "-0.02em" }}>{product.name}</h2>
          {product.brand && <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 12px" }}>{product.brand}</p>}

          {/* Price + stock badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 30, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.03em" }}>${price.toFixed(2)}</span>
            <span style={{ fontSize: 13, color: "var(--text-3)" }}>per {product.unit}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: sc.color, background: sc.bg, padding: "4px 10px", borderRadius: 999 }}>
              <div style={{ width: 6, height: 6, borderRadius: 999, background: sc.dot }} />
              {stockState === "out" ? "Out of stock" : stockState === "low" ? `Only ${stock} left` : "In stock"}
            </div>
          </div>

          {/* Low/out microcopy */}
          {stockMicrocopy && (
            <div style={{ marginBottom: 14, padding: "9px 13px", background: stockState === "out" ? "var(--red-100)" : "var(--amber-100)", borderRadius: 10, fontSize: 13, color: stockState === "out" ? "#991b1b" : "#92400e", fontWeight: 600, border: `1px solid ${stockState === "out" ? "#fecaca" : "#fde68a"}` }}>
              {stockMicrocopy}
            </div>
          )}

          {product.description && (
            <p style={{ fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.65, marginBottom: 20, padding: "13px 15px", background: "var(--surface-2)", borderRadius: 12, border: "1px solid var(--line)" }}>
              {product.description}
            </p>
          )}

          <div style={{ height: 1, background: "var(--line)", marginBottom: 20 }} />

          {stockState === "out" ? (
            /* Out of stock: Notify Me */
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={handleNotify}
                disabled={notified}
                style={{ width: "100%", height: 50, borderRadius: 14, border: `2px solid ${notified ? "var(--green-500)" : "var(--primary)"}`, background: notified ? "var(--green-100)" : "transparent", color: notified ? "#166534" : "var(--primary)", fontWeight: 800, fontSize: 15, cursor: notified ? "default" : "pointer", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.18s" }}
              >
                <IconC name="bell" size={18} />
                {notified ? "You'll be notified when it's back" : "Notify me when available"}
              </button>
              <p style={{ fontSize: 12, color: "var(--text-3)", textAlign: "center", margin: 0 }}>
                In the meantime, try a similar item below
              </p>
            </div>
          ) : (
            <>
              {/* Qty stepper + Add button */}
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
                <div
                  role="group"
                  aria-label="Quantity"
                  style={{ display: "flex", alignItems: "center", background: "var(--surface-2)", borderRadius: 14, overflow: "hidden", border: "1.5px solid var(--line)", flexShrink: 0 }}
                >
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    style={{ width: 44, height: 48, border: "none", background: "transparent", color: "var(--text)", fontWeight: 700, fontSize: 20, cursor: "pointer", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)", transition: "background 0.12s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--line)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >−</button>
                  <span aria-label={`Quantity: ${qty}`} style={{ minWidth: 36, textAlign: "center", fontWeight: 900, fontSize: 17, color: "var(--text)", letterSpacing: "-0.02em" }}>{qty}</span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    aria-label="Increase quantity"
                    style={{ width: 44, height: 48, border: "none", background: "transparent", color: "var(--text)", fontWeight: 700, fontSize: 20, cursor: "pointer", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)", transition: "background 0.12s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--line)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >+</button>
                </div>
                <button
                  onClick={handleAdd}
                  style={{ flex: 1, height: 50, borderRadius: 14, border: "none", background: "var(--primary)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.18s var(--spring)", boxShadow: "var(--shadow-primary)", letterSpacing: "-0.01em" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-primary-lg)"; e.currentTarget.style.background = "var(--primary-hover)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow-primary)"; e.currentTarget.style.background = "var(--primary)"; }}
                >
                  {inCart > 0 ? `Update Cart (${qty}) · $${(price * qty).toFixed(2)}` : `Add ${qty} to Cart · $${(price * qty).toFixed(2)}`}
                </button>
              </div>

              {/* Substitution preference */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                  Substitution preference
                </div>
                <div role="radiogroup" aria-label="Substitution preference" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function CustomerBrowse({ shopId, onAddToCart, onUpdateCart, cartItems, onChangeShop, initialCat, savedItems, onToggleSave, onSelectProduct }) {
  const [cat, setCat] = useState(initialCat || "all");
  const [sort, setSort] = useState("popularity");
  // null = untouched → [0, priceCap]. The cap adapts to the catalog so a
  // default range never silently hides products priced above a hardcoded max.
  const [priceRange, setPriceRange] = useState(null);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [showOnSaleOnly, setShowOnSaleOnly] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [dataVersion, setDataVersion] = useState(() => G.PRODUCTS?.length > 0 ? 1 : 0);
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 100 });

  useEffect(() => {
    if (initialCat) setCat(initialCat);
  }, [initialCat]);

  useEffect(() => {
    if (G.PRODUCTS?.length > 0) setDataVersion(n => n > 0 ? n : 1);
    const handler = () => setDataVersion(n => n + 1);
    window.addEventListener("dataLoaded", handler);
    return () => window.removeEventListener("dataLoaded", handler);
  }, []);

  // Price bounds come from the backend for the current category subset,
  // rather than a hardcoded $0–$100 range — see GET /api/products/price-range.
  useEffect(() => {
    const params = new URLSearchParams();
    if (cat !== "all") params.set("categoryId", cat);
    const t = setTimeout(() => {
      fetch(`${API_BASE}/products/price-range?${params.toString()}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data && typeof data.min === "number" && typeof data.max === "number") {
            setPriceBounds({ min: Math.floor(data.min), max: Math.max(Math.ceil(data.max), Math.floor(data.min) + 1) });
          }
        })
        .catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [cat]);

  const priceFloor = priceBounds.min;
  const priceCap = priceBounds.max;
  const effectiveRange = priceRange || [priceFloor, priceCap];

  const products = useMemo(() => {
    let p = G.productsByCat(cat).map(x => ({ ...x, stock: G.shopStock(x.id, shopId) }));
    if (showInStockOnly) p = p.filter(x => G.stockState(x.stock) !== "out");
    p = p.filter(x => x.price >= effectiveRange[0] && x.price <= effectiveRange[1]);
    if (sort === "price-low") p.sort((a, b) => a.price - b.price);
    if (sort === "price-high") p.sort((a, b) => b.price - a.price);
    if (sort === "name") p.sort((a, b) => a.name.localeCompare(b.name));
    return p;
  }, [cat, sort, shopId, priceRange, showInStockOnly, dataVersion, priceFloor, priceCap]);

  const currentCat = cat === "all" ? { name: "All Products", hue: 152 } : G.catOf(cat);
  const currentShop = G.SHOPS.find(s => s.id === shopId);
  const shopClosed = currentShop ? G.isShopOpen(currentShop) === false : false;
  const reopenLabel = shopClosed ? G.openingTimeLabel(currentShop) : null;
  const resetFilters = () => { setPriceRange(null); setShowInStockOnly(false); setShowOnSaleOnly(false); };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>

      {/* ── Category pills + sort/filter ── */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)", position: "sticky", top: 62, zIndex: 30, padding: "10px 16px" }}>
        <div style={{ maxWidth: 1600, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div className="cat-strip" style={{ display: "flex", gap: 8, overflowX: "auto", flex: 1, minWidth: 0 }}>
            <button
              className={`cat-pill${cat === "all" ? " active" : ""}`}
              onClick={() => setCat("all")}
            >All</button>
            {G.CATEGORIES.map(c => (
              <button
                key={c.id}
                className={`cat-pill${cat === c.id ? " active" : ""}`}
                onClick={() => setCat(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {/* Sort */}
            <div className="hideOnMobile" style={{ position: "relative" }}>
              <select value={sort} onChange={e => setSort(e.target.value)}
                style={{ padding: "9px 32px 9px 13px", borderRadius: 999, border: "1.5px solid var(--line)", background: "var(--bg)", color: "var(--text)", fontSize: 13, fontFamily: "var(--font-sans)", appearance: "none", cursor: "pointer", outline: "none", fontWeight: 600 }}>
                <option value="popularity">Popular</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="name">A–Z</option>
              </select>
              <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-3)" }}><IconC name="chevD" size={13} /></span>
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFiltersModal(!showFiltersModal)}
              style={{ padding: "9px 16px", borderRadius: 999, border: `1.5px solid ${showFiltersModal ? "var(--primary)" : "var(--line)"}`, background: showFiltersModal ? "var(--primary)" : "transparent", color: showFiltersModal ? "var(--primary-ink)" : "var(--text-2)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s", whiteSpace: "nowrap" }}
            >
              <IconC name="sliders" size={14} />Filters
            </button>
          </div>
        </div>
      </div>

      {/* ── Store closed banner ── */}
      {shopClosed && (
        <div style={{ background: "var(--amber-100)", borderBottom: "1px solid #fde68a", color: "#92400e", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, fontWeight: 600, textAlign: "center", flexWrap: "wrap" }}>
          <IconC name="clock" size={15} style={{ flexShrink: 0 }} />
          <span>
            {currentShop?.name || "This store"} is closed right now — orders placed now will be fulfilled when we reopen{reopenLabel ? ` at ${reopenLabel}` : ""}.
          </span>
        </div>
      )}

      {/* ── Category hero strip ── */}
      {currentCat.name !== "All Products" && (
        <div style={{ background: `linear-gradient(135deg, hsl(${currentCat.hue},50%,28%) 0%, hsl(${currentCat.hue},45%,36%) 100%)`, color: "#fff", padding: "16px 20px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -10, top: -10, opacity: 0.1, color: "#fff", pointerEvents: "none" }}><IconC name="cart" size={90} stroke={1} /></div>
          <div style={{ maxWidth: 1600, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, position: "relative", zIndex: 1 }}>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em" }}>{currentCat.name}</p>
              {currentCat.blurb && <p style={{ margin: 0, fontSize: 12.5, opacity: 0.75 }}>{currentCat.blurb}</p>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.15)", padding: "5px 13px", borderRadius: 999, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", backdropFilter: "blur(4px)" }}>
              <IconC name="box" size={13} />
              {products.length} item{products.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      )}

      {/* ── Main layout ── */}
      <div style={{ flex: 1, display: "flex", gap: 24, padding: "20px 20px", maxWidth: 1600, margin: "0 auto", width: "100%" }}>

        {/* Filter sidebar */}
        <div className="sidebar-desktop" style={{ minWidth: 272, paddingTop: 4 }}>
          <div style={{ position: "sticky", top: 120, display: "flex", flexDirection: "column", gap: 12 }}>
            <FilterSidebar
              priceRange={effectiveRange} onPriceChange={setPriceRange} priceCap={priceCap} priceFloor={priceFloor}
              showInStockOnly={showInStockOnly} onStockToggle={setShowInStockOnly}
              showOnSaleOnly={showOnSaleOnly} onSaleToggle={setShowOnSaleOnly}
              resetFilters={resetFilters}
            />
            {currentShop && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 16 }}>
                <div style={{ display: "flex", align: "center", gap: 8, marginBottom: 10 }}>
                  <IconC name="pin" size={15} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", lineHeight: 1.3 }}>{currentShop.name}</div>
                </div>
                <button onClick={onChangeShop}
                  style={{ width: "100%", padding: "9px", borderRadius: 10, border: "1.5px solid var(--line)", background: "transparent", color: "var(--text-2)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--text)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; }}>
                  Change Store
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Product grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 600 }}>
              {products.length} product{products.length !== 1 ? "s" : ""}
            </span>
          </div>

          {products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "72px 20px", color: "var(--text-3)", background: "var(--surface)", borderRadius: 20, border: "1px solid var(--line)" }}>
              <IconC name="search" size={40} style={{ opacity: 0.22, marginBottom: 14 }} />
              <p style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px", color: "var(--text-2)" }}>No products found</p>
              <p style={{ fontSize: 13, margin: 0 }}>Try adjusting your filters or search</p>
            </div>
          ) : (
            <div className="prod-browse-grid">
              {products.map(p => {
                const inCart = cartItems[p.id] || 0;
                const ss = G.stockState(p.stock);
                return (
                  <ProductCardEnhanced
                    key={p.id}
                    product={p}
                    inCart={inCart}
                    disabled={ss === "out"}
                    stockState={ss}
                    onAdd={() => onAddToCart(p.id)}
                    onAddQty={() => onAddToCart(p.id)}
                    onRemoveQty={() => onUpdateCart && onUpdateCart(p.id, Math.max(0, inCart - 1))}
                    onClick={() => onSelectProduct && onSelectProduct(p.id)}
                    isSaved={savedItems?.has(p.id)}
                    onToggleSave={onToggleSave}
                    closedForOrder={shopClosed}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filters sheet */}
      {showFiltersModal && (
        <div
          style={{ position: "fixed", bottom: 0, left: 0, right: 0, top: 0, background: "rgba(0,0,0,0.45)", zIndex: 40, display: "flex", alignItems: "flex-end" }}
          className="mobile-filter-modal"
          onClick={() => setShowFiltersModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: "100%", background: "var(--surface)", borderRadius: "20px 20px 0 0", padding: "20px 18px 32px", maxHeight: "82vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, animation: "slideInUp 0.22s var(--ease)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>Filters</h3>
              <button onClick={() => setShowFiltersModal(false)}
                style={{ width: 36, height: 36, borderRadius: 999, border: "none", background: "var(--surface-2)", color: "var(--text-2)", cursor: "pointer", display: "grid", placeItems: "center", fontSize: 18 }}>
                <IconC name="x" size={18} />
              </button>
            </div>
            <FilterSidebar
              priceRange={effectiveRange} onPriceChange={setPriceRange} priceCap={priceCap} priceFloor={priceFloor}
              showInStockOnly={showInStockOnly} onStockToggle={setShowInStockOnly}
              showOnSaleOnly={showOnSaleOnly} onSaleToggle={setShowOnSaleOnly}
              resetFilters={resetFilters}
            />
            <BtnC full onClick={() => setShowFiltersModal(false)} style={{ marginTop: 4 }}>
              Apply Filters
            </BtnC>
          </div>
        </div>
      )}
    </div>
  );
}
