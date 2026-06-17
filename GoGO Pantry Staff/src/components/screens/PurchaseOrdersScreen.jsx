import { useState, useEffect, useMemo, useRef } from 'react';
import { G, API_BASE, apiFetch } from '../../globals.js';
import { PageHead, ProductSwatch, Pill, Btn, card, sectionTitle, th, td, inputStyle, linkBtn } from '../ui.jsx';
import { Icon } from '../icons.jsx';

const STATUS_TABS = ['all', 'draft', 'ordered', 'in_transit', 'arrived', 'received'];
const STATUS_LABEL = { draft: 'Draft', ordered: 'Ordered', in_transit: 'In transit', arrived: 'Arrived', received: 'Received' };
const STATUS_TONE = { draft: 'neutral', ordered: 'info', in_transit: 'info', arrived: 'ok', received: 'neutral' };
const NEXT_STATUS = { draft: 'ordered', ordered: 'in_transit', in_transit: 'arrived' };

function fmtDate(s) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Detail panel ──────────────────────────────────────────────────────────────
function PoDetail({ po, onClose, onStatusUpdate, onReceive }) {
  const [updating, setUpdating] = useState(false);
  const next = NEXT_STATUS[po.status];
  const grandTotal = (po.lineItems || []).reduce((s, l) => s + (parseFloat(l.unitCost) || 0) * (l.orderedQty || 0), 0);

  async function advance() {
    setUpdating(true);
    await onStatusUpdate(po.id, next);
    setUpdating(false);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }} onClick={onClose}>
      <div style={{ width: 480, background: 'var(--surface)', height: '100%', overflow: 'auto', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span className="mono" style={{ fontWeight: 800, fontSize: 16 }}>{po.id}</span>
              <Pill tone={STATUS_TONE[po.status]} dot size="sm">{STATUS_LABEL[po.status]}</Pill>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{po.Supplier?.name || '—'} · {po.Shop?.name || po.shopId}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-3)', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 3 }}>ETA</div><div style={{ fontWeight: 700 }}>{fmtDate(po.eta)}</div></div>
          <div><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 3 }}>Created</div><div style={{ fontWeight: 700 }}>{fmtDate(po.createdAt)}</div></div>
          <div><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 3 }}>Lines</div><div style={{ fontWeight: 700 }}>{po.lineItems?.length || 0}</div></div>
          <div><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 3 }}>Total value</div><div style={{ fontWeight: 700 }}>${grandTotal.toFixed(2)}</div></div>
          <div><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 3 }}>Contact</div><div style={{ fontWeight: 700, fontSize: 13 }}>{po.Supplier?.contactName || '—'}</div></div>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
              <tr>
                <th style={th}>Product</th>
                <th style={{ ...th, textAlign: 'center' }}>Ordered</th>
                <th style={{ ...th, textAlign: 'center' }}>Received</th>
                <th style={{ ...th, textAlign: 'right' }}>Unit cost</th>
                <th style={{ ...th, textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(po.lineItems || []).map((l, i) => {
                const lineTotal = (parseFloat(l.unitCost) || 0) * (l.orderedQty || 0);
                return (
                  <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ProductSwatch p={{ name: l.productName || '', cat: G.PRODUCTS.find(p => p.id === l.productId)?.cat || '' }} size={30} />
                        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{l.productName}</span>
                      </div>
                    </td>
                    <td style={{ ...td, textAlign: 'center', fontWeight: 700 }}>{l.orderedQty}</td>
                    <td style={{ ...td, textAlign: 'center', color: l.receivedQty > 0 ? 'var(--green-700)' : 'var(--text-3)' }}>{l.receivedQty ?? '—'}</td>
                    <td style={{ ...td, textAlign: 'right', fontSize: 13 }}>{l.unitCost ? `$${parseFloat(l.unitCost).toFixed(2)}` : '—'}</td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{lineTotal > 0 ? `$${lineTotal.toFixed(2)}` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--line)', display: 'flex', gap: 10 }}>
          {po.status === 'arrived'
            ? <Btn full icon="box" onClick={() => onReceive(po.id)}>Receive stock</Btn>
            : next
              ? <Btn full onClick={advance} style={{ opacity: updating ? 0.7 : 1 }}>{updating ? 'Updating…' : `Advance to ${STATUS_LABEL[next]}`}</Btn>
              : <div style={{ flex: 1, fontSize: 13, color: 'var(--text-3)', display: 'flex', alignItems: 'center' }}>PO is {po.status === 'received' ? 'fully received' : 'complete'}.</div>
          }
        </div>
      </div>
    </div>
  );
}

// ── Create wizard ─────────────────────────────────────────────────────────────
function CreateWizard({ suppliers, user, onDone, onCancel }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ supplierId: '', shopId: user?.shopId || (G.SHOPS[0]?.id || ''), eta: '' });
  const [lineItems, setLineItems] = useState([]);
  const [q, setQ] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');
  const [products, setProducts] = useState(G.PRODUCTS);
  const [shopInventory, setShopInventory] = useState([]);
  const inventoryFetched = useRef('');

  const isAdmin = user?.userType === 'admin';

  // Fetch fresh product list on mount
  useEffect(() => {
    apiFetch(`${API_BASE}/products`).then(r => r?.ok && r.json()).then(d => {
      if (d) setProducts(d.map(p => ({ ...p, cat: p.categoryId || p.cat || '' })));
    }).catch(() => {});
  }, []);

  // Fetch shop inventory when entering step 2
  useEffect(() => {
    if (step !== 2 || !form.shopId || inventoryFetched.current === form.shopId) return;
    inventoryFetched.current = form.shopId;
    apiFetch(`${API_BASE}/shops/${form.shopId}/inventory`).then(r => r?.ok && r.json()).then(d => {
      if (d) setShopInventory(d);
    }).catch(() => {});
  }, [step, form.shopId]);

  const filteredProducts = useMemo(() => products.filter(p => p.name.toLowerCase().includes(q.toLowerCase())), [q, products]);
  const totalCost = lineItems.reduce((s, l) => s + (l.orderedQty * (parseFloat(l.unitCost) || 0)), 0);

  function addProduct(p) {
    if (lineItems.find(l => l.productId === p.id)) return;
    setLineItems(ls => [...ls, { productId: p.id, productName: p.name, orderedQty: 1, unitCost: '' }]);
  }

  function updateLine(idx, field, val) {
    setLineItems(ls => ls.map((l, i) => i === idx ? { ...l, [field]: val } : l));
  }

  async function handleSubmit(submitAs = 'draft') {
    setSubmitting(true);
    setErr('');
    try {
      const payload = {
        supplierId: form.supplierId,
        shopId: form.shopId,
        eta: form.eta || null,
        status: submitAs,
        lineItems: lineItems.map(l => ({ ...l, orderedQty: parseInt(l.orderedQty) || 1, unitCost: parseFloat(l.unitCost) || 0 })),
      };
      const res = await apiFetch(`${API_BASE}/purchase-orders`, { method: 'POST', body: JSON.stringify(payload) });
      if (!res || !res.ok) { const d = await res?.json(); setErr(d?.error || 'Failed to create PO'); return; }
      onDone();
    } catch { setErr('Network error'); }
    finally { setSubmitting(false); }
  }

  const selStyle = { ...inputStyle, marginTop: 0 };

  return (
    <div style={{ flex: 1, padding: '22px 34px 48px', overflowY: 'auto' }}>
      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 28 }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: step >= s ? 'var(--primary)' : 'var(--surface-2)', color: step >= s ? 'white' : 'var(--text-3)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13 }}>{s}</div>
            <span style={{ fontSize: 13.5, fontWeight: step === s ? 700 : 500, color: step === s ? 'var(--text)' : 'var(--text-3)' }}>
              {s === 1 ? 'Details' : s === 2 ? 'Line items' : 'Review'}
            </span>
            {s < 3 && <Icon name="chevR" size={16} style={{ color: 'var(--text-3)' }} />}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <Btn variant="ghost" size="sm" onClick={onCancel}>Cancel</Btn>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div style={{ ...card(), maxWidth: 520 }}>
          <h2 style={{ ...sectionTitle, marginBottom: 20 }}>Order details</h2>
          <label style={{ display: 'block', marginBottom: 14 }}>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Supplier *</span>
            <select value={form.supplierId} onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))} style={selStyle}>
              <option value="">Select supplier…</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          {isAdmin && (
            <label style={{ display: 'block', marginBottom: 14 }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Shop *</span>
              <select value={form.shopId} onChange={e => setForm(f => ({ ...f, shopId: e.target.value }))} style={selStyle}>
                {G.SHOPS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
          )}
          <label style={{ display: 'block', marginBottom: 24 }}>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Expected delivery (ETA)</span>
            <input type="date" value={form.eta} onChange={e => setForm(f => ({ ...f, eta: e.target.value }))} style={selStyle} />
          </label>
          <Btn full onClick={() => { if (!form.supplierId || !form.shopId) { setErr('Please select a supplier and shop'); return; } setErr(''); setStep(2); }} icon="chevR">
            Next: Add items
          </Btn>
          {err && <div style={{ color: 'var(--red-500)', fontSize: 13, marginTop: 10, fontWeight: 600 }}>{err}</div>}
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
          <section style={{ ...card(), padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 10, alignItems: 'center' }}>
              <h2 style={{ ...sectionTitle, flex: 1 }}>Products</h2>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}><Icon name="search" size={15} /></span>
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" style={{ padding: '7px 12px 7px 30px', borderRadius: 9, border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, width: 160, outline: 'none', fontFamily: 'var(--font-sans)' }} />
              </div>
            </div>
            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
                  <tr><th style={th}>Product</th><th style={th}>Category</th><th style={{ ...th, textAlign: 'center' }}>Stock</th><th style={{ ...th, textAlign: 'right' }}></th></tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => {
                    const added = !!lineItems.find(l => l.productId === p.id);
                    const inv = shopInventory.find(i => i.productId === p.id);
                    const stockLabel = inv ? (inv.tracked ? `${inv.stock} / ${inv.par}` : 'Not set up') : '—';
                    const stockColor = !inv || !inv.tracked ? 'var(--text-3)' : inv.stock < inv.par ? 'var(--amber-600, #d97706)' : 'var(--green-700)';
                    return (
                      <tr key={p.id} style={{ borderTop: '1px solid var(--line)', background: added ? 'color-mix(in oklch, var(--primary) 6%, transparent)' : 'transparent' }}>
                        <td style={td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <ProductSwatch p={p} size={30} />
                            <span style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</span>
                          </div>
                        </td>
                        <td style={{ ...td, fontSize: 13, color: 'var(--text-3)' }}>{G.catOf(p.cat).name}</td>
                        <td style={{ ...td, textAlign: 'center', fontSize: 12, fontWeight: 600, color: stockColor }}>{stockLabel}</td>
                        <td style={{ ...td, textAlign: 'right' }}>
                          {added
                            ? <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>Added ✓</span>
                            : <Btn size="sm" variant="soft" icon="plus" onClick={() => addProduct(p)}>Add</Btn>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <aside style={{ ...card(), padding: 0, overflow: 'hidden', position: 'sticky', top: 92 }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)' }}>
              <h2 style={sectionTitle}>Order lines ({lineItems.length})</h2>
            </div>
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {lineItems.length === 0
                ? <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>No items added yet</div>
                : lineItems.map((l, i) => (
                  <div key={l.productId} style={{ padding: '12px 16px', borderTop: i > 0 ? '1px solid var(--line)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <ProductSwatch p={{ name: l.productName, cat: G.PRODUCTS.find(p => p.id === l.productId)?.cat || '' }} size={28} />
                      <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{l.productName}</span>
                      <button onClick={() => setLineItems(ls => ls.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2 }}><Icon name="x" size={14} /></button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>Qty</div>
                        <input type="number" min="1" value={l.orderedQty} onChange={e => updateLine(i, 'orderedQty', e.target.value)} style={{ ...inputStyle, padding: '6px 8px', fontSize: 13 }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>Unit cost ($)</div>
                        <input type="number" min="0" step="0.01" value={l.unitCost} onChange={e => updateLine(i, 'unitCost', e.target.value)} style={{ ...inputStyle, padding: '6px 8px', fontSize: 13 }} placeholder="0.00" />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <div style={{ padding: '14px 18px', borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
              {lineItems.length > 0 && <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 10 }}>Est. total: <strong>${totalCost.toFixed(2)}</strong></div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="ghost" size="sm" onClick={() => setStep(1)}>Back</Btn>
                <Btn size="sm" full onClick={() => { if (lineItems.length === 0) { setErr('Add at least one item'); return; } setErr(''); setStep(3); }}>Review →</Btn>
              </div>
              {err && <div style={{ color: 'var(--red-500)', fontSize: 12, marginTop: 8, fontWeight: 600 }}>{err}</div>}
            </div>
          </aside>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div style={{ maxWidth: 560 }}>
          <div style={{ ...card(), marginBottom: 16 }}>
            <h2 style={{ ...sectionTitle, marginBottom: 14 }}>Order summary</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 3 }}>Supplier</div><div style={{ fontWeight: 700 }}>{suppliers.find(s => s.id === form.supplierId)?.name}</div></div>
              <div><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 3 }}>Shop</div><div style={{ fontWeight: 700 }}>{G.SHOPS.find(s => s.id === form.shopId)?.name}</div></div>
              <div><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 3 }}>ETA</div><div style={{ fontWeight: 700 }}>{form.eta ? new Date(form.eta).toLocaleDateString() : 'Not set'}</div></div>
              <div><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 3 }}>Lines</div><div style={{ fontWeight: 700 }}>{lineItems.length} items · ${totalCost.toFixed(2)}</div></div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr style={{ background: 'var(--surface-2)' }}><th style={th}>Product</th><th style={{ ...th, textAlign: 'right' }}>Qty</th><th style={{ ...th, textAlign: 'right' }}>Unit cost</th><th style={{ ...th, textAlign: 'right' }}>Total</th></tr></thead>
              <tbody>
                {lineItems.map((l, i) => {
                  const lineTotal = (parseFloat(l.unitCost) || 0) * (parseInt(l.orderedQty) || 0);
                  return (
                    <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                      <td style={td}>{l.productName}</td>
                      <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{l.orderedQty}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{l.unitCost ? `$${parseFloat(l.unitCost).toFixed(2)}` : '—'}</td>
                      <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{lineTotal > 0 ? `$${lineTotal.toFixed(2)}` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {err && <div style={{ color: 'var(--red-500)', fontSize: 13, marginBottom: 12, fontWeight: 600 }}>{err}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variant="ghost" onClick={() => setStep(2)}>Back</Btn>
            <Btn variant="soft" onClick={() => handleSubmit('draft')} style={{ opacity: submitting ? 0.7 : 1 }}>Save as draft</Btn>
            <Btn full icon="package" onClick={() => handleSubmit('ordered')} style={{ opacity: submitting ? 0.7 : 1 }}>{submitting ? 'Creating PO…' : 'Submit to supplier'}</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function PurchaseOrdersScreen({ shopId, setRoute, user }) {
  const [pos, setPos] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPo, setSelectedPo] = useState(null);
  const [wizard, setWizard] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  async function load() {
    setLoading(true);
    try {
      const isAdmin = user?.userType === 'admin';
      const poUrl = isAdmin ? `${API_BASE}/purchase-orders` : `${API_BASE}/purchase-orders?shopId=${shopId}`;
      const [posRes, supRes] = await Promise.all([
        apiFetch(poUrl),
        apiFetch(`${API_BASE}/suppliers`),
      ]);
      if (posRes?.ok) setPos(await posRes.json());
      if (supRes?.ok) setSuppliers(await supRes.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [shopId]);

  async function handleStatusUpdate(poId, newStatus) {
    const res = await apiFetch(`${API_BASE}/purchase-orders/${poId}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
    if (res?.ok) {
      setPos(ps => ps.map(p => p.id === poId ? { ...p, status: newStatus } : p));
      setSelectedPo(sp => sp ? { ...sp, status: newStatus } : sp);
    }
  }

  function handleReceive() {
    setSelectedPo(null);
    setRoute('receive');
  }

  function handleWizardDone() {
    setWizard(false);
    setSuccessMsg('Purchase order created successfully.');
    load();
    setTimeout(() => setSuccessMsg(''), 4000);
  }

  const filtered = statusFilter === 'all' ? pos : pos.filter(p => p.status === statusFilter);
  const openCount = pos.filter(p => p.status !== 'received').length;

  const tabStyle = (active) => ({
    padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)',
    fontWeight: 700, fontSize: 13, background: active ? 'var(--primary)' : 'transparent',
    color: active ? 'white' : 'var(--text-2)',
  });

  if (wizard) {
    return (
      <>
        <PageHead title="Create Purchase Order" subtitle="New order to supplier" />
        <CreateWizard suppliers={suppliers} user={user} onDone={handleWizardDone} onCancel={() => setWizard(false)} />
      </>
    );
  }

  return (
    <>
      <PageHead title="Purchase Orders" subtitle={loading ? 'Loading…' : `${openCount} open · ${pos.filter(p => p.status === 'received').length} received`}>
        <Btn size="sm" icon="plus" onClick={() => setWizard(true)}>Create PO</Btn>
      </PageHead>

      <div style={{ flex: 1, padding: '22px 34px 48px', overflowY: 'auto' }}>
        {successMsg && (
          <div style={{ background: 'var(--green-100)', color: 'var(--green-700)', padding: '12px 18px', borderRadius: 10, marginBottom: 16, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="check" size={16} /> {successMsg}
          </div>
        )}

        <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
          {STATUS_TABS.map(s => (
            <button key={s} style={tabStyle(statusFilter === s)} onClick={() => setStatusFilter(s)}>
              {s === 'all' ? `All (${pos.length})` : `${STATUS_LABEL[s]} (${pos.filter(p => p.status === s).length})`}
            </button>
          ))}
        </div>

        <section style={{ ...card(), padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-3)' }}>Loading purchase orders…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-3)' }}>
              <Icon name="package" size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>No purchase orders</div>
              <Btn size="sm" icon="plus" onClick={() => setWizard(true)}>Create your first PO</Btn>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
                <tr>
                  <th style={th}>PO #</th>
                  <th style={th}>Supplier</th>
                  <th style={th}>Shop</th>
                  <th style={{ ...th, textAlign: 'center' }}>Lines</th>
                  <th style={th}>ETA</th>
                  <th style={th}>Status</th>
                  <th style={{ ...th, textAlign: 'right' }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(po => (
                  <tr key={po.id} style={{ borderTop: '1px solid var(--line)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={td}><span className="mono" style={{ fontWeight: 700 }}>{po.id}</span></td>
                    <td style={{ ...td, fontWeight: 600 }}>{po.Supplier?.name || '—'}</td>
                    <td style={{ ...td, fontSize: 13, color: 'var(--text-2)' }}>{po.Shop?.name || po.shopId}</td>
                    <td style={{ ...td, textAlign: 'center', fontWeight: 700 }}>{po.lineItems?.length || 0}</td>
                    <td style={{ ...td, fontSize: 13 }}>{fmtDate(po.eta)}</td>
                    <td style={td}><Pill tone={STATUS_TONE[po.status]} dot size="sm">{STATUS_LABEL[po.status]}</Pill></td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <button style={linkBtn} onClick={() => setSelectedPo(po)}>View <Icon name="chevR" size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      {selectedPo && (
        <PoDetail
          po={selectedPo}
          onClose={() => setSelectedPo(null)}
          onStatusUpdate={handleStatusUpdate}
          onReceive={handleReceive}
        />
      )}
    </>
  );
}
