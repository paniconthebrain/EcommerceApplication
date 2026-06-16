import { useState, useEffect } from 'react';
import { API_BASE, apiFetch } from '../../globals.js';
import { PageHead, ProductSwatch, Pill, Btn, card } from '../ui.jsx';
import { Icon } from '../icons.jsx';

const STATUS_TONE = { draft: 'neutral', ordered: 'info', in_transit: 'info', arrived: 'ok', received: 'neutral' };
const STATUS_LABEL = { draft: 'Draft', ordered: 'Ordered', in_transit: 'In transit', arrived: 'Arrived', received: 'Received' };

function fmtDate(s) {
  if (!s) return '—';
  return new Date(s).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ReceiveScreen({ shopId, setRoute }) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [poId, setPoId] = useState(null);
  // qty[productId] = { receivedQty: string, rejectedQty: string, rejectionReason: string }
  const [qty, setQty] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE}/purchase-orders?shopId=${shopId}`);
      if (res?.ok) {
        const data = await res.json();
        // Only show POs that are receivable (not draft/ordered/received)
        const active = data.filter(d => ['in_transit', 'arrived'].includes(d.status));
        setDeliveries(active);
        if (active.length > 0 && !poId) setPoId(active[0].id);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [shopId]);

  const po = deliveries.find(d => d.id === poId);
  const lines = (po?.lineItems || []).map(item => ({
    productId: item.productId,
    name: item.productName || item.productId,
    orderedQty: item.orderedQty || 0,
    unitCost: item.unitCost || 0,
  }));

  function setLineQty(productId, field, value) {
    setQty(q => ({ ...q, [productId]: { ...(q[productId] || {}), [field]: value } }));
  }

  function prefillAll() {
    const prefilled = {};
    lines.forEach(l => {
      prefilled[l.productId] = { receivedQty: String(l.orderedQty), rejectedQty: '0', rejectionReason: '' };
    });
    setQty(prefilled);
  }

  function resetAll() { setQty({}); }

  const totalReceived = lines.reduce((s, l) => s + (parseInt(qty[l.productId]?.receivedQty) || 0), 0);
  const totalOrdered = lines.reduce((s, l) => s + (l.orderedQty || 0), 0);
  const canSubmit = lines.length > 0 && lines.some(l => parseInt(qty[l.productId]?.receivedQty) > 0);

  async function handleConfirm() {
    if (!po || !canSubmit) return;
    // Validate rejection reasons
    const missingReason = lines.find(l => {
      const rej = parseInt(qty[l.productId]?.rejectedQty) || 0;
      return rej > 0 && !qty[l.productId]?.rejectionReason?.trim();
    });
    if (missingReason) { setErr(`Enter a rejection reason for "${missingReason.name}"`); return; }
    setSubmitting(true);
    setErr('');
    try {
      const items = lines.map(l => ({
        productId: l.productId,
        receivedQty: parseInt(qty[l.productId]?.receivedQty) || 0,
        rejectedQty: parseInt(qty[l.productId]?.rejectedQty) || 0,
        rejectionReason: qty[l.productId]?.rejectionReason || null,
      }));
      const res = await apiFetch(`${API_BASE}/purchase-orders/${po.id}/receive`, {
        method: 'POST',
        body: JSON.stringify({ items }),
      });
      if (!res || !res.ok) { const d = await res?.json(); setErr(d?.error || 'Failed to receive'); return; }
      setSuccess(true);
    } catch { setErr('Network error'); }
    finally { setSubmitting(false); }
  }

  if (success && po) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', padding: 40, minHeight: 'calc(100vh - 60px)' }}>
        <div style={{ ...card(), maxWidth: 460, width: '100%', textAlign: 'center', padding: 40 }}>
          <div style={{ width: 76, height: 76, borderRadius: 999, background: 'var(--green-100)', color: 'var(--green-700)', display: 'grid', placeItems: 'center', margin: '0 auto 22px' }}>
            <Icon name="check" size={40} stroke={3} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px', color: 'var(--text)' }}>Stock received</h2>
          <p style={{ color: 'var(--text-2)', margin: '0 0 8px', fontSize: 15 }}>
            <span className="mono">{po.id}</span> from {po.Supplier?.name || '—'} is checked in.
          </p>
          <p style={{ color: 'var(--text-3)', margin: '0 0 24px', fontSize: 13 }}>
            {totalReceived} units added to inventory.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Btn variant="ghost" full onClick={() => { setSuccess(false); setQty({}); setPoId(null); load(); }}>Receive another</Btn>
            <Btn full icon="dashboard" onClick={() => setRoute('dashboard')}>Dashboard</Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHead title="Receive stock" subtitle="Check in supplier delivery" />
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr', gap: 22, padding: '22px 34px 48px', overflowY: 'auto' }}>

        {/* PO list sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Ready to receive</div>
          {loading && <div style={{ padding: 20, color: 'var(--text-3)', fontSize: 13 }}>Loading…</div>}
          {!loading && deliveries.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
              <Icon name="box" size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
              <div style={{ fontWeight: 700, marginBottom: 4 }}>No POs in transit or arrived</div>
              <div style={{ fontSize: 12 }}>Advance a PO to "In transit" or "Arrived" status first.</div>
              <button onClick={() => setRoute('purchase-orders')} style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--primary)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Go to Purchase Orders →
              </button>
            </div>
          )}
          {deliveries.map(d => {
            const active = d.id === poId;
            const status = d.status || 'in_transit';
            return (
              <button key={d.id} onClick={() => { setPoId(d.id); setQty({}); setErr(''); }}
                style={{ textAlign: 'left', padding: 14, borderRadius: 14, border: '1px solid', borderColor: active ? 'var(--primary)' : 'var(--line)', background: active ? 'var(--surface)' : 'var(--bg)', cursor: 'pointer', boxShadow: active ? 'var(--shadow-md)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{d.id}</span>
                  <Pill tone={STATUS_TONE[status]} size="sm">{STATUS_LABEL[status]}</Pill>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>{d.Supplier?.name || '—'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{d.lineItems?.length || 0} lines · ETA {fmtDate(d.eta)}</div>
              </button>
            );
          })}
        </aside>

        {/* Receive form */}
        {po ? (
          <section style={{ ...card(), padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ width: 48, height: 48, borderRadius: 13, background: 'var(--green-100)', color: 'var(--green-700)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name="truck" size={24} />
              </span>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{po.Supplier?.name || '—'}</h2>
                <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '2px 0 0' }}>
                  <span className="mono">{po.id}</span> · ETA {fmtDate(po.eta)}
                  {po.Supplier?.contactName && <> · {po.Supplier.contactName}</>}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn size="sm" variant="ghost" onClick={resetAll}>Reset</Btn>
                <Btn size="sm" variant="soft" onClick={prefillAll}>Fill all ordered</Btn>
              </div>
            </div>

            {/* Line items table */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
                  <tr>
                    <th style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--line)' }}>Product</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--line)', width: 90 }}>Ordered</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--line)', width: 110 }}>Received ✓</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--line)', width: 110 }}>Rejected ✗</th>
                    <th style={{ padding: '10px 12px', fontSize: 11.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--line)', width: 180 }}>Rejection reason</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11.5, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--line)', width: 80 }}>Unit cost</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, i) => {
                    const rec = parseInt(qty[l.productId]?.receivedQty) || 0;
                    const rej = parseInt(qty[l.productId]?.rejectedQty) || 0;
                    const hasRej = rej > 0;
                    const isShort = rec + rej < l.orderedQty;
                    const rowBg = rec > 0 ? 'color-mix(in oklch, var(--green-500) 6%, transparent)' : 'transparent';
                    const inp = { width: '100%', padding: '6px 8px', borderRadius: 7, border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontSize: 13, textAlign: 'center', outline: 'none' };
                    return (
                      <tr key={l.productId} style={{ borderTop: i ? '1px solid var(--line)' : 'none', background: rowBg }}>
                        <td style={{ padding: '13px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <ProductSwatch p={{ name: l.name, cat: '' }} size={38} />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14 }}>{l.name}</div>
                              {isShort && rec + rej > 0 && <div style={{ fontSize: 11.5, color: 'var(--amber-600, #d97706)', fontWeight: 600, marginTop: 2 }}>Short ship by {l.orderedQty - rec - rej}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '13px 12px', textAlign: 'center' }}>
                          <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>{l.orderedQty}</span>
                        </td>
                        <td style={{ padding: '13px 12px' }}>
                          <input type="number" min="0" max={l.orderedQty} value={qty[l.productId]?.receivedQty ?? ''} placeholder="0"
                            onChange={e => setLineQty(l.productId, 'receivedQty', e.target.value)}
                            style={{ ...inp, borderColor: rec > 0 ? 'var(--primary)' : 'var(--line)' }} />
                        </td>
                        <td style={{ padding: '13px 12px' }}>
                          <input type="number" min="0" max={l.orderedQty} value={qty[l.productId]?.rejectedQty ?? ''} placeholder="0"
                            onChange={e => setLineQty(l.productId, 'rejectedQty', e.target.value)}
                            style={{ ...inp, borderColor: hasRej ? 'var(--red-400, #f87171)' : 'var(--line)' }} />
                        </td>
                        <td style={{ padding: '13px 12px' }}>
                          <input type="text" value={qty[l.productId]?.rejectionReason ?? ''} placeholder={hasRej ? 'Required' : 'Optional'}
                            onChange={e => setLineQty(l.productId, 'rejectionReason', e.target.value)}
                            style={{ ...inp, textAlign: 'left' }} />
                        </td>
                        <td style={{ padding: '13px 12px', textAlign: 'right', fontSize: 13, color: 'var(--text-3)', fontWeight: 600 }}>
                          {l.unitCost ? `$${parseFloat(l.unitCost).toFixed(2)}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg)' }}>
              <div style={{ flex: 1, fontSize: 13, color: 'var(--text-2)' }}>
                <strong>{totalReceived}</strong> of <strong>{totalOrdered}</strong> units being received
              </div>
              {err && <span style={{ fontSize: 13, color: 'var(--red-500)', fontWeight: 600 }}>{err}</span>}
              <Btn icon="check" onClick={handleConfirm}
                style={{ opacity: canSubmit && !submitting ? 1 : 0.5, pointerEvents: canSubmit && !submitting ? 'auto' : 'none' }}>
                {submitting ? 'Saving…' : 'Confirm & add to stock'}
              </Btn>
            </div>
          </section>
        ) : !loading && (
          <div style={{ ...card(), display: 'grid', placeItems: 'center', minHeight: 300 }}>
            <div style={{ textAlign: 'center', color: 'var(--text-3)' }}>
              <Icon name="box" size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 700 }}>Select a PO to receive</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
