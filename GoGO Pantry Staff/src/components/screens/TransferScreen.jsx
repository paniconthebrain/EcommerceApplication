import { useState, useMemo } from 'react';
import { G } from '../../globals.js';
import { PageHead, ProductSwatch, Pill, Btn, card, sectionTitle, th, td } from '../ui.jsx';
import { Icon } from '../icons.jsx';

export default function TransferScreen({ shopId, setRoute }) {
  const [from, setFrom] = useState(shopId);
  const [to, setTo] = useState(() => {
    const other = G.SHOPS.find(s => s.id !== shopId);
    return other ? other.id : (G.SHOPS[0] ? G.SHOPS[0].id : shopId);
  });
  const [cart, setCart] = useState({});
  const [q, setQ] = useState("");
  const [success, setSuccess] = useState(false);

  const fromShop = G.SHOPS.find(s => s.id === from);
  const toShop = G.SHOPS.find(s => s.id === to);

  const products = useMemo(() => G.PRODUCTS
    .map(p => ({ ...p, fromStock: G.shopStock(p.id, from), toStock: G.shopStock(p.id, to) }))
    .filter(p => p.name.toLowerCase().includes(q.toLowerCase())), [from, to, q]);

  const lines = Object.entries(cart).filter(([, v]) => v > 0);
  const totalUnits = lines.reduce((s, [, v]) => s + v, 0);

  if (success) return (
    <div style={{ display: "grid", placeItems: "center", padding: 40, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ ...card(), maxWidth: 460, width: "100%", textAlign: "center", padding: 40 }}>
        <div style={{ width: 76, height: 76, borderRadius: 999, background: "var(--green-100)", color: "var(--green-700)", display: "grid", placeItems: "center", margin: "0 auto 22px" }}>
          <Icon name="transfer" size={36} stroke={2.4} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", color: "var(--text)" }}>Transfer submitted</h2>
        <p style={{ color: "var(--text-2)", margin: "0 0 24px", fontSize: 15 }}>
          {totalUnits} units from {fromShop?.name} to {toShop?.name} are en route.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <Btn variant="ghost" full onClick={() => { setSuccess(false); setCart({}); }}>New transfer</Btn>
          <Btn full icon="dashboard" onClick={() => setRoute("dashboard")}>Dashboard</Btn>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PageHead title="Stock transfer" subtitle="Move inventory between locations" />
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 360px", gap: 22, padding: "22px 34px 48px", alignItems: "start", overflowY: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ ...card(), display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase" }}>From</div>
              <select value={from} onChange={e => { setFrom(e.target.value); setCart({}); }} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", fontSize: 14.5, fontWeight: 700, appearance: "none", cursor: "pointer", fontFamily: "var(--font-sans)", outline: "none" }}>
                {G.SHOPS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <button onClick={() => { setFrom(to); setTo(from); setCart({}); }} title="Swap" style={{ width: 42, height: 42, borderRadius: 999, border: "1px solid var(--line)", background: "var(--surface-2)", color: "var(--text-2)", cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 18 }}>
              <Icon name="transfer" size={18} />
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase" }}>To</div>
              <select value={to} onChange={e => setTo(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", fontSize: 14.5, fontWeight: 700, appearance: "none", cursor: "pointer", fontFamily: "var(--font-sans)", outline: "none" }}>
                {G.SHOPS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <section style={{ ...card(), padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}><h2 style={sectionTitle}>Select products</h2></div>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}><Icon name="search" size={16} /></span>
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" style={{ padding: "8px 12px 8px 34px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)", fontSize: 13, width: 170, outline: "none", fontFamily: "var(--font-sans)" }} />
              </div>
            </div>
            <div style={{ maxHeight: 440, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, background: "var(--surface)", zIndex: 1 }}>
                  <tr>
                    <th style={th}>Product</th>
                    <th style={{ ...th, textAlign: "center" }}>{fromShop?.code}</th>
                    <th style={{ ...th, textAlign: "center" }}>{toShop?.code}</th>
                    <th style={{ ...th, textAlign: "right" }}>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => {
                    const inCart = cart[p.id] || 0;
                    return (
                      <tr key={p.id} style={{ borderTop: "1px solid var(--line)", background: inCart ? "color-mix(in oklch, var(--green-500) 6%, transparent)" : "transparent" }}>
                        <td style={td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                            <ProductSwatch p={p} size={34} />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text)" }}>{p.name}</div>
                              <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{G.catOf(p.cat).name}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ ...td, textAlign: "center" }}><span className="tnum" style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text)" }}>{p.fromStock}</span></td>
                        <td style={{ ...td, textAlign: "center" }}>
                          <Pill tone={G.stockState(p.toStock, p.par)} size="sm">{p.toStock}</Pill>
                        </td>
                        <td style={{ ...td, textAlign: "right" }}>
                          {inCart > 0
                            ? <input type="number" value={inCart} onChange={e => { const v = parseInt(e.target.value) || 0; setCart(c => ({ ...c, [p.id]: Math.max(0, Math.min(v, p.fromStock)) })); }} style={{ width: 50, padding: "4px 8px", borderRadius: 6, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", textAlign: "center", fontFamily: "var(--font-sans)" }} />
                            : <Btn size="sm" variant="soft" icon="plus" onClick={() => setCart(c => ({ ...c, [p.id]: 1 }))}>Add</Btn>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside style={{ ...card(), padding: 0, position: "sticky", top: 92, overflow: "hidden" }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--line)" }}>
            <h2 style={sectionTitle}>Manifest</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 13 }}>
              <span style={{ fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap" }}>{fromShop?.name}</span>
              <Icon name="chevR" size={14} style={{ color: "var(--text-3)" }} />
              <span style={{ fontWeight: 700, color: "var(--primary)", whiteSpace: "nowrap" }}>{toShop?.name}</span>
            </div>
          </div>
          <div style={{ maxHeight: 340, overflowY: "auto" }}>
            {lines.length === 0
              ? <div style={{ padding: "44px 20px", textAlign: "center", color: "var(--text-3)" }}>
                  <Icon name="box" size={30} style={{ opacity: 0.5 }} />
                  <p style={{ fontSize: 13.5, margin: "10px 0 0" }}>No items added</p>
                </div>
              : lines.map(([id, qty]) => {
                const p = G.PRODUCTS.find(x => x.id === id);
                return (
                  <div key={id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 20px", borderTop: "1px solid var(--line)" }}>
                    <ProductSwatch p={p} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{p.name}</div>
                      <div className="tnum" style={{ fontSize: 12, color: "var(--text-3)" }}>{qty} {p.unit}</div>
                    </div>
                    <button onClick={() => setCart(c => { const n = { ...c }; delete n[id]; return n; })} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", padding: 4 }}>
                      <Icon name="x" size={16} />
                    </button>
                  </div>
                );
              })}
          </div>
          <div style={{ padding: 20, borderTop: "1px solid var(--line)", background: "var(--bg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 14, color: "var(--text-2)" }}>{lines.length} products · {totalUnits} units</span>
            </div>
            <Btn full icon="transfer" onClick={() => setSuccess(true)} style={{ opacity: lines.length ? 1 : 0.5, pointerEvents: lines.length ? "auto" : "none" }}>Submit transfer</Btn>
          </div>
        </aside>
      </div>
    </>
  );
}
