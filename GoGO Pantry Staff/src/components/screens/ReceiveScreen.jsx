import { useState, useEffect } from 'react';
import { G, API_BASE, apiFetch } from '../../globals.js';
import { PageHead, ProductSwatch, Pill, Btn, card, sectionTitle } from '../ui.jsx';
import { Icon } from '../icons.jsx';

function fmtDate(s) {
  if (!s) return '—';
  return new Date(s).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ReceiveScreen({ shopId, setRoute }) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [poId, setPoId] = useState(null);
  const [done, setDone] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE}/deliveries?shopId=${shopId}`);
      if (res?.ok) {
        const data = await res.json();
        const active = data.filter(d => ['arrived', 'in-transit', 'scheduled'].includes(d.status));
        setDeliveries(active);
        if (active.length > 0 && !poId) setPoId(active[0].id);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [shopId]);

  const po = deliveries.find(d => d.id === poId);
  const lines = (po?.lineItems || []).map(item => {
    const product = G.PRODUCTS.find(p => p.id === item.productId) || { id: item.productId, name: item.productName || item.productId, cat: '' };
    return { ...item, id: item.productId, name: item.productName || product.name, cat: product.cat, expected: item.orderedQty || 0 };
  });

  const checkedCount = lines.filter(l => done[l.id]).length;
  const progress = lines.length ? Math.round((checkedCount / lines.length) * 100) : 0;

  async function handleConfirm() {
    if (!po) return;
    setSubmitting(true);
    setErr('');
    try {
      const items = lines.map(l => ({
        productId: l.id,
        receivedQty: done[l.id] ? l.expected : 0,
        rejectedQty: 0,
        rejectionReason: null,
      }));
      const res = await apiFetch(`${API_BASE}/deliveries/${po.id}/receive`, {
        method: 'POST',
        body: JSON.stringify({ items }),
      });
      if (!res || !res.ok) { const d = await res?.json(); setErr(d?.error || 'Failed to submit'); return; }
      setSuccess(true);
    } catch { setErr('Network error'); }
    finally { setSubmitting(false); }
  }

  if (success && po) {
    const supName = po.Supplier?.name || '—';
    return (
      <div style={{ display: 'grid', placeItems: 'center', padding: 40, minHeight: 'calc(100vh - 60px)' }}>
        <div style={{ ...card(), maxWidth: 460, width: '100%', textAlign: 'center', padding: 40 }}>
          <div style={{ width: 76, height: 76, borderRadius: 999, background: 'var(--green-100)', color: 'var(--green-700)', display: 'grid', placeItems: 'center', margin: '0 auto 22px' }}>
            <Icon name="check" size={40} stroke={3} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px', color: 'var(--text)' }}>Stock received</h2>
          <p style={{ color: 'var(--text-2)', margin: '0 0 24px', fontSize: 15 }}>
            <span className="mono">{po.id}</span> from {supName} is checked in.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Btn variant="ghost" full onClick={() => { setSuccess(false); setDone({}); load(); }}>Receive another</Btn>
            <Btn full icon="dashboard" onClick={() => setRoute('dashboard')}>Dashboard</Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHead title="Receive stock" subtitle="Check in supplier delivery" />
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '300px 1fr', gap: 22, padding: '22px 34px 48px', overflowY: 'auto' }}>
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Incoming POs</div>

          {loading && <div style={{ padding: 20, color: 'var(--text-3)', fontSize: 13 }}>Loading…</div>}

          {!loading && deliveries.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
              <Icon name="box" size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
              <div>No active deliveries</div>
            </div>
          )}

          {deliveries.map(d => {
            const active = d.id === poId;
            const tone = d.status === 'arrived' ? 'ok' : d.status === 'in-transit' ? 'info' : 'neutral';
            const label = d.status === 'arrived' ? 'Arrived' : d.status === 'in-transit' ? 'In transit' : 'Scheduled';
            return (
              <button key={d.id} onClick={() => { setPoId(d.id); setDone({}); setErr(''); }}
                style={{ textAlign: 'left', padding: 15, borderRadius: 14, border: '1px solid', borderColor: active ? 'var(--primary)' : 'var(--line)', background: active ? 'var(--surface)' : 'var(--bg)', cursor: 'pointer', boxShadow: active ? 'var(--shadow-md)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{d.id}</span>
                  <Pill tone={tone} size="sm">{label}</Pill>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{d.Supplier?.name || '—'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{d.lineItems?.length || 0} lines · ETA {fmtDate(d.eta)}</div>
              </button>
            );
          })}
        </aside>

        {po ? (
          <section style={{ ...card(), padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ width: 48, height: 48, borderRadius: 13, background: 'var(--green-100)', color: 'var(--green-700)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name="truck" size={24} />
              </span>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text)' }}>{po.Supplier?.name || '—'}</h2>
                <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '2px 0 0' }}><span className="mono">{po.id}</span> · ETA {fmtDate(po.eta)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="tnum" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>{checkedCount}<span style={{ color: 'var(--text-3)', fontWeight: 600 }}>/{lines.length}</span></div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>lines received</div>
              </div>
            </div>
            <div style={{ height: 4, background: 'var(--surface-2)' }}>
              <div style={{ width: progress + '%', height: '100%', background: 'var(--primary)', transition: 'width .4s var(--ease)' }} />
            </div>

            <div style={{ maxHeight: 430, overflowY: 'auto' }}>
              {lines.map(l => {
                const checked = !!done[l.id];
                return (
                  <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 24px', borderTop: '1px solid var(--line)', background: checked ? 'color-mix(in oklch, var(--green-500) 7%, transparent)' : 'transparent' }}>
                    <button onClick={() => setDone(d => ({ ...d, [l.id]: !d[l.id] }))}
                      style={{ width: 26, height: 26, borderRadius: 8, border: '2px solid', borderColor: checked ? 'var(--primary)' : 'var(--line)', background: checked ? 'var(--primary)' : 'transparent', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      {checked && <Icon name="check" size={16} stroke={3} />}
                    </button>
                    <ProductSwatch p={{ name: l.name, cat: l.cat }} size={40} />
                    <div style={{ flex: 1, minWidth: 0, lineHeight: 1.3 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{l.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Expected: {l.expected}</div>
                    </div>
                    {checked ? <Icon name="check" size={16} style={{ color: 'var(--primary)' }} /> : <span style={{ fontSize: 12, color: 'var(--text-3)' }}>—</span>}
                  </div>
                );
              })}
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg)' }}>
              <span style={{ flex: 1, fontSize: 13, color: 'var(--text-2)' }}>{checkedCount} of {lines.length} items checked</span>
              {err && <span style={{ fontSize: 13, color: 'var(--red-500)', fontWeight: 600 }}>{err}</span>}
              <Btn variant="ghost" onClick={() => setDone({})}>Reset</Btn>
              <Btn icon="check" onClick={handleConfirm} style={{ opacity: (checkedCount && !submitting) ? 1 : 0.5, pointerEvents: (checkedCount && !submitting) ? 'auto' : 'none' }}>
                {submitting ? 'Saving…' : 'Confirm & add'}
              </Btn>
            </div>
          </section>
        ) : !loading && (
          <div style={{ ...card(), display: 'grid', placeItems: 'center', minHeight: 300 }}>
            <div style={{ textAlign: 'center', color: 'var(--text-3)' }}>
              <Icon name="box" size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 700 }}>Select a delivery to begin</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
