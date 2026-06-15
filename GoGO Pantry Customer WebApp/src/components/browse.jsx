import { useState, useEffect, useMemo } from 'react';
import { G } from '../globals.js';
import { IconC } from './icons.jsx';
import { BtnC } from './ui.jsx';

export function PriceRangeInput({ value, onChange }) {
  const [lo, hi] = value;
  const numStyle = { width: "100%", padding: "9px 10px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)", fontSize: 14, fontFamily: "var(--font-sans)", outline: "none", textAlign: "center", fontWeight: 600 };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4, fontWeight: 600 }}>MIN</div>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", fontSize: 13 }}>$</span>
          <input type="number" min={0} max={100} value={lo}
            onChange={e => { const v = Math.max(0, Math.min(parseInt(e.target.value) || 0, hi - 1)); onChange([v, hi]); }}
            style={{ ...numStyle, paddingLeft: 20 }} />
        </div>
      </div>
      <div style={{ color: "var(--text-3)", marginTop: 18, fontWeight: 700 }}>—</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4, fontWeight: 600 }}>MAX</div>
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
    <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0 }}>Filters</h3>
          {activeCount > 0 && <span style={{ background: "var(--primary)", color: "#fff", fontSize: 11, fontWeight: 800, padding: "2px 7px", borderRadius: 999 }}>{activeCount}</span>}
        </div>
        <button onClick={resetFilters} style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>Reset</button>
      </div>
      <div style={{ background: "var(--surface-2)", borderRadius: 12, padding: "14px 14px 10px" }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Price Range</label>
        <PriceRangeInput value={priceRange} onChange={onPriceChange} />
      </div>
      <div style={{ background: "var(--surface-2)", borderRadius: 12, padding: "4px 14px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 0" }}>
          <input type="checkbox" checked={showInStockOnly} onChange={e => onStockToggle(e.target.checked)} style={{ width: 18, height: 18, cursor: "pointer", accentColor: "var(--primary)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", userSelect: "none" }}>In Stock Only</span>
          {showInStockOnly && <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 800, background: "#d1fae5", color: "#065f46", padding: "2px 7px", borderRadius: 999 }}>ON</span>}
        </label>
      </div>
      <button onClick={() => setShowMore(v => !v)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "1px dashed var(--line)", borderRadius: 10, padding: "9px 14px", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--text-2)", transition: "all 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--text-2)"; }}>
        <span style={{ fontSize: 14 }}>{showMore ? "▲" : "▼"}</span>
        {showMore ? "Less filters" : "More filters"}
        {showOnSaleOnly && <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 800, background: "#fee2e2", color: "#991b1b", padding: "2px 7px", borderRadius: 999 }}>+1</span>}
      </button>
      {showMore && (
        <div style={{ background: "var(--surface-2)", borderRadius: 12, padding: "4px 14px", animation: "fadeIn 0.15s ease" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 0" }}>
            <input type="checkbox" checked={showOnSaleOnly} onChange={e => onSaleToggle(e.target.checked)} style={{ width: 18, height: 18, cursor: "pointer", accentColor: "var(--primary)" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", userSelect: "none" }}>🏷️ On Sale</span>
            {showOnSaleOnly && <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 800, background: "#fee2e2", color: "#991b1b", padding: "2px 7px", borderRadius: 999 }}>ON</span>}
          </label>
        </div>
      )}
    </div>
  );
}

