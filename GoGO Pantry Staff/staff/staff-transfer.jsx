/* GoGO Pantry — Stock Transfer between shops (interactive) */

function TransferScreen({ shopId, setRoute }) {
  const [from, setFrom] = useState(shopId);
  const [to, setTo] = useState(G.SHOPS.find(s => s.id !== shopId).id);
  const [cart, setCart] = useState({});  // id -> qty
  const [q, setQ] = useState("");
  const [success, setSuccess] = useState(false);

  const fromShop = G.SHOPS.find(s => s.id === from);
  const toShop = G.SHOPS.find(s => s.id === to);

  const products = useMemo(() => G.PRODUCTS
    .map(p => ({ ...p, fromStock: G.shopStock(p.id, from), toStock: G.shopStock(p.id, to) }))
    .filter(p => p.name.toLowerCase().includes(q.toLowerCase())), [from, to, q]);

  // suggested: items low at destination but healthy at source
  const suggested = products.filter(p => G.stockState(p.toStock, p.par) !== "ok" && p.fromStock > p.par).slice(0, 4);

  const add = (id, max) => setCart(c => ({ ...c, [id]: Math.min((c[id] || 0) + 1, max) }));
  const setQty = (id, v, max) => setCart(c => ({ ...c, [id]: Math.max(0, Math.min(v, max)) }));
  const remove = (id) => setCart(c => { const n = { ...c }; delete n[id]; return n; });

  const lines = Object.entries(cart).filter(([, v]) => v > 0);
  const totalUnits = lines.reduce((s, [, v]) => s + v, 0);

  const swap = () => { setFrom(to); setTo(from); setCart({}); };

  if (success) return <TransferSuccess from={fromShop} to={toShop} units={totalUnits} lines={lines.length} onDone={() => setRoute("dashboard")} onAnother={() => { setSuccess(false); setCart({}); }} />;

  return (
    <React.Fragment>
      <PageHead title="Stock transfer" subtitle="Move inventory between GoGO Pantry locations" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 22, padding: "22px 34px 48px", alignItems: "start", maxWidth: 1480, margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Route selector */}
          <div style={{ ...card(), display: "flex", alignItems: "center", gap: 16 }}>
            <ShopPicker label="From" shop={fromShop} exclude={to} onChange={id => { setFrom(id); setCart({}); }} />
            <button onClick={swap} title="Swap" style={{ width: 42, height: 42, borderRadius: 999, border: "1px solid var(--line)", background: "var(--surface-2)", color: "var(--text-2)", cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 18 }}>
              <Icon name="transfer" size={18} />
            </button>
            <ShopPicker label="To" shop={toShop} exclude={from} onChange={id => { setTo(id); }} />
          </div>

          {/* Suggested */}
          {suggested.length > 0 && (
            <div style={{ ...card(), background: "color-mix(in oklch, var(--amber-500) 8%, var(--surface))", borderColor: "color-mix(in oklch, var(--amber-500) 30%, var(--line))" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                <Icon name="sparkle" size={17} style={{ color: "var(--amber-500)" }} />
                <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", whiteSpace: "nowrap" }}>Suggested transfers</span>
                <span style={{ fontSize: 12.5, color: "var(--text-2)" }}>— low at {toShop.name}, healthy at {fromShop.name}</span>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {suggested.map(p => (
                  <button key={p.id} onClick={() => add(p.id, p.fromStock)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 12px 8px 8px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                    <ProductSwatch p={p} size={26} radius={999} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap" }}>{p.name}</span>
                    <Icon name="plus" size={15} style={{ color: "var(--primary)" }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product table */}
          <section style={{ ...card(), padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}><h2 style={sectionTitle}>Select products</h2></div>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}><Icon name="search" size={16} /></span>
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" style={{ padding: "8px 12px 8px 34px", borderRadius: 9, border: "1px solid var(--line)", background: "var(--bg-sunken)", color: "var(--text)", fontSize: 13, width: 170, outline: "none", fontFamily: "var(--font-sans)" }} />
              </div>
            </div>
            <div style={{ maxHeight: 440, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, background: "var(--surface)", zIndex: 1 }}>
                  <tr>
                    <th style={th}>Product</th>
                    <th style={{ ...th, textAlign: "center" }}>{fromShop.code} stock</th>
                    <th style={{ ...th, textAlign: "center" }}>{toShop.code} stock</th>
                    <th style={{ ...th, textAlign: "right" }}>Transfer qty</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => {
                    const inCart = cart[p.id] || 0;
                    return (
                      <tr key={p.id} style={{ borderTop: "1px solid var(--line)", background: inCart ? "color-mix(in oklch, var(--green-500) 6%, transparent)" : "transparent" }}>
                        <td style={td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                            <ProductSwatch p={p} size={34} />
                            <div style={{ lineHeight: 1.3, minWidth: 0, flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                              <div style={{ fontSize: 11.5, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{G.catOf(p.cat).name}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ ...td, textAlign: "center" }}><span className="tnum" style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text)" }}>{p.fromStock}</span></td>
                        <td style={{ ...td, textAlign: "center" }}>
                          <Pill tone={G.stockState(p.toStock, p.par)} size="sm">{p.toStock}</Pill>
                        </td>
                        <td style={{ ...td, textAlign: "right" }}>
                          {inCart > 0
                            ? <div style={{ display: "inline-flex" }}><Stepper value={inCart} onChange={v => setQty(p.id, v, p.fromStock)} /></div>
                            : <Btn size="sm" variant="soft" icon="plus" onClick={() => add(p.id, p.fromStock)}>Add</Btn>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Transfer summary */}
        <aside style={{ ...card(), padding: 0, position: "sticky", top: 92, overflow: "hidden" }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--line)" }}>
            <h2 style={sectionTitle}>Transfer manifest</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 13, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap" }}>{fromShop.name}</span>
              <Icon name="chevR" size={14} style={{ color: "var(--text-3)" }} />
              <span style={{ fontWeight: 700, color: "var(--primary)", whiteSpace: "nowrap" }}>{toShop.name}</span>
            </div>
          </div>
          <div style={{ maxHeight: 340, overflowY: "auto" }}>
            {lines.length === 0
              ? <div style={{ padding: "44px 20px", textAlign: "center", color: "var(--text-3)" }}>
                  <Icon name="box" size={30} style={{ opacity: 0.5 }} />
                  <p style={{ fontSize: 13.5, margin: "10px 0 0" }}>No items added yet.<br />Pick products to transfer.</p>
                </div>
              : lines.map(([id, qty]) => {
                const p = G.PRODUCTS.find(x => x.id === id);
                return (
                  <div key={id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 20px", borderTop: "1px solid var(--line)" }}>
                    <ProductSwatch p={p} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                      <div className="tnum" style={{ fontSize: 12, color: "var(--text-3)" }}>{qty} {p.unit}</div>
                    </div>
                    <button onClick={() => remove(id)} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", padding: 4 }}><Icon name="x" size={16} /></button>
                  </div>
                );
              })}
          </div>
          <div style={{ padding: 20, borderTop: "1px solid var(--line)", background: "var(--bg-sunken)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 14, color: "var(--text-2)" }}>{lines.length} products · {totalUnits} units</span>
            </div>
            <Btn full icon="transfer" onClick={() => setSuccess(true)} style={{ opacity: lines.length ? 1 : 0.5, pointerEvents: lines.length ? "auto" : "none" }}>Submit transfer</Btn>
          </div>
        </aside>
      </div>
    </React.Fragment>
  );
}

function ShopPicker({ label, shop, exclude, onChange }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", marginBottom: 6, letterSpacing: "0.03em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 26, height: 26, borderRadius: 7, background: `oklch(0.6 0.13 ${shop.tint})`, color: "#fff", display: "grid", placeItems: "center", pointerEvents: "none" }}><Icon name="pin" size={14} /></span>
        <select value={shop.id} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "12px 36px 12px 48px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", fontSize: 14.5, fontWeight: 700, appearance: "none", cursor: "pointer", fontFamily: "var(--font-sans)", outline: "none" }}>
          {G.SHOPS.filter(s => s.id !== exclude).map(s => <option key={s.id} value={s.id}>{s.name} · {s.code}</option>)}
        </select>
        <span style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-3)" }}><Icon name="chevD" size={16} /></span>
      </div>
    </div>
  );
}

function TransferSuccess({ from, to, units, lines, onDone, onAnother }) {
  return (
    <div style={{ display: "grid", placeItems: "center", padding: 40, minHeight: "calc(100vh - 0px)" }}>
      <div style={{ ...card(), maxWidth: 460, width: "100%", textAlign: "center", padding: 40 }}>
        <div style={{ width: 76, height: 76, borderRadius: 999, background: "var(--green-100)", color: "var(--green-700)", display: "grid", placeItems: "center", margin: "0 auto 22px", animation: "gg-pop .4s var(--ease)" }}>
          <Icon name="transfer" size={36} stroke={2.4} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", color: "var(--text)" }}>Transfer submitted</h2>
        <p style={{ color: "var(--text-2)", margin: "0 0 24px", fontSize: 15, lineHeight: 1.5 }}>
          {units} units across {lines} products are en route from <strong style={{ color: "var(--text)" }}>{from.name}</strong> to <strong style={{ color: "var(--text)" }}>{to.name}</strong>. The receiving store has been notified.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <Btn variant="ghost" full onClick={onAnother}>New transfer</Btn>
          <Btn full icon="dashboard" onClick={onDone}>Back to dashboard</Btn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TransferScreen });
