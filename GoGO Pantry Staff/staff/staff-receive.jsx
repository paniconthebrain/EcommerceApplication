/* GoGO Pantry — Receive Stock from Supplier (interactive PO check-in) */

function ReceiveScreen({ shopId, setRoute }) {
  const [poId, setPoId] = useState("PO-2206"); // arrived one selected by default
  const po = G.DELIVERIES.find(d => d.id === poId);
  const sup = G.supplierOf(po.supplier);

  // Build line items from products of supplier's category-ish (use supplier match)
  const lines = useMemo(() => {
    const items = G.PRODUCTS.filter(p => p.supplier === po.supplier).slice(0, po.items);
    return items.map(p => ({
      ...p, stock: G.shopStock(p.id, shopId),
      expected: 6 + ((p.id.charCodeAt(2) * 3) % 18),
    }));
  }, [poId, shopId]);

  const [recv, setRecv] = useState({});   // id -> received qty
  const [done, setDone] = useState({});    // id -> checked
  const [success, setSuccess] = useState(false);

  useEffect(() => { setRecv({}); setDone({}); setSuccess(false); }, [poId]);

  const setQty = (id, exp, v) => setRecv(r => ({ ...r, [id]: Math.max(0, v) }));
  const toggle = (id, exp) => setDone(d => {
    const nd = { ...d, [id]: !d[id] };
    if (!d[id] && recv[id] == null) setRecv(r => ({ ...r, [id]: exp }));
    return nd;
  });

  const checkedCount = lines.filter(l => done[l.id]).length;
  const totalUnits = lines.reduce((s, l) => s + (done[l.id] ? (recv[l.id] ?? l.expected) : 0), 0);
  const discrepancies = lines.filter(l => done[l.id] && (recv[l.id] ?? l.expected) !== l.expected).length;
  const progress = Math.round((checkedCount / lines.length) * 100);

  if (success) return <ReceiveSuccess sup={sup} po={po} units={totalUnits} lines={checkedCount} onDone={() => setRoute("dashboard")} onAnother={() => { setSuccess(false); setPoId(po.id); }} />;

  return (
    <React.Fragment>
      <PageHead title="Receive stock" subtitle="Check in a supplier delivery against its purchase order">
        <Btn variant="ghost" size="sm" icon="scan">Scan mode</Btn>
      </PageHead>
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 22, padding: "22px 34px 48px", maxWidth: 1480, margin: "0 auto", width: "100%" }}>
        {/* PO list */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-3)" }}>Incoming POs</div>
          {G.DELIVERIES.map(d => {
            const s = G.supplierOf(d.supplier);
            const active = d.id === poId;
            return (
              <button key={d.id} onClick={() => setPoId(d.id)} style={{ textAlign: "left", padding: 15, borderRadius: 14, border: "1px solid", borderColor: active ? "var(--primary)" : "var(--line)", background: active ? "var(--surface)" : "var(--bg-sunken)", cursor: "pointer", boxShadow: active ? "var(--shadow-md)" : "none", transition: "all .15s var(--ease)", position: "relative" }}>
                {active && <span style={{ position: "absolute", left: 0, top: 14, bottom: 14, width: 3, background: "var(--primary)", borderRadius: 999 }} />}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{d.id}</span>
                  <Pill tone={d.status === "arrived" ? "ok" : d.status === "in-transit" ? "info" : "neutral"} dot size="sm">{d.status === "arrived" ? "Arrived" : d.status === "in-transit" ? "In transit" : "Scheduled"}</Pill>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{s.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>{d.items} lines · {d.eta}</div>
              </button>
            );
          })}
        </aside>

        {/* Check-in panel */}
        <section style={{ ...card(), padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ width: 48, height: 48, borderRadius: 13, background: "var(--green-100)", color: "var(--green-700)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="truck" size={24} /></span>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "var(--text)" }}>{sup.name}</h2>
              <p style={{ fontSize: 13, color: "var(--text-2)", margin: "2px 0 0" }}><span className="mono">{po.id}</span> · {sup.type} · Lead time {sup.lead} · {po.eta}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="tnum" style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>{checkedCount}<span style={{ color: "var(--text-3)", fontWeight: 600 }}>/{lines.length}</span></div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>lines received</div>
            </div>
          </div>
          {/* progress */}
          <div style={{ height: 4, background: "var(--surface-2)" }}><div style={{ width: progress + "%", height: "100%", background: "var(--primary)", transition: "width .4s var(--ease)" }} /></div>

          <div style={{ maxHeight: 430, overflowY: "auto" }}>
            {lines.map(l => {
              const checked = !!done[l.id];
              const qty = recv[l.id] ?? l.expected;
              const diff = qty - l.expected;
              return (
                <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 24px", borderTop: "1px solid var(--line)", background: checked ? "color-mix(in oklch, var(--green-500) 7%, transparent)" : "transparent", transition: "background .2s" }}>
                  <button onClick={() => toggle(l.id, l.expected)} style={{ width: 26, height: 26, borderRadius: 8, border: "2px solid", borderColor: checked ? "var(--primary)" : "var(--line-strong)", background: checked ? "var(--primary)" : "transparent", color: "var(--primary-ink)", cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0, transition: "all .15s" }}>
                    {checked && <Icon name="check" size={16} stroke={3} />}
                  </button>
                  <ProductSwatch p={l} size={40} />
                  <div style={{ flex: 1, minWidth: 0, lineHeight: 1.3 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><span className="mono">{l.id.toUpperCase()}</span> · on hand {l.stock} {l.unit}</div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: 70 }}>
                    <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 2 }}>Expected</div>
                    <div className="tnum" style={{ fontSize: 15, fontWeight: 700, color: "var(--text-2)" }}>{l.expected}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Stepper value={qty} onChange={v => setQty(l.id, l.expected, v)} disabled={!checked} />
                  </div>
                  <div style={{ minWidth: 64, textAlign: "right" }}>
                    {checked && diff !== 0
                      ? <Pill tone={diff < 0 ? "low" : "info"} size="sm">{diff > 0 ? "+" : ""}{diff}</Pill>
                      : checked ? <Icon name="check" size={16} style={{ color: "var(--primary)" }} /> : <span style={{ fontSize: 12, color: "var(--text-3)" }}>—</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* footer */}
          <div style={{ padding: "16px 24px", borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 16, background: "var(--bg-sunken)" }}>
            <div style={{ flex: 1, display: "flex", gap: 24 }}>
              <Stat label="Units in" value={totalUnits} />
              <Stat label="Discrepancies" value={discrepancies} tone={discrepancies ? "warn" : "ok"} />
            </div>
            <Btn variant="ghost" onClick={() => { setRecv({}); setDone({}); }}>Reset</Btn>
            <Btn icon="check" onClick={() => setSuccess(true)} style={{ opacity: checkedCount ? 1 : 0.5, pointerEvents: checkedCount ? "auto" : "none" }}>Confirm & add to stock</Btn>
          </div>
        </section>
      </div>
    </React.Fragment>
  );
}

function Stepper({ value, onChange, disabled }) {
  return (
    <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line)", borderRadius: 9, overflow: "hidden", opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? "none" : "auto", background: "var(--surface)" }}>
      <button onClick={() => onChange(value - 1)} style={stepBtn}><Icon name="minus" size={15} /></button>
      <input value={value} onChange={e => onChange(parseInt(e.target.value || "0"))} className="tnum" style={{ width: 40, textAlign: "center", border: "none", background: "transparent", color: "var(--text)", fontSize: 14, fontWeight: 700, outline: "none", fontFamily: "var(--font-sans)" }} />
      <button onClick={() => onChange(value + 1)} style={stepBtn}><Icon name="plus" size={15} /></button>
    </div>
  );
}
const stepBtn = { width: 30, height: 32, border: "none", background: "transparent", color: "var(--text-2)", cursor: "pointer", display: "grid", placeItems: "center" };

function Stat({ label, value, tone }) {
  const color = tone === "warn" ? "var(--amber-500)" : tone === "ok" ? "var(--primary)" : "var(--text)";
  return (
    <div>
      <div className="tnum" style={{ fontSize: 19, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text-3)" }}>{label}</div>
    </div>
  );
}

function ReceiveSuccess({ sup, po, units, lines, onDone, onAnother }) {
  return (
    <div style={{ display: "grid", placeItems: "center", padding: 40, minHeight: "calc(100vh - 0px)" }}>
      <div style={{ ...card(), maxWidth: 460, width: "100%", textAlign: "center", padding: 40 }}>
        <div style={{ width: 76, height: 76, borderRadius: 999, background: "var(--green-100)", color: "var(--green-700)", display: "grid", placeItems: "center", margin: "0 auto 22px", animation: "gg-pop .4s var(--ease)" }}>
          <Icon name="check" size={40} stroke={3} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", color: "var(--text)" }}>Stock received</h2>
        <p style={{ color: "var(--text-2)", margin: "0 0 24px", fontSize: 15, lineHeight: 1.5 }}>
          <span className="mono">{po.id}</span> from {sup.name} is checked in. Inventory has been updated across the floor.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 28 }}>
          <div style={{ flex: 1, padding: 16, borderRadius: 13, background: "var(--bg-sunken)" }}>
            <div className="tnum" style={{ fontSize: 26, fontWeight: 800, color: "var(--text)" }}>{units}</div>
            <div style={{ fontSize: 12.5, color: "var(--text-3)" }}>units added</div>
          </div>
          <div style={{ flex: 1, padding: 16, borderRadius: 13, background: "var(--bg-sunken)" }}>
            <div className="tnum" style={{ fontSize: 26, fontWeight: 800, color: "var(--text)" }}>{lines}</div>
            <div style={{ fontSize: 12.5, color: "var(--text-3)" }}>lines received</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Btn variant="ghost" full onClick={onAnother}>Receive another</Btn>
          <Btn full icon="dashboard" onClick={onDone}>Back to dashboard</Btn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ReceiveScreen, Stepper, Stat });
