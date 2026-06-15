import { useState, useMemo } from 'react';
import { G } from '../../globals.js';
import { PageHead, ProductSwatch, Pill, Btn, card, th, td } from '../ui.jsx';
import { Icon } from '../icons.jsx';

export default function FulfillScreen({ shopId }) {
  const [orders, setOrders] = useState(() => G.ORDERS.map(o => ({ ...o })));
  const [selId, setSelId] = useState(G.ORDERS.find(o => o.status === "new")?.id || G.ORDERS[0].id);
  const [tab, setTab] = useState("active");
  const [picked, setPicked] = useState({});

  const sel = orders.find(o => o.id === selId);
  const lineItems = useMemo(() => {
    if (!sel) return [];
    const start = (sel.id.charCodeAt(4) * 3) % G.PRODUCTS.length;
    const n = Math.min(sel.items, 8);
    const arr = [];
    for (let i = 0; i < n; i++) {
      const p = G.PRODUCTS[(start + i * 4) % G.PRODUCTS.length];
      arr.push({ ...p, qty: 1 + ((p.id.charCodeAt(2) + i) % 3), aisle: ["A2", "A5", "B1", "B4", "C3", "D2", "Freezer"][i % 7] });
    }
    return arr;
  }, [selId]);

  const counts = {
    new: orders.filter(o => o.status === "new").length,
    picking: orders.filter(o => o.status === "picking").length,
    ready: orders.filter(o => o.status === "ready").length,
    completed: orders.filter(o => o.status === "completed").length,
  };

  const visible = orders.filter(o => tab === "active" ? o.status !== "completed" : o.status === "completed");
  const setStatus = (id, status, picker) => setOrders(os => os.map(o => o.id === id ? { ...o, status, picker: picker ?? o.picker } : o));
  const togglePick = (idx) => setPicked(p => ({ ...p, [selId]: { ...(p[selId] || {}), [idx]: !(p[selId]?.[idx]) } }));

  const pickedCount = lineItems.filter((_, i) => picked[selId]?.[i]).length;
  const allPicked = pickedCount === lineItems.length && lineItems.length > 0;

  return (
    <>
      <PageHead title="Fulfillment queue" subtitle={`${counts.new} new · ${counts.picking} picking · ${counts.ready} ready`} />

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "minmax(380px, 1fr) 1.1fr", gap: 22, padding: "22px 34px 48px", alignItems: "start", overflowY: "auto" }}>
        <section style={{ ...card(), padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", padding: 6, gap: 4, borderBottom: "1px solid var(--line)" }}>
            {[["active", "Active"], ["completed", "Completed"]].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", background: tab === k ? "var(--surface-2)" : "transparent", color: "var(--text)", fontWeight: 700, fontSize: 13.5, fontFamily: "var(--font-sans)" }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ maxHeight: 620, overflowY: "auto" }}>
            {visible.map(o => {
              const active = o.id === selId;
              const statusTone = o.status === "new" ? "info" : o.status === "ready" ? "ok" : "low";
              return (
                <button key={o.id} onClick={() => setSelId(o.id)} style={{ width: "100%", textAlign: "left", display: "flex", gap: 13, padding: "15px 18px", borderTop: "1px solid var(--line)", border: "none", borderLeft: active ? "3px solid var(--primary)" : "3px solid transparent", background: active ? "var(--surface-2)" : "transparent", cursor: "pointer", alignItems: "center" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 999, background: active ? "var(--green-600)" : "var(--surface-2)", color: active ? "#fff" : "var(--text-2)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13.5, flexShrink: 0 }}>{o.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.customer}</div>
                    <div style={{ fontSize: 12.5, color: "var(--text-2)", marginTop: 2 }}><span className="mono" style={{ color: "var(--text-3)" }}>{o.id}</span> · {o.items} items</div>
                  </div>
                  <Pill tone={statusTone} size="sm">{o.status.charAt(0).toUpperCase() + o.status.slice(1)}</Pill>
                </button>
              );
            })}
          </div>
        </section>

        {sel && (
          <section style={{ ...card(), padding: 0, overflow: "hidden", position: "sticky", top: 92 }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 999, background: "var(--green-600)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{sel.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "var(--text)" }}>{sel.customer}</h2>
                <p style={{ fontSize: 13, color: "var(--text-2)", margin: "3px 0 0" }}><span className="mono">{sel.id}</span> · {G.money(sel.total)}</p>
              </div>
            </div>

            {sel.status === "picking" && (
              <div style={{ padding: "12px 24px", display: "flex", alignItems: "center", gap: 12, background: "var(--bg)", borderBottom: "1px solid var(--line)" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Progress</span>
                <div style={{ flex: 1, height: 7, background: "var(--surface-2)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ width: (pickedCount / lineItems.length * 100) + "%", height: "100%", background: "var(--primary)", transition: "width .35s var(--ease)" }} />
                </div>
                <span className="tnum" style={{ fontSize: 13, fontWeight: 700, color: "var(--text-2)" }}>{pickedCount}/{lineItems.length}</span>
              </div>
            )}

            <div style={{ maxHeight: 360, overflowY: "auto" }}>
              {lineItems.map((it, idx) => {
                const isPicked = picked[selId]?.[idx];
                const canPick = sel.status === "picking";
                return (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 24px", borderTop: idx ? "1px solid var(--line)" : "none", opacity: isPicked ? 0.6 : 1 }}>
                    <button onClick={() => canPick && togglePick(idx)} disabled={!canPick} style={{ width: 24, height: 24, borderRadius: 7, border: "2px solid", borderColor: isPicked ? "var(--primary)" : "var(--line)", background: isPicked ? "var(--primary)" : "transparent", color: "#fff", cursor: canPick ? "pointer" : "not-allowed", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      {isPicked && <Icon name="check" size={14} stroke={3} />}
                    </button>
                    <ProductSwatch p={it} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text)", textDecoration: isPicked ? "line-through" : "none" }}>{it.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)" }}>{G.catOf(it.cat).name} · {G.money(it.price)}/{it.unit}</div>
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-2)", background: "var(--surface-2)", padding: "3px 9px", borderRadius: 7 }}>Aisle {it.aisle}</span>
                    <span className="tnum" style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", minWidth: 28, textAlign: "right" }}>×{it.qty}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--line)", background: "var(--bg)", display: "flex", gap: 12, alignItems: "center" }}>
              {sel.status === "new" && <><span style={{ flex: 1, fontSize: 13, color: "var(--text-2)" }}>Ready to pick</span><Btn icon="clipboard" onClick={() => setStatus(sel.id, "picking", "Alex")}>Start picking</Btn></>}
              {sel.status === "picking" && <><span style={{ flex: 1, fontSize: 13, color: allPicked ? "var(--primary)" : "var(--text-2)" }}>{allPicked ? "All picked!" : `${lineItems.length - pickedCount} left`}</span><Btn icon="check" onClick={() => setStatus(sel.id, "ready")} style={{ opacity: allPicked ? 1 : 0.5 }}>Mark ready</Btn></>}
              {sel.status === "ready" && <><span style={{ flex: 1, fontSize: 13, color: "var(--text-2)" }}>Hand off to driver</span><Btn icon="check" onClick={() => setStatus(sel.id, "completed")}>Dispatch</Btn></>}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
