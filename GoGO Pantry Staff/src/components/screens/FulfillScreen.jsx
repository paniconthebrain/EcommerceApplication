import { useState, useEffect, useCallback } from 'react';
import { G, API_BASE, apiFetch } from '../../globals.js';
import { PageHead, ProductSwatch, Pill, Btn, card, th, td } from '../ui.jsx';
import { Icon } from '../icons.jsx';

const STATUS_TONE = { new: 'info', picking: 'low', ready: 'ok', completed: 'neutral', cancelled: 'neutral' };
const STATUS_LABEL = { new: 'New', picking: 'Picking', ready: 'Ready', completed: 'Completed', cancelled: 'Cancelled' };

function initials(name = '') {
  return name.split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase() || '?';
}

export default function FulfillScreen({ shopId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selId, setSelId] = useState(null);
  const [tab, setTab] = useState('active');
  const [picked, setPicked] = useState({});
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE}/orders?shopId=${shopId}&limit=50`);
      if (res?.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.data || []);
        setOrders(list);
        if (!selId && list.length > 0) {
          const first = list.find(o => o.status === 'new') || list[0];
          setSelId(first.id);
        }
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [shopId]);

  useEffect(() => { load(); }, [load]);

  const sel = orders.find(o => o.id === selId) || null;
  const lineItems = sel?.items || [];

  const counts = {
    new: orders.filter(o => o.status === 'new').length,
    picking: orders.filter(o => o.status === 'picking').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  const visible = orders.filter(o =>
    tab === 'active' ? !['completed', 'cancelled'].includes(o.status) : o.status === 'completed'
  );

  const pickedSet = picked[selId] || {};
  const pickedCount = lineItems.filter((_, i) => pickedSet[i]).length;
  const allPicked = lineItems.length > 0 && pickedCount === lineItems.length;

  const togglePick = (idx) => setPicked(p => ({
    ...p,
    [selId]: { ...(p[selId] || {}), [idx]: !p[selId]?.[idx] },
  }));

  async function setStatus(orderId, status, pickerId) {
    setUpdating(true);
    try {
      const body = { status };
      if (pickerId) body.pickerId = pickerId;
      const res = await apiFetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      if (res?.ok) {
        setOrders(os => os.map(o => o.id === orderId ? { ...o, status, fulfillment: { ...o.fulfillment, pickerId: pickerId || o.fulfillment?.pickerId } } : o));
      }
    } catch { /* ignore */ }
    finally { setUpdating(false); }
  }

  return (
    <>
      <PageHead title="Fulfillment queue" subtitle={`${counts.new} new · ${counts.picking} picking · ${counts.ready} ready`} />

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(360px, 1fr) 1.1fr', gap: 22, padding: '22px 34px 48px', alignItems: 'start', overflowY: 'auto' }}>
        <section style={{ ...card(), padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', padding: 6, gap: 4, borderBottom: '1px solid var(--line)' }}>
            {[['active', 'Active'], ['completed', 'Completed']].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', cursor: 'pointer', background: tab === k ? 'var(--surface-2)' : 'transparent', color: 'var(--text)', fontWeight: 700, fontSize: 13.5, fontFamily: 'var(--font-sans)' }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ maxHeight: 620, overflowY: 'auto' }}>
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', gap: 13, padding: '15px 18px', borderTop: '1px solid var(--line)', opacity: 0.4 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 999, background: 'var(--surface-2)' }} />
                  <div style={{ flex: 1 }}><div style={{ height: 13, background: 'var(--surface-2)', borderRadius: 4, marginBottom: 7 }} /><div style={{ height: 11, background: 'var(--surface-2)', borderRadius: 4, width: '60%' }} /></div>
                </div>
              ))
            ) : visible.length === 0 ? (
              <div style={{ padding: '44px 20px', textAlign: 'center', color: 'var(--text-3)' }}>
                <Icon name="check" size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 700 }}>{tab === 'active' ? 'No active orders' : 'No completed orders'}</div>
              </div>
            ) : visible.map(o => {
              const name = o.Customer?.name || `Order ${o.id}`;
              const active = o.id === selId;
              return (
                <button key={o.id} onClick={() => { setSelId(o.id); setPicked(p => ({ ...p })); }}
                  style={{ width: '100%', textAlign: 'left', display: 'flex', gap: 13, padding: '15px 18px', borderTop: '1px solid var(--line)', border: 'none', borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent', background: active ? 'var(--surface-2)' : 'transparent', cursor: 'pointer', alignItems: 'center' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 999, background: active ? 'var(--green-600)' : 'var(--surface-2)', color: active ? '#fff' : 'var(--text-2)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13.5, flexShrink: 0 }}>
                    {initials(name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 2 }}><span className="mono" style={{ color: 'var(--text-3)' }}>{o.id}</span> · {o.items?.length ?? 0} items · {G.money(o.pricing?.total ?? 0)}</div>
                  </div>
                  <Pill tone={STATUS_TONE[o.status] || 'neutral'} size="sm">{STATUS_LABEL[o.status] || o.status}</Pill>
                </button>
              );
            })}
          </div>
        </section>

        {sel ? (
          <section style={{ ...card(), padding: 0, overflow: 'hidden', position: 'sticky', top: 92 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 999, background: 'var(--green-600)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                {initials(sel.Customer?.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text)' }}>{sel.Customer?.name || 'Unknown customer'}</h2>
                <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '3px 0 0' }}>
                  <span className="mono">{sel.id}</span> · {G.money(sel.pricing?.total ?? 0)} · {sel.orderType}
                </p>
              </div>
            </div>

            {sel.status === 'picking' && (
              <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Progress</span>
                <div style={{ flex: 1, height: 7, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: (lineItems.length ? pickedCount / lineItems.length * 100 : 0) + '%', height: '100%', background: 'var(--primary)', transition: 'width .35s var(--ease)' }} />
                </div>
                <span className="tnum" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>{pickedCount}/{lineItems.length}</span>
              </div>
            )}

            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              {lineItems.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)' }}>No line items</div>
              ) : lineItems.map((it, idx) => {
                const isPicked = !!pickedSet[idx];
                const canPick = sel.status === 'picking';
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 24px', borderTop: idx ? '1px solid var(--line)' : 'none', opacity: isPicked ? 0.6 : 1 }}>
                    <button onClick={() => canPick && togglePick(idx)} disabled={!canPick}
                      style={{ width: 24, height: 24, borderRadius: 7, border: '2px solid', borderColor: isPicked ? 'var(--primary)' : 'var(--line)', background: isPicked ? 'var(--primary)' : 'transparent', color: '#fff', cursor: canPick ? 'pointer' : 'not-allowed', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      {isPicked && <Icon name="check" size={14} stroke={3} />}
                    </button>
                    <ProductSwatch p={{ name: it.productName || '', cat: it.categoryId || '' }} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text)', textDecoration: isPicked ? 'line-through' : 'none' }}>{it.productName || it.productId}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{G.money(it.price)} each</div>
                    </div>
                    <span className="tnum" style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', minWidth: 28, textAlign: 'right' }}>×{it.qty}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--line)', background: 'var(--bg)', display: 'flex', gap: 12, alignItems: 'center' }}>
              {sel.status === 'new' && (
                <>
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text-2)' }}>Ready to pick</span>
                  <Btn icon="clipboard" onClick={() => setStatus(sel.id, 'picking', G.currentUser?.name || 'Staff')} style={{ opacity: updating ? 0.7 : 1 }}>
                    {updating ? 'Updating…' : 'Start picking'}
                  </Btn>
                </>
              )}
              {sel.status === 'picking' && (
                <>
                  <span style={{ flex: 1, fontSize: 13, color: allPicked ? 'var(--primary)' : 'var(--text-2)' }}>{allPicked ? 'All picked!' : `${lineItems.length - pickedCount} left to pick`}</span>
                  <Btn icon="check" onClick={() => setStatus(sel.id, 'ready')} style={{ opacity: allPicked && !updating ? 1 : 0.5, pointerEvents: allPicked && !updating ? 'auto' : 'none' }}>
                    {updating ? 'Updating…' : 'Mark ready'}
                  </Btn>
                </>
              )}
              {sel.status === 'ready' && (
                <>
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text-2)' }}>{sel.orderType === 'delivery' ? 'Hand off to driver' : 'Ready for customer pickup'}</span>
                  <Btn icon="check" onClick={() => setStatus(sel.id, 'completed')} style={{ opacity: updating ? 0.7 : 1 }}>
                    {updating ? 'Updating…' : sel.orderType === 'delivery' ? 'Dispatch' : 'Complete'}
                  </Btn>
                </>
              )}
              {sel.status === 'completed' && (
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text-3)', fontStyle: 'italic' }}>Order completed</span>
              )}
            </div>
          </section>
        ) : !loading && (
          <div style={{ ...card(), display: 'grid', placeItems: 'center', minHeight: 300 }}>
            <div style={{ textAlign: 'center', color: 'var(--text-3)' }}>
              <Icon name="orders" size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 700 }}>Select an order to begin</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
