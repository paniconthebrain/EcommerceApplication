import { useState, useMemo } from 'react';
import { G } from '../../globals.js';
import { PageHead, ProductSwatch, Pill, Btn, card, sectionTitle } from '../ui.jsx';
import { Icon } from '../icons.jsx';

export default function ReceiveScreen({ shopId, setRoute }) {
  const [poId, setPoId] = useState("PO-2206");
  const [done, setDone] = useState({});
  const [success, setSuccess] = useState(false);

  const po = G.DELIVERIES.find(d => d.id === poId);
  const sup = G.supplierOf(po.supplier);

  const lines = useMemo(() => {
    const items = G.PRODUCTS.filter(p => p.supplier_code === po.supplier).slice(0, po.items);
    if (items.length === 0) {
      return G.PRODUCTS.slice(0, Math.min(po.items, G.PRODUCTS.length))
        .map(p => ({ ...p, stock: G.shopStock(p.id, shopId), expected: 6 + ((p.id.charCodeAt(2) * 3) % 18) }));
    }
    return items.map(p => ({ ...p, stock: G.shopStock(p.id, shopId), expected: 6 + ((p.id.charCodeAt(2) * 3) % 18) }));
  }, [poId, shopId]);

  const checkedCount = lines.filter(l => done[l.id]).length;
  const progress = lines.length ? Math.round((checkedCount / lines.length) * 100) : 0;

  if (success) return (
    <div style={{ display: "grid", placeItems: "center", padding: 40, minHeight: "calc(100vh - 60px)" }}>
      <div style={{ ...card(), maxWidth: 460, width: "100%", textAlign: "center", padding: 40 }}>
        <div style={{ width: 76, height: 76, borderRadius: 999, background: "var(--green-100)", color: "var(--green-700)", display: "grid", placeItems: "center", margin: "0 auto 22px" }}>
          <Icon name="check" size={40} stroke={3} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", color: "var(--text)" }}>Stock received</h2>
        <p style={{ color: "var(--text-2)", margin: "0 0 24px", fontSize: 15 }}>
          <span className="mono">{po.id}</span> from {sup.name} is checked in.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <Btn variant="ghost" full onClick={() => { setSuccess(false); setDone({}); }}>Receive another</Btn>
          <Btn full icon="dashboard" onClick={() => setRoute("dashboard")}>Dashboard</Btn>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PageHead title="Receive stock" subtitle="Check in supplier delivery" />
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "300px 1fr", gap: 22, padding: "22px 34px 48px", overflowY: "auto" }}>
        <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-3)" }}>Incoming POs</div>
          {G.DELIVERIES.map(d => {
            const active = d.id === poId;
            return (
              <button key={d.id} onClick={() => { setPoId(d.id); setDone({}); }} style={{ textAlign: "left", padding: 15, borderRadius: 14, border: "1px solid", borderColor: active ? "var(--primary)" : "var(--line)", background: active ? "var(--surface)" : "var(--bg)", cursor: "pointer", boxShadow: active ? "var(--shadow-md)" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{d.id}</span>
                  <Pill tone={d.status === "arrived" ? "ok" : "info"} size="sm">{d.status === "arrived" ? "Arrived" : "In transit"}</Pill>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{G.supplierOf(d.supplier).name}</div>
                <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>{d.items} lines</div>
              </button>
            );
          })}
        </aside>

        <section style={{ ...card(), padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ width: 48, height: 48, borderRadius: 13, background: "var(--green-100)", color: "var(--green-700)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Icon name="truck" size={24} />
            </span>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "var(--text)" }}>{sup.name}</h2>
              <p style={{ fontSize: 13, color: "var(--text-2)", margin: "2px 0 0" }}><span className="mono">{po.id}</span> · {po.eta}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="tnum" style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>{checkedCount}<span style={{ color: "var(--text-3)", fontWeight: 600 }}>/{lines.length}</span></div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>lines received</div>
            </div>
          </div>
          <div style={{ height: 4, background: "var(--surface-2)" }}>
            <div style={{ width: progress + "%", height: "100%", background: "var(--primary)", transition: "width .4s var(--ease)" }} />
          </div>

          <div style={{ maxHeight: 430, overflowY: "auto" }}>
            {lines.map(l => {
              const checked = !!done[l.id];
              return (
                <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 24px", borderTop: "1px solid var(--line)", background: checked ? "color-mix(in oklch, var(--green-500) 7%, transparent)" : "transparent" }}>
                  <button onClick={() => setDone(d => ({ ...d, [l.id]: !d[l.id] }))} style={{ width: 26, height: 26, borderRadius: 8, border: "2px solid", borderColor: checked ? "var(--primary)" : "var(--line)", background: checked ? "var(--primary)" : "transparent", color: "#fff", cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    {checked && <Icon name="check" size={16} stroke={3} />}
                  </button>
                  <ProductSwatch p={l} size={40} />
                  <div style={{ flex: 1, minWidth: 0, lineHeight: 1.3 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{l.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-3)" }}><span className="mono">{l.id.toUpperCase()}</span> · on hand {l.stock}</div>
                  </div>
                  {checked ? <Icon name="check" size={16} style={{ color: "var(--primary)" }} /> : <span style={{ fontSize: 12, color: "var(--text-3)" }}>—</span>}
                </div>
              );
            })}
          </div>

          <div style={{ padding: "16px 24px", borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 16, background: "var(--bg)" }}>
            <span style={{ flex: 1, fontSize: 13, color: "var(--text-2)" }}>{checkedCount} of {lines.length} items checked</span>
            <Btn variant="ghost" onClick={() => setDone({})}>Reset</Btn>
            <Btn icon="check" onClick={() => setSuccess(true)} style={{ opacity: checkedCount ? 1 : 0.5 }}>Confirm & add</Btn>
          </div>
        </section>
      </div>
    </>
  );
}
