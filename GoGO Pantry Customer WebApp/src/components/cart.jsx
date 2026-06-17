import { useState, useEffect, useMemo } from 'react';
import { G } from '../globals.js';
import { IconC } from './icons.jsx';
import { BtnC, EmptyState } from './ui.jsx';
import { ProgressIndicator } from './checkout.jsx';

export function CustomerCart({ shopId, cartItems, onUpdateCart, onCheckout, onContinueShopping }) {
  const [dataVersion, setDataVersion] = useState(() => G.PRODUCTS?.length > 0 ? 1 : 0);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (G.PRODUCTS?.length > 0) setDataVersion(n => n > 0 ? n : 1);
    const handler = () => setDataVersion(n => n + 1);
    window.addEventListener("dataLoaded", handler);
    return () => window.removeEventListener("dataLoaded", handler);
  }, []);

  const cartProducts = useMemo(() => {
    return Object.entries(cartItems).filter(([, qty]) => qty > 0).map(([id, qty]) => {
      const p = G.PRODUCTS.find(x => String(x.id) === String(id));
      if (!p) return null;
      return { ...p, qty, stock: G.shopStock(p.id, shopId), subtotal: (parseFloat(p.price) || 0) * qty };
    }).filter(Boolean);
  }, [cartItems, shopId, dataVersion]);

  const subtotal = cartProducts.reduce((s, p) => s + p.subtotal, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const isEmpty = cartProducts.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <ProgressIndicator currentStep={1} steps={["Store", "Cart", "Checkout", "Confirm"]} />
      <div style={{ padding: "20px 16px", maxWidth: 900, margin: "0 auto", width: "100%", flex: 1 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 20px", color: "var(--text)" }}>Your cart</h1>
        {isEmpty ? (
          <EmptyState
            icon="leaf"
            title="Your cart is empty"
            sub="Browse fresh groceries from your local store and add them here"
            action={<BtnC icon="leaf" onClick={onContinueShopping}>Browse products</BtnC>}
          />
        ) : (
          <div className="cart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
            {/* ITEMS */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 0, overflow: "hidden" }}>
              <div style={{ padding: 16, borderBottom: "1px solid var(--line)", fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
                {cartProducts.length} item{cartProducts.length !== 1 ? 's' : ''}
              </div>
              <div>
                {cartProducts.map((p, i) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderTop: i ? "1px solid var(--line)" : "none" }}>
                    <div style={{ width: 70, height: 70, borderRadius: 11, background: `oklch(0.92 0.07 ${G.catOf(p.cat)?.hue || 152})`, display: "grid", placeItems: "center", flexShrink: 0, color: `oklch(0.6 0.08 ${G.catOf(p.cat)?.hue || 152})` }}><IconC name="cart" size={32} stroke={1.5} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 2 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-2)" }}>{p.unit} · {G.money(p.price)}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={() => onUpdateCart(p.id, Math.max(0, p.qty - 1))} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--line)", background: "transparent", color: "var(--text-2)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", minWidth: 24, textAlign: "center" }}>{p.qty}</span>
                      <button onClick={() => onUpdateCart(p.id, p.qty + 1)} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--line)", background: "transparent", color: "var(--text-2)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>+</button>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", minWidth: 60, textAlign: "right" }}>{G.money(p.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SUMMARY */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: 20, height: "fit-content", position: "sticky", top: 80 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "var(--text)" }}>Order summary</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-2)" }}>
                  <span>Subtotal</span><span>{G.money(subtotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-2)" }}>
                  <span>Pickup</span><span style={{ color: "var(--green-600)", fontWeight: 700 }}>Free</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-2)" }}>
                  <span>Tax</span><span>{G.money(tax)}</span>
                </div>
              </div>
              <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, marginBottom: 18, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, color: "var(--text)" }}>Total</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)" }}>{G.money(total)}</span>
              </div>
              <BtnC full loading={checkingOut} onClick={() => { setCheckingOut(true); onCheckout(); }} style={{ marginBottom: 10 }}>Proceed to checkout</BtnC>
              <BtnC full variant="ghost" onClick={onContinueShopping}>Continue shopping</BtnC>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
