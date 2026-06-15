import { useState, useMemo } from 'react';
import { G } from '../../globals.js';
import { PageHead, ProductSwatch, Pill, StockBar, Btn, card, sectionTitle, sectionSub, th, td, linkBtn } from '../ui.jsx';
import { Icon } from '../icons.jsx';

export default function DashboardScreen({ shopId, setRoute }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  const products = useMemo(() => {
    return G.PRODUCTS.map(p => ({ ...p, stock: G.shopStock(p.id, shopId) }))
      .filter(p => cat === "all" || p.cat === cat)
      .filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  }, [shopId, q, cat]);

  const all = G.PRODUCTS.map(p => ({ ...p, stock: G.shopStock(p.id, shopId) }));
  const low = all.filter(p => ["low", "critical"].includes(G.stockState(p.stock, p.par)));
  const out = all.filter(p => G.stockState(p.stock, p.par) === "out");
  const newOrders = G.ORDERS.filter(o => o.status === "new");
  const inProgress = G.ORDERS.filter(o => ["picking", "ready"].includes(o.status));
  const revenue = G.ORDERS.reduce((s, o) => s + o.total, 0);

  const kpis = [
    { label: "Open orders", value: newOrders.length + inProgress.length, delta: "+4", tone: "up", icon: "orders", sub: "vs. yesterday" },
    { label: "Low / out of stock", value: low.length + out.length, delta: out.length + " out", tone: "warn", icon: "alert", sub: "needs reorder" },
    { label: "Today's sales", value: G.money(revenue), delta: "+12.4%", tone: "up", icon: "orders", sub: "8 orders" },
    { label: "Fill rate", value: "99.2%", delta: "+0.3%", tone: "up", icon: "check", sub: "last 7 days" },
  ];

  return (
    <>
      <PageHead title="Dashboard" subtitle="Live store overview">
        <Btn variant="ghost" size="sm" icon="search">Scan item</Btn>
        <Btn size="sm" icon="plus" onClick={() => setRoute("receive")}>Receive stock</Btn>
      </PageHead>

      <div style={{ flex: 1, padding: "22px 34px 48px", display: "flex", flexDirection: "column", gap: 18, overflowY: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {kpis.map(k => (
            <div key={k.label} style={card({ padding: 16 })}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, background: "var(--surface-2)", color: "var(--text-2)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Icon name={k.icon} size={17} />
                </span>
                <span style={{ fontSize: 12.5, color: "var(--text-2)", fontWeight: 600, flex: 1 }}>{k.label}</span>
                <Pill tone={k.tone === "up" ? "ok" : "warn"} size="sm">{k.delta}</Pill>
              </div>
              <div style={{ marginTop: 12 }}>
                <div className="tnum" style={{ fontSize: 25, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)", lineHeight: 1.1 }}>{k.value}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{k.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 18, alignItems: "start" }}>
          <section style={{ ...card(), padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <h2 style={sectionTitle}>Stock overview</h2>
                <p style={sectionSub}>{products.length} of {G.PRODUCTS.length} SKUs</p>
              </div>
              <div style={{ position: "relative" }}>
                <select value={cat} onChange={e => setCat(e.target.value)} style={{ padding: "8px 30px 8px 32px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)", fontSize: 13, fontWeight: 600, outline: "none", fontFamily: "var(--font-sans)", appearance: "none", cursor: "pointer" }}>
                  <option value="all">All categories</option>
                  {G.CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }}><Icon name="chevD" size={14} /></span>
              </div>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}><Icon name="search" size={16} /></span>
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products…" style={{ padding: "8px 12px 8px 34px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--text)", fontSize: 13, width: 168, outline: "none", fontFamily: "var(--font-sans)" }} />
              </div>
            </div>
            <div style={{ maxHeight: 460, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                <thead style={{ position: "sticky", top: 0, background: "var(--surface)", zIndex: 1 }}>
                  <tr>
                    <th style={th}>Product</th>
                    <th style={{ ...th, width: 150 }}>Stock level</th>
                    <th style={{ ...th, width: 110 }}>Status</th>
                    <th style={{ ...th, width: 96, textAlign: "right" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => {
                    const state = G.stockState(p.stock, p.par);
                    return (
                      <tr key={p.id} style={{ borderTop: "1px solid var(--line)" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                            <ProductSwatch p={p} size={34} />
                            <div style={{ lineHeight: 1.3, minWidth: 0, flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                              <div style={{ fontSize: 11.5, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{G.catOf(p.cat).name} · {G.money(p.price)}/{p.unit}</div>
                            </div>
                          </div>
                        </td>
                        <td style={td}><StockBar stock={p.stock} par={p.par} /></td>
                        <td style={td}>
                          <Pill tone={state} dot size="sm">{state === "ok" ? "In stock" : state === "low" ? "Low" : state === "critical" ? "Critical" : "Out"}</Pill>
                        </td>
                        <td style={{ ...td, textAlign: "right" }}>
                          {state !== "ok" && <Btn size="sm" variant="soft" onClick={() => setRoute("receive")}>Reorder</Btn>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <section style={{ ...card(), padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <h2 style={sectionTitle}>Incoming orders</h2>
                  <p style={sectionSub}>{newOrders.length} new · {inProgress.length} in progress</p>
                </div>
                <button onClick={() => setRoute("fulfill")} style={linkBtn}>View queue <Icon name="chevR" size={14} /></button>
              </div>
              <div>
                {G.ORDERS.filter(o => o.status !== "completed").slice(0, 5).map(o => (
                  <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 20px", borderTop: "1px solid var(--line)", cursor: "pointer" }}
                    onClick={() => setRoute("fulfill")}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ width: 36, height: 36, borderRadius: 999, background: "var(--surface-2)", color: "var(--text-2)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12.5, flexShrink: 0 }}>{o.initials}</div>
                    <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.customer}</div>
                      <div style={{ fontSize: 12, color: "var(--text-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        <span className="mono" style={{ color: "var(--text-3)" }}>{o.id}</span> · {o.items} items · {o.type}
                      </div>
                    </div>
                    <Pill tone={o.status === "new" ? "info" : o.status === "ready" ? "ok" : "low"} size="sm">
                      {o.status === "new" ? "New" : o.status === "picking" ? "Picking" : "Ready"}
                    </Pill>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ ...card(), padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <h2 style={sectionTitle}>Incoming deliveries</h2>
                  <p style={sectionSub}>From suppliers</p>
                </div>
                <button onClick={() => setRoute("receive")} style={linkBtn}>Receive <Icon name="chevR" size={14} /></button>
              </div>
              {G.DELIVERIES.map(d => {
                const sup = G.supplierOf(d.supplier);
                const tone = d.status === "arrived" ? "ok" : d.status === "in-transit" ? "info" : "neutral";
                return (
                  <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 20px", borderTop: "1px solid var(--line)" }}>
                    <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--surface-2)", color: "var(--text-2)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="truck" size={18} /></span>
                    <div style={{ flex: 1, minWidth: 0, lineHeight: 1.3 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text)" }}>{sup.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-2)" }}><span className="mono">{d.id}</span> · {d.items} lines · {d.eta}</div>
                    </div>
                    <Pill tone={tone} dot size="sm">{d.status === "in-transit" ? "In transit" : d.status === "arrived" ? "Arrived" : "Scheduled"}</Pill>
                  </div>
                );
              })}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
