import { useState, useEffect, useMemo, useRef } from 'react';
import { G, API_BASE, apiFetch } from '../../globals.js';
import { PageHead, ProductSwatch, Pill, StockBar, Btn, card, sectionTitle, th, td, inputStyle } from '../ui.jsx';
import { Icon } from '../icons.jsx';

const STATUS_LABEL = { ok: 'In stock', low: 'Low', critical: 'Critical', out: 'Out of stock', untracked: 'Not set up' };
const STATUS_SORT = { out: 0, critical: 1, low: 2, ok: 3, untracked: 4 };

function AdjustModal({ item, shopId, onClose, onSaved }) {
  const isSetup = item.tracked === false;
  const [form, setForm] = useState({
    action: 'set',
    stock: '',
    par: isSetup ? String(item.par ?? '') : String(item.par ?? ''),
    reason: '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const qty = parseInt(form.stock);
    if (isNaN(qty) || qty < 0) { setErr('Enter a valid quantity'); return; }
    if (isSetup && (!form.par || parseInt(form.par) <= 0)) { setErr('Par level is required'); return; }
    setSaving(true);
    setErr('');
    const action = isSetup ? 'set' : form.action;
    const body = { action, stock: qty, reason: form.reason || null };
    if (form.par) body.par = parseInt(form.par);
    try {
      const res = await apiFetch(`${API_BASE}/shops/${shopId}/inventory/${item.productId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      if (!res || !res.ok) { const d = await res?.json(); setErr(d?.error || 'Failed to save'); return; }
      onSaved();
    } catch { setErr('Network error'); }
    finally { setSaving(false); }
  }

  const mouseDownOnBackdrop = useRef(false);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'grid', placeItems: 'center', padding: 20 }}
      onMouseDown={e => { mouseDownOnBackdrop.current = e.target === e.currentTarget; }}
      onClick={() => { if (mouseDownOnBackdrop.current) onClose(); }}>
      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420, border: '1px solid var(--line)', boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{isSetup ? 'Set up inventory' : 'Adjust stock'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-3)', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 10 }}>
          <ProductSwatch p={{ name: item.product?.name || '', cat: item.product?.categoryId || '' }} size={38} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{item.product?.name}</div>
            {!isSetup && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Current stock: <strong>{item.stock}</strong> · Par: {item.par}</div>}
            {isSetup && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Opening stock entry — initialises this product at this shop</div>}
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          {!isSetup && (
            <label style={{ display: 'block', marginBottom: 14 }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Action</span>
              <select value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value }))} style={{ ...inputStyle }}>
                <option value="set">Set to exact amount</option>
                <option value="add">Add to stock</option>
                <option value="subtract">Subtract from stock</option>
              </select>
            </label>
          )}
          <label style={{ display: 'block', marginBottom: 14 }}>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>{isSetup ? 'Opening quantity on hand *' : 'Quantity *'}</span>
            <input type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" required style={{ ...inputStyle }} />
          </label>
          <label style={{ display: 'block', marginBottom: 14 }}>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 2 }}>{isSetup ? 'Par level for this shop *' : 'Par level (reorder point)'}</span>
            {isSetup && <span style={{ display: 'block', fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>Pre-filled from product default — adjust per shop if needed</span>}
            <input type="number" min="1" value={form.par} onChange={e => setForm(f => ({ ...f, par: e.target.value }))} placeholder={isSetup ? 'e.g. 10' : 'Leave blank to keep current'} required={isSetup} style={{ ...inputStyle }} />
          </label>
          {!isSetup && (
            <label style={{ display: 'block', marginBottom: 14 }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Reason (optional)</span>
              <input type="text" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="e.g. recount, waste, damage…" style={{ ...inputStyle }} />
            </label>
          )}
          {err && <div style={{ color: 'var(--red-500)', fontSize: 13, marginBottom: 12, fontWeight: 600 }}>{err}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variant="ghost" full onClick={onClose}>Cancel</Btn>
            <Btn type="submit" full style={{ opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving…' : isSetup ? 'Set up' : 'Save'}</Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InventoryScreen({ shopId }) {
  const [inventory, setInventory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjustItem, setAdjustItem] = useState(null);
  const [q, setQ] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAlerts, setShowAlerts] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [invRes, alertRes] = await Promise.all([
        apiFetch(`${API_BASE}/shops/${shopId}/inventory`),
        apiFetch(`${API_BASE}/shops/${shopId}/inventory/reorder-alerts`),
      ]);
      if (invRes?.ok) setInventory(await invRes.json());
      if (alertRes?.ok) { const ad = await alertRes.json(); setAlerts(Array.isArray(ad) ? ad : (ad.reorderAlerts || [])); }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [shopId]);

  const filtered = useMemo(() => inventory
    .filter(item => {
      const name = (item.product?.name || '').toLowerCase();
      const catId = item.product?.categoryId || '';
      if (q && !name.includes(q.toLowerCase())) return false;
      if (catFilter !== 'all' && catId !== catFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => (STATUS_SORT[a.status] ?? 5) - (STATUS_SORT[b.status] ?? 5)),
  [inventory, q, catFilter, statusFilter]);

  const trackedCount = inventory.filter(i => i.tracked).length;
  const untrackedCount = inventory.filter(i => !i.tracked).length;
  const lowCount = inventory.filter(i => ['low', 'critical', 'out'].includes(i.status)).length;

  const sel = { background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 9, padding: '8px 12px', fontSize: 13, fontWeight: 600, color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-sans)', cursor: 'pointer' };

  return (
    <>
      <PageHead title="Inventory" subtitle={loading ? 'Loading…' : `${inventory.length} products · ${trackedCount} tracked · ${untrackedCount} not set up · ${lowCount} need attention`}>
        {alerts.length > 0 && (
          <Btn variant="ghost" size="sm" icon="alert" onClick={() => setShowAlerts(v => !v)}>
            {alerts.length} reorder alert{alerts.length !== 1 ? 's' : ''}
          </Btn>
        )}
      </PageHead>

      <div style={{ flex: 1, padding: '22px 34px 48px', display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto' }}>

        {/* Reorder alerts panel */}
        {showAlerts && alerts.length > 0 && (
          <section style={{ ...card(), padding: 0, overflow: 'hidden', border: '1px solid var(--amber-200, #fde68a)' }}>
            <div style={{ padding: '14px 20px', background: 'var(--amber-100, #fef9c3)', borderBottom: '1px solid var(--amber-200, #fde68a)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="alert" size={16} style={{ color: 'var(--amber-600, #d97706)' }} />
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--amber-700, #b45309)', flex: 1 }}>Reorder Alerts — {alerts.length} items need restocking</span>
              <button onClick={() => setShowAlerts(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {alerts.map((a, i) => (
                <div key={a.productId || i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderTop: i > 0 ? '1px solid var(--line)' : 'none' }}>
                  <ProductSwatch p={{ name: a.productName || a.product?.name || '', cat: a.categoryId || a.product?.categoryId || '' }} size={34} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{a.productName || a.product?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Stock: {a.stock} · Reorder point: {a.reorderPoint} · Short by {a.shortage || (a.reorderPoint - a.stock)}</div>
                  </div>
                  <Pill tone="warn" size="sm">Reorder</Pill>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Inventory table */}
        <section style={{ ...card(), padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <h2 style={sectionTitle}>Stock levels</h2>
            </div>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={sel}>
              <option value="all">All categories</option>
              {G.CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={sel}>
              <option value="all">All statuses</option>
              <option value="ok">In stock</option>
              <option value="low">Low</option>
              <option value="critical">Critical</option>
              <option value="out">Out of stock</option>
              <option value="untracked">Not set up</option>
            </select>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}><Icon name="search" size={15} /></span>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" style={{ padding: '8px 12px 8px 32px', borderRadius: 9, border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, width: 160, outline: 'none', fontFamily: 'var(--font-sans)' }} />
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-3)' }}>Loading inventory…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-3)' }}>No items match your filters.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
                  <tr>
                    <th style={th}>Product</th>
                    <th style={{ ...th, width: 170 }}>Stock</th>
                    <th style={{ ...th, width: 64, textAlign: 'center' }}>Par</th>
                    <th style={{ ...th, width: 120 }}>Status</th>
                    <th style={{ ...th, width: 130 }}>Last received</th>
                    <th style={{ ...th, width: 110, textAlign: 'right' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item.productId} style={{ borderTop: '1px solid var(--line)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <ProductSwatch p={{ name: item.product?.name || '', cat: item.product?.categoryId || '' }} size={34} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product?.name}</div>
                            <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{G.catOf(item.product?.categoryId).name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={td}>{item.tracked ? <StockBar stock={item.stock} par={item.par} /> : <span style={{ fontSize: 12, color: 'var(--text-3)' }}>—</span>}</td>
                      <td style={{ ...td, textAlign: 'center', fontWeight: 700, fontSize: 13 }}>{item.tracked ? item.par : '—'}</td>
                      <td style={td}><Pill tone={item.status === 'untracked' ? 'neutral' : item.status} dot size="sm">{STATUS_LABEL[item.status] || item.status}</Pill></td>
                      <td style={{ ...td, fontSize: 12, color: 'var(--text-3)' }}>
                        {item.lastReceived ? new Date(item.lastReceived).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ ...td, textAlign: 'right' }}>
                        <Btn size="sm" variant={item.tracked ? 'soft' : 'ghost'} icon="edit" onClick={() => setAdjustItem(item)}>{item.tracked ? 'Adjust' : 'Set up'}</Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {adjustItem && (
        <AdjustModal
          item={adjustItem}
          shopId={shopId}
          onClose={() => setAdjustItem(null)}
          onSaved={() => { setAdjustItem(null); load(); }}
        />
      )}
    </>
  );
}
