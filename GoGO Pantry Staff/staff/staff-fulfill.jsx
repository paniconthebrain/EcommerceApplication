/* GoGO Pantry — Order Fulfillment Queue (interactive picking) */

function FulfillScreen({ shopId, setRoute }) {
  const [orders, setOrders] = useState(() => G.ORDERS.map(o => ({ ...o })));
  const [selId, setSelId] = useState(G.ORDERS.find(o => o.status === "new")?.id || G.ORDERS[0].id);
  const [tab, setTab] = useState("active");
  const [picked, setPicked] = useState({}); // orderId -> {lineIdx:true}

  const sel = orders.find(o => o.id === selId);

  // Build deterministic line items for an order
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

  const statusMeta = { new: ["info", "New"], picking: ["low", "Picking"], ready: ["ok", "Ready"], completed: ["neutral", "Done"] };

  return (
    <React.Fragment>
      <PageHead title="Fulfillment queue" subtitle={`${counts.new} new · ${counts.picking} picking · ${counts.ready} ready for handoff`}>
        <div style={{ display: "flex", gap: 8 }}>
          {[["new", "New", "info"], ["picking", "Picking", "low"], ["ready", "Ready", "ok"]].map(([k, l, t]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--line)" }}>
              <Pill tone={t} dot size="sm">{l}</Pill>
              <span className="tnum" style={{ fontWeight: 800, fontSize: 14, color: "var(--text)" }}>{counts[k]}</span>
            </div>
          ))}
        </div>
      </PageHead>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(380px, 1fr) 1.1fr", gap: 22, padding: "22px 34px 48px", alignItems: "start", maxWidth: 1480, margin: "0 auto", width: "100%" }}>
        {/* Queue list */}
        <section style={{ ...card(), padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", padding: 6, gap: 4, borderBottom: "1px solid var(--line)" }}>
            {[["active", "Active queue", counts.new + counts.picking + counts.ready], ["completed", "Completed", counts.completed]].map(([k, l, c]) => (
              <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", background: tab === k ? "var(--surface-2)" : "transparent", color: tab === k ? "var(--text)" : "var(--text-2)", fontWeight: 700, fontSize: 13.5, fontFamily: "var(--font-sans)", display: "flex", justifyContent: "center", gap: 7, alignItems: "center" }}>
                {l} <span className="tnum" style={{ fontSize: 12, color: "var(--text-3)" }}>{c}</span>
              </button>
            ))}
          </div>
          <div style={{ maxHeight: 620, overflowY: "auto" }}>
            {visible.map(o => {
              const active = o.id === selId;
              const [tone, label] = statusMeta[o.status];
              const op = picked[o.id] ? Object.values(picked[o.id]).filter(Boolean).length : 0;
              return (
                <button key={o.id} onClick={() => setSelId(o.id)} style={{ width: "100%", textAlign: "left", display: "flex", gap: 13, padding: "15px 18px", borderTop: "1px solid var(--line)", border: "none", borderLeft: active ? "3px solid var(--primary)" : "3px solid transparent", background: active ? "var(--surface-2)" : "transparent", cursor: "pointer", alignItems: "center" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 999, background: active ? "var(--green-600)" : "var(--surface-2)", color: active ? "#fff" : "var(--text-2)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13.5, flexShrink: 0 }}>{o.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.customer}</div>
                    <div style={{ fontSize: 12.5, color: "var(--text-2)", marginTop: 2, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", overflow: "hidden" }}>
                      <Icon name={o.type === "Delivery" ? "truck" : "store"} size={13} /> <span className="mono" style={{ color: "var(--text-3)" }}>{o.id}</span> · {o.items} items · {o.slot.replace("Today · ", "")}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-end" }}>
                    <Pill tone={tone} size="sm">{label}</Pill>
                    {o.picker && <span style={{ fontSize: 11, color: "var(--text-3)" }}>{o.status === "picking" ? "Picking: " : ""}{o.picker}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Detail / picking panel */}
        {sel && (
          <section style={{ ...card(), padding: 0, overflow: "hidden", position: "sticky", top: 92 }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 999, background: "var(--green-600)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{sel.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sel.customer}</h2>
                <p style={{ fontSize: 13, color: "var(--text-2)", margin: "3px 0 0" }}><span className="mono">{sel.id}</span> · Placed {sel.placed} · {G.money(sel.total)}</p>
              </div>
              <Pill tone={statusMeta[sel.status][0]} dot size="sm">{statusMeta[sel.status][1]}</Pill>
            </div>

            {/* meta strip */}
            <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--line)" }}>
              {[[sel.type === "Delivery" ? "truck" : "store", sel.type, sel.address], ["clock", "Slot", sel.slot.replace("Today · ", "")], ["cart", "Items", sel.items + " lines"]].map(([ic, l, v], i) => (
                <div key={i} style={{ flex: 1, padding: "13px 18px", borderLeft: i ? "1px solid var(--line)" : "none", display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "var(--text-3)" }}><Icon name={ic} size={17} /></span>
                  <div style={{ lineHeight: 1.25, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>{l}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* progress */}
            {(sel.status === "picking" || allPicked) && (
              <div style={{ padding: "12px 24px", display: "flex", alignItems: "center", gap: 12, background: "var(--bg-sunken)", borderBottom: "1px solid var(--line)" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Picking progress</span>
                <div style={{ flex: 1, height: 7, background: "var(--surface-2)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ width: (pickedCount / lineItems.length * 100) + "%", height: "100%", background: "var(--primary)", transition: "width .35s var(--ease)" }} />
                </div>
                <span className="tnum" style={{ fontSize: 13, fontWeight: 700, color: "var(--text-2)" }}>{pickedCount}/{lineItems.length}</span>
              </div>
            )}

            {/* line items */}
            <div style={{ maxHeight: 360, overflowY: "auto" }}>
              {lineItems.map((it, idx) => {
                const isPicked = picked[selId]?.[idx];
                const canPick = sel.status === "picking";
                return (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 24px", borderTop: idx ? "1px solid var(--line)" : "none", opacity: isPicked ? 0.6 : 1 }}>
                    <button onClick={() => canPick && togglePick(idx)} disabled={!canPick} style={{ width: 24, height: 24, borderRadius: 7, border: "2px solid", borderColor: isPicked ? "var(--primary)" : "var(--line-strong)", background: isPicked ? "var(--primary)" : "transparent", color: "var(--primary-ink)", cursor: canPick ? "pointer" : "not-allowed", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      {isPicked && <Icon name="check" size={14} stroke={3} />}
                    </button>
                    <ProductSwatch p={it} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text)", textDecoration: isPicked ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{G.catOf(it.cat).name} · {G.money(it.price)}/{it.unit}</div>
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-2)", background: "var(--surface-2)", padding: "3px 9px", borderRadius: 7 }}>Aisle {it.aisle}</span>
                    <span className="tnum" style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", minWidth: 28, textAlign: "right" }}>×{it.qty}</span>
                  </div>
                );
              })}
            </div>

            {/* actions */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--line)", background: "var(--bg-sunken)", display: "flex", gap: 12, alignItems: "center" }}>
              {sel.status === "new" && <React.Fragment>
                <span style={{ flex: 1, fontSize: 13, color: "var(--text-2)" }}>Ready to start picking this order.</span>
                <Btn icon="clipboard" onClick={() => setStatus(sel.id, "picking", "Alex")}>Start picking</Btn>
              </React.Fragment>}
              {sel.status === "picking" && <React.Fragment>
                <span style={{ flex: 1, fontSize: 13, color: allPicked ? "var(--primary)" : "var(--text-2)", fontWeight: allPicked ? 700 : 400 }}>{allPicked ? "All items picked!" : `${lineItems.length - pickedCount} items left to pick`}</span>
                <Btn variant="ghost" onClick={() => setStatus(sel.id, "new", null)}>Pause</Btn>
                <Btn icon="check" onClick={() => setStatus(sel.id, "ready")} style={{ opacity: allPicked ? 1 : 0.5, pointerEvents: allPicked ? "auto" : "none" }}>Mark ready</Btn>
              </React.Fragment>}
              {sel.status === "ready" && <React.Fragment>
                <span style={{ flex: 1, fontSize: 13, color: "var(--text-2)" }}>{sel.type === "Delivery" ? "Hand off to driver." : "Waiting for customer pickup."}</span>
                <Btn icon="check" onClick={() => setStatus(sel.id, "completed")}>{sel.type === "Delivery" ? "Dispatch" : "Complete pickup"}</Btn>
              </React.Fragment>}
              {sel.status === "completed" && <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 9, justifyContent: "center", color: "var(--primary)", fontWeight: 700, fontSize: 14 }}>
                <Icon name="check" size={18} /> Order completed
              </div>}
            </div>
          </section>
        )}
      </div>
    </React.Fragment>
  );
}

Object.assign(window, { FulfillScreen });
