import { useState, useEffect, useMemo } from 'react';
import { G } from '../globals.js';
import { IconC } from './icons.jsx';
import { BtnC } from './ui.jsx';

export function PriceRangeInput({ value, onChange }) {
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
          <input type="number" min={0} max={100} value={lo}
            onChange={e => { const v = Math.max(0, Math.min(parseInt(e.target.value) || 0, hi - 1)); onChange([v, hi]); }}
            style={{ ...numStyle, paddingLeft: 20 }} />
        </div>
      </div>
      <div style={{ color: "var(--text-3)", marginTop: 20, fontWeight: 700 }}>—</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Max</div>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", fontSize: 13 }}>$</span>
          <input type="number" min={0} max={100} value={hi}
            onChange={e => { const v = Math.min(100, Math.max(parseInt(e.target.value) || 0, lo + 1)); onChange([lo, v]); }}
            style={{ ...numStyle, paddingLeft: 20 }} />
        </div>
      </div>
    </div>
  );
}

export function FilterSidebar({ priceRange = [0, 500], onPriceChange, showInStockOnly = false, onStockToggle, showOnSaleOnly = false, onSaleToggle, resetFilters }) {
  const [showMore, setShowMore] = useState(false);
  const activeCount = (showInStockOnly ? 1 : 0) + (showOnSaleOnly ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 100 ? 1 : 0);

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
        <PriceRangeInput value={priceRange} onChange={onPriceChange} />
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

export function ProductCardEnhanced({ product, inCart, disabled, stockState, onAdd, onAddQty, onRemoveQty, onClick, isSaved, onToggleSave }) {
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

        {/* Floating add button */}
        {!disabled && inCart === 0 && (
          <button
            className="prod-add-btn"
            onClick={e => { e.stopPropagation(); onAdd(); }}
            aria-label={`Add ${product.name} to cart`}
          >
            +
          </button>
        )}
      </div>

      {/* Card body */}
      <div className="prod-body">
        <div className="prod-name">{product.name}</div>
        {product.unit && <div className="prod-unit">{product.unit}</div>}

        <div className="prod-price-row">
          <span className="prod-price">${price.toFixed(2)}</span>

          {inCart > 0 ? (
            <div className="prod-stepper" onClick={e => e.stopPropagation()}>
              <button className="prod-stepper-btn" onClick={() => onRemoveQty && onRemoveQty()}>−</button>
              <span className="prod-stepper-count">{inCart}</span>
              <button className="prod-stepper-btn" onClick={() => onAddQty && onAddQty()}>+</button>
            </div>
          ) : (
            !disabled && (
              <button
                onClick={e => { e.stopPropagation(); onAdd(); }}
                style={{ width: 32, height: 32, borderRadius: 9, border: "1.5px solid var(--line)", background: "transparent", color: "var(--text-2)", cursor: "pointer", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)", fontSize: 19, fontWeight: 400, transition: "all 0.16s var(--spring)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.color = "var(--primary-ink)"; e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "var(--shadow-primary)"; e.currentTarget.style.transform = "scale(1.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
              >+</button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductDetailModal({ product, inCart, onClose, onAdd, onUpdateCart }) {
  const [qty, setQty] = useState(inCart > 0 ? inCart : 1);
  const cat = G.catOf(product.cat);
  const hue = cat?.hue || 152;
  const stock = product.stock || 0;
  const stockState = G.stockState(stock, product.par || 10);
  const stockLabel = stockState === "out" ? "Out of stock" : stockState === "low" ? "Low stock" : "In stock";
  const stockColor = stockState === "out" ? "var(--red-500)" : stockState === "low" ? "var(--amber-500)" : "var(--green-600)";
  const price = parseFloat(product.price) || 0;
  const tagStyle = product.tag ? TAG_STYLES[product.tag] : null;

  useEffect(() => { if (inCart > 0) setQty(inCart); }, [inCart]);

  const handleAdd = () => {
    if (inCart > 0) { onUpdateCart(product.id, qty); }
    else { for (let i = 0; i < qty; i++) onAdd(); }
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(6px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--surface)", borderRadius: 24, width: "100%", maxWidth: 540, maxHeight: "92vh", overflowY: "auto", boxShadow: "var(--shadow-xl)", animation: "scaleIn 0.2s var(--spring)" }}>
        {/* Image */}
        <div style={{ position: "relative", background: `linear-gradient(135deg, hsl(${hue},50%,90%) 0%, hsl(${hue},55%,85%) 100%)`, height: 260, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "24px 24px 0 0", flexShrink: 0, overflow: "hidden" }}>
          {product.image
            ? <img src={product.image} alt={product.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ color: `hsl(${hue},45%,62%)` }}><IconC name="cart" size={80} stroke={1.2} /></div>
          }
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: 999, background: "rgba(0,0,0,0.28)", border: "none", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center", backdropFilter: "blur(4px)", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.45)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.28)"}>
            <IconC name="x" size={18} />
          </button>
          {tagStyle && (
            <div style={{ position: "absolute", top: 14, left: 14, background: tagStyle.bg, color: tagStyle.color, padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 5 }}>
              <IconC name={tagStyle.icon} size={10} />{tagStyle.label}
            </div>
          )}
        </div>

        <div style={{ padding: "24px 26px 30px" }}>
          {/* Category chip */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `hsl(${hue},60%,93%)`, color: `hsl(${hue},55%,34%)`, padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
            <div style={{ width: 7, height: 7, borderRadius: 999, background: `hsl(${hue},60%,42%)` }} />
            {cat?.name}
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 900, color: "var(--text)", margin: "0 0 4px", lineHeight: 1.2, letterSpacing: "-0.02em" }}>{product.name}</h2>
          {product.brand && <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 14px" }}>{product.brand}</p>}

          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 30, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.03em" }}>${price.toFixed(2)}</span>
            <span style={{ fontSize: 13, color: "var(--text-3)" }}>per {product.unit}</span>
            {product.size && <span style={{ fontSize: 12, background: "var(--surface-2)", padding: "3px 9px", borderRadius: 7, color: "var(--text-2)", fontWeight: 600 }}>{product.size}</span>}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: stockColor, background: stockState === "ok" ? "var(--green-100)" : stockState === "low" ? "var(--amber-100)" : "var(--red-100)", padding: "4px 10px", borderRadius: 999 }}>
              <div style={{ width: 6, height: 6, borderRadius: 999, background: stockColor }} />
              {stockLabel}
            </div>
            {product.weight && <span style={{ fontSize: 12, color: "var(--text-3)", alignSelf: "center" }}>· {product.weight}</span>}
          </div>

          {product.description && (
            <p style={{ fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.65, marginBottom: 22, padding: "13px 15px", background: "var(--surface-2)", borderRadius: 12, border: "1px solid var(--line)" }}>
              {product.description}
            </p>
          )}

          <div style={{ height: 1, background: "var(--line)", marginBottom: 22 }} />

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {/* Qty stepper */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, background: "var(--surface-2)", borderRadius: 14, overflow: "hidden", border: "1.5px solid var(--line)", flexShrink: 0 }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={stockState === "out"}
                style={{ width: 40, height: 44, border: "none", background: "transparent", color: "var(--text)", fontWeight: 700, fontSize: 19, cursor: "pointer", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)", transition: "background 0.12s" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--line)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>−</button>
              <span style={{ minWidth: 34, textAlign: "center", fontWeight: 900, fontSize: 17, color: "var(--text)", letterSpacing: "-0.02em" }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} disabled={stockState === "out"}
                style={{ width: 40, height: 44, border: "none", background: "transparent", color: "var(--text)", fontWeight: 700, fontSize: 19, cursor: "pointer", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)", transition: "background 0.12s" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--line)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>+</button>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAdd}
              disabled={stockState === "out"}
              style={{ flex: 1, height: 50, borderRadius: 14, border: "none", background: stockState === "out" ? "var(--surface-2)" : "var(--primary)", color: stockState === "out" ? "var(--text-3)" : "#fff", fontWeight: 800, fontSize: 15, cursor: stockState === "out" ? "not-allowed" : "pointer", fontFamily: "var(--font-sans)", transition: "all 0.18s var(--spring)", boxShadow: stockState === "out" ? "none" : "var(--shadow-primary)", letterSpacing: "-0.01em" }}
              onMouseEnter={e => { if (stockState !== "out") { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-primary-lg)"; e.currentTarget.style.background = "var(--primary-hover)"; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = stockState === "out" ? "none" : "var(--shadow-primary)"; e.currentTarget.style.background = stockState === "out" ? "var(--surface-2)" : "var(--primary)"; }}
            >
              {stockState === "out" ? "Out of Stock" : inCart > 0 ? `Update Cart (${qty})` : `Add ${qty} to Cart · $${(price * qty).toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CustomerBrowse({ shopId, onAddToCart, onUpdateCart, cartItems, onChangeShop, initialCat, savedItems, onToggleSave }) {
  const [cat, setCat] = useState(initialCat || "all");
  const [sort, setSort] = useState("popularity");
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [showOnSaleOnly, setShowOnSaleOnly] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dataVersion, setDataVersion] = useState(() => G.PRODUCTS?.length > 0 ? 1 : 0);

  useEffect(() => {
    if (initialCat) setCat(initialCat);
  }, [initialCat]);

  useEffect(() => {
    if (G.PRODUCTS?.length > 0) setDataVersion(n => n > 0 ? n : 1);
    const handler = () => setDataVersion(n => n + 1);
    window.addEventListener("dataLoaded", handler);
    return () => window.removeEventListener("dataLoaded", handler);
  }, []);

  const products = useMemo(() => {
    let p = G.productsByCat(cat).map(x => ({ ...x, stock: G.shopStock(x.id, shopId) }));
    if (search) p = p.filter(x => x.name.toLowerCase().includes(search.toLowerCase()));
    if (showInStockOnly) p = p.filter(x => G.stockState(x.stock) !== "out");
    p = p.filter(x => x.price >= priceRange[0] && x.price <= priceRange[1]);
    if (sort === "price-low") p.sort((a, b) => a.price - b.price);
    if (sort === "price-high") p.sort((a, b) => b.price - a.price);
    if (sort === "name") p.sort((a, b) => a.name.localeCompare(b.name));
    return p;
  }, [cat, sort, search, shopId, priceRange, showInStockOnly, dataVersion]);

  const currentCat = cat === "all" ? { name: "All Products", hue: 152 } : G.catOf(cat);
  const currentShop = G.SHOPS.find(s => s.id === shopId);
  const resetFilters = () => { setPriceRange([0, 100]); setShowInStockOnly(false); setShowOnSaleOnly(false); setSearch(""); };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>

      {/* ── Toolbar ── */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)", padding: "10px 16px" }}>
        <div style={{ maxWidth: 1600, margin: "0 auto", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Back to store selector */}
          <button onClick={onChangeShop}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 13px", background: "var(--primary-soft)", borderRadius: 999, fontSize: 12.5, color: "var(--green-700)", fontWeight: 700, border: "1.5px solid var(--green-300)", cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.color = "var(--primary-ink)"; e.currentTarget.style.borderColor = "var(--primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--primary-soft)"; e.currentTarget.style.color = "var(--green-700)"; e.currentTarget.style.borderColor = "var(--green-300)"; }}>
            <IconC name="pin" size={13} stroke={2.5} />
            <span>{currentShop?.name || "Select Store"}</span>
            <IconC name="chevD" size={11} stroke={2.5} />
          </button>

          {/* Search */}
          <div style={{ flex: 1, minWidth: 180, position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }}><IconC name="search" size={15} /></span>
            <input
              aria-label="Search products"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              style={{ width: "100%", padding: "9px 13px 9px 36px", borderRadius: 999, border: "1.5px solid var(--line)", background: "var(--bg)", color: "var(--text)", fontSize: 13.5, outline: "none", fontFamily: "var(--font-sans)" }}
            />
          </div>

          {/* Sort */}
          <div className="hideOnMobile" style={{ position: "relative", flexShrink: 0 }}>
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
            style={{ padding: "9px 16px", borderRadius: 999, border: `1.5px solid ${showFiltersModal ? "var(--primary)" : "var(--line)"}`, background: showFiltersModal ? "var(--primary)" : "transparent", color: showFiltersModal ? "var(--primary-ink)" : "var(--text-2)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s", flexShrink: 0 }}
          >
            <IconC name="sliders" size={14} />Filters
          </button>
        </div>
      </div>

      {/* ── Category pills ── */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)", position: "sticky", top: 62, zIndex: 30, padding: "10px 16px", display: "flex", gap: 8, overflowX: "auto" }}>
        <button
          className={`cat-pill${cat === "all" ? " active" : ""}`}
          onClick={() => { setCat("all"); setSearch(""); }}
        >All</button>
        {G.CATEGORIES.map(c => (
          <button
            key={c.id}
            className={`cat-pill${cat === c.id ? " active" : ""}`}
            onClick={() => { setCat(c.id); setSearch(""); }}
          >
            {c.name}
          </button>
        ))}
      </div>

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
              priceRange={priceRange} onPriceChange={setPriceRange}
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(178px, 1fr))", gap: 14 }}>
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
                    onClick={() => setSelectedProduct(p)}
                    isSaved={savedItems?.has(p.id)}
                    onToggleSave={onToggleSave}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Product detail modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          inCart={cartItems[selectedProduct.id] || 0}
          onClose={() => setSelectedProduct(null)}
          onAdd={() => onAddToCart(selectedProduct.id)}
          onUpdateCart={onUpdateCart}
        />
      )}

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
              priceRange={priceRange} onPriceChange={setPriceRange}
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