export function ProductCardEnhanced({ product, inCart, disabled, stockState, onAdd, onAddQty, onRemoveQty, onClick }) {
  const categoryColor = G.catOf(product.cat);
  return (
    <div onClick={!disabled ? onClick : undefined} style={{ background: "var(--surface)", border: `2px solid ${disabled ? "var(--line)" : `oklch(0.6 0.08 ${categoryColor.hue})`}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", transition: "all 0.2s var(--ease)", opacity: disabled ? 0.65 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-4px)"; } }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
      <div style={{ position: "relative", paddingBottom: "100%", background: `oklch(0.92 0.07 ${categoryColor.hue})`, overflow: "hidden" }}>
        {product.image
          ? <img src={product.image} alt={product.name} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: "3rem" }}>🛒</div>
        }
        {stockState !== "ok" && (
          <div style={{ position: "absolute", top: 8, right: 8, background: stockState === "low" ? "var(--amber-500)" : "var(--red-500)", color: "#fff", padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
            {stockState === "low" ? "⚠️ Low" : "🚫 Out"}
          </div>
        )}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 14 }}>
        {(product.tag || product.isNew) && (
          <div style={{ display: "flex", gap: 5, marginBottom: 7, flexWrap: "wrap" }}>
            {product.tag === "popular" && <span style={{ fontSize: 10, fontWeight: 800, background: "#fef3c7", color: "#92400e", padding: "2px 7px", borderRadius: 999 }}>⭐ Popular</span>}
            {product.tag === "organic" && <span style={{ fontSize: 10, fontWeight: 800, background: "#d1fae5", color: "#065f46", padding: "2px 7px", borderRadius: 999 }}>🌿 Organic</span>}
            {product.tag === "sale" && <span style={{ fontSize: 10, fontWeight: 800, background: "#fee2e2", color: "#991b1b", padding: "2px 7px", borderRadius: 999 }}>🏷️ On Sale</span>}
            {product.tag === "new" && <span style={{ fontSize: 10, fontWeight: 800, background: "#ede9fe", color: "#5b21b6", padding: "2px 7px", borderRadius: 999 }}>✨ New</span>}
            {product.tag && !["popular","organic","sale","new"].includes(product.tag) && <span style={{ fontSize: 10, fontWeight: 700, background: "var(--surface-2)", color: "var(--text-2)", padding: "2px 7px", borderRadius: 999 }}>{product.tag}</span>}
          </div>
        )}
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", lineHeight: 1.3, marginBottom: 4, minHeight: "2.4em" }}>{product.name}</div>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 8 }}>{product.unit}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text)" }}>${(parseFloat(product.price) || 0).toFixed(2)}</span>
        </div>
        <div style={{ marginTop: "auto" }}>
          {inCart > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface-2)", borderRadius: 10, padding: "4px" }}>
              <button onClick={e => { e.stopPropagation(); onRemoveQty && onRemoveQty(); }} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "var(--surface)", color: "var(--text)", fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "var(--font-sans)", display: "grid", placeItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>−</button>
              <span style={{ flex: 1, textAlign: "center", fontWeight: 800, fontSize: 15, color: "var(--primary)" }}>{inCart}</span>
              <button onClick={e => { e.stopPropagation(); onAddQty && onAddQty(); }} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "var(--primary)", color: "var(--primary-ink)", fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "var(--font-sans)", display: "grid", placeItems: "center" }}>+</button>
            </div>
          ) : (
            <button onClick={e => { e.stopPropagation(); onAdd(); }} disabled={disabled} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: disabled ? "var(--line)" : "var(--primary)", color: disabled ? "var(--text-3)" : "#fff", fontWeight: 700, fontSize: 13, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "var(--font-sans)", transition: "filter 0.15s, transform 0.1s", outline: "none" }}
              onMouseEnter={e => { if (!disabled) { e.currentTarget.style.filter = "brightness(0.92)"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
              onMouseLeave={e => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "none"; }}>
              🛒 Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductDetailModal({ product, inCart, onClose, onAdd, onUpdateCart }) {
  const [qty, setQty] = useState(inCart > 0 ? inCart : 1);
  const cat = G.catOf(product.cat);
  const hue = cat.hue || 152;
  const stock = product.stock || 0;
  const stockState = G.stockState(stock, product.par || 10);
  const stockLabel = stockState === "out" ? "Out of stock" : stockState === "low" ? "Low stock" : "In stock";
  const stockColor = stockState === "out" ? "var(--red-500)" : stockState === "low" ? "var(--amber-500)" : "var(--green-600)";
  const price = parseFloat(product.price) || 0;

  useEffect(() => { if (inCart > 0) setQty(inCart); }, [inCart]);

  const handleAdd = () => {
    if (inCart > 0) { onUpdateCart(product.id, qty); }
    else { for (let i = 0; i < qty; i++) onAdd(); }
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--surface)", borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.28)" }}>
        <div style={{ position: "relative", background: `linear-gradient(135deg, oklch(0.9 0.09 ${hue}) 0%, oklch(0.85 0.12 ${hue}) 100%)`, height: 260, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "20px 20px 0 0", flexShrink: 0, overflow: "hidden" }}>
          {product.image
            ? <img src={product.image} alt={product.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontSize: "5rem" }}>🛒</span>
          }
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: 999, background: "rgba(0,0,0,0.25)", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", display: "grid", placeItems: "center", fontFamily: "var(--font-sans)" }}>×</button>
          {stockState !== "ok" && (
            <div style={{ position: "absolute", top: 14, left: 14, background: stockColor, color: "#fff", padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
              {stockState === "low" ? "⚠️ Low stock" : "🚫 Out of stock"}
            </div>
          )}
        </div>
        <div style={{ padding: "24px 24px 28px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `hsl(${hue},60%,94%)`, color: `hsl(${hue},55%,35%)`, padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: 999, background: `hsl(${hue},60%,42%)` }} />
            {cat.name}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", margin: "0 0 4px", lineHeight: 1.2 }}>{product.name}</h2>
          {product.brand && <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 12px" }}>{product.brand}</p>}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: "var(--text)" }}>${price.toFixed(2)}</span>
            <span style={{ fontSize: 13, color: "var(--text-3)" }}>per {product.unit}</span>
            {product.size && <span style={{ fontSize: 12, background: "var(--surface-2)", padding: "3px 8px", borderRadius: 6, color: "var(--text-2)" }}>{product.size}</span>}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: stockColor }}>
              <div style={{ width: 8, height: 8, borderRadius: 999, background: stockColor }} />
              {stockLabel}
            </div>
            {product.weight && <span style={{ fontSize: 12, color: "var(--text-3)" }}>· {product.weight}</span>}
          </div>
          {product.description && (
            <p style={{ fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 20, padding: "12px 14px", background: "var(--surface-2)", borderRadius: 10 }}>
              {product.description}
            </p>
          )}
          <div style={{ height: 1, background: "var(--line)", marginBottom: 20 }} />
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--surface-2)", borderRadius: 12, padding: "6px 8px" }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={stockState === "out"} style={{ width: 36, height: 36, borderRadius: 9, border: "none", background: "var(--surface)", color: "var(--text)", fontWeight: 700, fontSize: 18, cursor: "pointer", display: "grid", placeItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>−</button>
              <span style={{ minWidth: 28, textAlign: "center", fontWeight: 800, fontSize: 18, color: "var(--text)" }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} disabled={stockState === "out"} style={{ width: 36, height: 36, borderRadius: 9, border: "none", background: `hsl(${hue},60%,42%)`, color: "#fff", fontWeight: 700, fontSize: 18, cursor: "pointer", display: "grid", placeItems: "center" }}>+</button>
            </div>
            <button onClick={handleAdd} disabled={stockState === "out"} style={{ flex: 1, height: 50, borderRadius: 12, border: "none", background: stockState === "out" ? "var(--surface-2)" : `hsl(${hue},60%,42%)`, color: stockState === "out" ? "var(--text-3)" : "#fff", fontWeight: 800, fontSize: 15, cursor: stockState === "out" ? "not-allowed" : "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s" }}>
              {stockState === "out" ? "Out of Stock" : inCart > 0 ? `Update Cart (${qty})` : `Add ${qty} to Cart · $${(price * qty).toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CustomerBrowse({ shopId, onAddToCart, onUpdateCart, cartItems, onChangeShop }) {
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("popularity");
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [showOnSaleOnly, setShowOnSaleOnly] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dataVersion, setDataVersion] = useState(() => G.PRODUCTS?.length > 0 ? 1 : 0);

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
      {/* Search bar */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)", padding: "12px 16px" }}>
        <div style={{ maxWidth: 1600, margin: "0 auto", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <button onClick={onChangeShop} aria-label="Change store"
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--surface-2)", borderRadius: 8, fontSize: 12, color: "var(--text-2)", fontWeight: 600, border: "1px solid var(--line)", cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s", whiteSpace: "nowrap" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.color = "var(--primary-ink)"; e.currentTarget.style.borderColor = "var(--primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.borderColor = "var(--line)"; }}>
            <IconC name="chevR" size={14} style={{ transform: "rotate(180deg)" }} />
            <IconC name="pin" size={14} />
            <span>{currentShop?.name || "Select Store"}</span>
          </button>
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}><IconC name="search" size={16} /></span>
            <input aria-label="Search products" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" style={{ width: "100%", padding: "8px 12px 8px 36px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "var(--font-sans)" }} />
          </div>
          <div className="hideOnMobile" style={{ position: "relative" }}>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: "8px 32px 8px 12px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)", fontSize: 13, fontFamily: "var(--font-sans)", appearance: "none", cursor: "pointer", outline: "none" }}>
              <option value="popularity">Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">A–Z</option>
            </select>
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-3)" }}><IconC name="chevD" size={14} /></span>
          </div>
          <button onClick={() => setShowFiltersModal(!showFiltersModal)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--line)", background: showFiltersModal ? "var(--primary)" : "var(--bg)", color: showFiltersModal ? "var(--primary-ink)" : "var(--text-2)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: 6 }}>
            <IconC name="sliders" size={14} />Filters
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)", position: "sticky", top: 64, zIndex: 30, display: "flex", gap: 8, overflowX: "auto", padding: "10px 16px" }}>
        <button onClick={() => { setCat("all"); setSearch(""); }} style={{ padding: "8px 14px", borderRadius: 999, border: "1px solid", borderColor: cat === "all" ? "transparent" : "var(--line)", background: cat === "all" ? "var(--primary)" : "transparent", color: cat === "all" ? "var(--primary-ink)" : "var(--text-2)", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "var(--font-sans)" }}>All</button>
        {G.CATEGORIES.map(c => {
          const active = cat === c.id;
          return (
            <button key={c.id} onClick={() => { setCat(c.id); setSearch(""); }} style={{ padding: "8px 14px", borderRadius: 999, border: "1px solid", borderColor: active ? "transparent" : "var(--line)", background: active ? `hsl(${c.hue}, 60%, 42%)` : "transparent", color: active ? "#fff" : "var(--text-2)", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "var(--font-sans)" }}>
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Category hero */}
      <div style={{ background: `linear-gradient(135deg, oklch(0.38 0.12 ${currentCat.hue}) 0%, oklch(0.5 0.1 ${currentCat.hue}) 100%)`, color: "#fff", padding: "20px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -20, top: -20, fontSize: "7rem", opacity: 0.1, userSelect: "none", lineHeight: 1 }}>🛒</div>
        <div style={{ maxWidth: 1600, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, position: "relative", zIndex: 1 }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em" }}>{currentCat.name}</p>
            {currentCat.blurb && <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>{currentCat.blurb}</p>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", backdropFilter: "blur(4px)" }}>
            <IconC name="box" size={14} />
            {products.length} product{products.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", gap: 20, padding: "20px 16px", maxWidth: 1600, margin: "0 auto", width: "100%" }}>
        <div className="sidebar-desktop" style={{ minWidth: 280 }}>
          <FilterSidebar priceRange={priceRange} onPriceChange={setPriceRange} showInStockOnly={showInStockOnly} onStockToggle={setShowInStockOnly} showOnSaleOnly={showOnSaleOnly} onSaleToggle={setShowOnSaleOnly} resetFilters={resetFilters} />
          {currentShop && (
            <div style={{ marginTop: 20 }}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 16, position: "sticky", top: 100, zIndex: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{currentShop.name}</div>
                <button onClick={onChangeShop} style={{ marginTop: 10, width: "100%", padding: "10px", borderRadius: 9, border: "1px solid var(--line)", background: "transparent", color: "var(--text)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-sans)" }}>Change Store</button>
              </div>
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 600 }}>{products.length} product{products.length !== 1 ? "s" : ""}</span>
          </div>
          {products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-3)" }}>
              <IconC name="search" size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>No products found</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
              {products.map(p => {
                const inCart = cartItems[p.id] || 0;
                const ss = G.stockState(p.stock);
                return (
                  <ProductCardEnhanced key={p.id} product={p} inCart={inCart} disabled={ss === "out"} stockState={ss}
                    onAdd={() => onAddToCart(p.id)} onAddQty={() => onAddToCart(p.id)}
                    onRemoveQty={() => onUpdateCart && onUpdateCart(p.id, Math.max(0, inCart - 1))}
                    onClick={() => setSelectedProduct(p)} />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} inCart={cartItems[selectedProduct.id] || 0}
          onClose={() => setSelectedProduct(null)} onAdd={() => onAddToCart(selectedProduct.id)} onUpdateCart={onUpdateCart} />
      )}

      {showFiltersModal && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, top: 0, background: "rgba(0,0,0,0.4)", zIndex: 40, display: "flex", alignItems: "flex-end" }} className="mobile-filter-modal" onClick={() => setShowFiltersModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: "var(--surface)", borderRadius: "16px 16px 0 0", padding: "20px 16px", maxHeight: "80vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", margin: 0 }}>Filters</h3>
              <button onClick={() => setShowFiltersModal(false)} style={{ background: "none", border: "none", fontSize: 24, color: "var(--text-2)", cursor: "pointer" }}>×</button>
            </div>
            <FilterSidebar priceRange={priceRange} onPriceChange={setPriceRange} showInStockOnly={showInStockOnly} onStockToggle={setShowInStockOnly} showOnSaleOnly={showOnSaleOnly} onSaleToggle={setShowOnSaleOnly} resetFilters={resetFilters} />
            <BtnC full onClick={() => setShowFiltersModal(false)} style={{ marginTop: "auto" }}>Apply Filters</BtnC>
          </div>
        </div>
      )}
    </div>
  );
}
