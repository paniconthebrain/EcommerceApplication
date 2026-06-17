import { useState, useEffect, useMemo } from 'react';
import { G, API_BASE, apiFetch } from '../../globals.js';
import { PageHead, ProductSwatch, Pill, StockBar, Btn, SortableTh, card, sectionTitle, sectionSub, th, td, linkBtn } from '../ui.jsx';
import { Icon } from '../icons.jsx';

function fmtEta(s) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const PO_STATUS_TONE = { draft: 'neutral', ordered: 'info', in_transit: 'info', arrived: 'ok', received: 'neutral' };
const PO_STATUS_LABEL = { draft: 'Draft', ordered: 'Ordered', in_transit: 'In transit', arrived: 'Arrived', received: 'Received' };
const ORDER_TONE = { new: 'info', picking: 'low', ready: 'ok', completed: 'neutral', cancelled: 'neutral' };

export default function DashboardScreen({ shopId, setRoute }) {
  const [kpis, setKpis] = useState(null);
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFetch(`${API_BASE}/shops/${shopId}/dashboard`).then(r => r?.ok ? r.json() : null),
      apiFetch(`${API_BASE}/shops/${shopId}/inventory`).then(r => r?.ok ? r.json() : []),
    ])
      .then(([dash, inv]) => {
        if (dash) {
          setKpis(dash.kpis);
          setOrders(dash.orders || []);
          setDeliveries(dash.deliveries || []);
        }
        setInventory(inv);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [shopId]);

  const products = useMemo(() => inventory
    .filter(item => item.tracked)
    .map(item => ({
      id: item.productId,
      name: item.product?.name || item.productId,
      cat: item.product?.categoryId || '',
      price: item.product?.price || 0,
      unit: item.product?.unit || 'unit',
      stock: item.stock,
      par: item.par,
      status: item.status,
    }))
    .filter(p => (cat === 'all' || p.cat === cat) && p.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1;
      if (sort.key === 'name') return a.name.localeCompare(b.name) * dir;
      if (sort.key === 'stock') return (a.stock - b.stock) * dir;
      if (sort.key === 'status') return a.status.localeCompare(b.status) * dir;
      return 0;
    }),
    [inventory, cat, q, sort]);

  const low = inventory.filter(i => ['low', 'critical', 'out'].includes(i.status));
  const untracked = inventory.filter(i => !i.tracked);

  const kpiCards = [
    {
      label: 'Open orders',
      value: loading ? '—' : (kpis?.openOrders ?? 0),
      sub: 'new, picking, ready',
      icon: 'orders',
      tone: 'up',
    },
    {
      label: 'Low / out of stock',
      value: loading ? '—' : low.length,
      sub: `${low.filter(i => i.status === 'out').length} out · ${untracked.length} not set up`,
      icon: 'alert',
      tone: 'warn',
    },
    {
      label: "Today's sales",
      value: loading ? '—' : G.money(kpis?.todaySales ?? 0),
      sub: 'completed orders today',
      icon: 'orders',
      tone: 'up',
    },
    {
      label: 'Fill rate',
      value: loading ? '—' : `${kpis?.fillRate ?? 0}%`,
      sub: 'tracked products at par',
      icon: 'check',
      tone: kpis?.fillRate >= 80 ? 'up' : 'warn',
    },
  ];

  const skeletonRow = (
    <tr style={{ borderTop: '1px solid var(--line)' }}>
      {[1, 2, 3, 4].map(i => <td key={i} style={td}><div style={{ height: 14, background: 'var(--surface-2)', borderRadius: 6, opacity: 0.6 }} /></td>)}
    </tr>
  );

  return (
    <>
      <PageHead title="Dashboard" subtitle="Live store overview">
        <Btn size="sm" icon="plus" onClick={() => setRoute('receive')}>Receive stock</Btn>
      </PageHead>

      <div style={{ flex: 1, padding: '22px 34px 48px', display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto' }}>
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          {kpiCards.map(k => (
            <div key={k.label} style={card({ padding: 16 })}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--surface-2)', color: 'var(--text-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name={k.icon} size={17} />
                </span>
                <span style={{ fontSize: 12.5, color: 'var(--text-2)', fontWeight: 600, flex: 1 }}>{k.label}</span>
              </div>
              <div style={{ marginTop: 12 }}>
                <div className="tnum" style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', lineHeight: 1.1 }}>{k.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{k.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 18, alignItems: 'start' }}>
          {/* Stock overview */}
          <section style={{ ...card(), padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <h2 style={sectionTitle}>Stock overview</h2>
                <p style={sectionSub}>{loading ? 'Loading…' : `${products.length} of ${inventory.filter(i => i.tracked).length} tracked SKUs`}</p>
              </div>
              <select value={cat} onChange={e => setCat(e.target.value)} style={{ padding: '8px 12px', borderRadius: 9, border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, fontWeight: 600, outline: 'none', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>
                <option value="all">All categories</option>
                {G.CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}><Icon name="search" size={16} /></span>
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products…" style={{ padding: '8px 12px 8px 34px', borderRadius: 9, border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, width: 168, outline: 'none', fontFamily: 'var(--font-sans)' }} />
              </div>
            </div>
            <div style={{ maxHeight: 460, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
                  <tr>
                    <SortableTh label="Product" sortKey="name" currentSort={sort} onSort={setSort} />
                    <SortableTh label="Stock level" sortKey="stock" currentSort={sort} onSort={setSort} style={{ width: 150 }} />
                    <SortableTh label="Status" sortKey="status" currentSort={sort} onSort={setSort} style={{ width: 110 }} />
                    <th style={{ ...th, width: 96, textAlign: 'right' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? [1, 2, 3, 4, 5].map(i => <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>{[1,2,3,4].map(j => <td key={j} style={td}><div style={{ height: 14, background: 'var(--surface-2)', borderRadius: 6, opacity: 0.6 }} /></td>)}</tr>)
                    : products.length === 0
                      ? <tr><td colSpan={4} style={{ ...td, textAlign: 'center', color: 'var(--text-3)', padding: 32 }}>No products match your filter.</td></tr>
                      : products.map(p => {
                        const state = p.status;
                        const label = state === 'ok' ? 'In stock' : state === 'low' ? 'Low' : state === 'critical' ? 'Critical' : 'Out';
                        return (
                          <tr key={p.id} style={{ borderTop: '1px solid var(--line)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={td}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                                <ProductSwatch p={p} size={34} />
                                <div style={{ lineHeight: 1.3, minWidth: 0, flex: 1 }}>
                                  <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                  <div style={{ fontSize: 11.5, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{G.catOf(p.cat).name}</div>
                                </div>
                              </div>
                            </td>
                            <td style={td}><StockBar stock={p.stock} par={p.par} /></td>
                            <td style={td}><Pill tone={state} dot size="sm">{label}</Pill></td>
                            <td style={{ ...td, textAlign: 'right' }}>
                              {state !== 'ok' && <Btn size="sm" variant="soft" onClick={() => setRoute('purchase-orders')}>Reorder</Btn>}
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </div>
            {untracked.length > 0 && (
              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="alert" size={14} style={{ color: 'var(--amber-600, #d97706)' }} />
                <span style={{ fontSize: 13, color: 'var(--text-2)', flex: 1 }}>{untracked.length} products not set up yet</span>
                <Btn size="sm" variant="ghost" onClick={() => setRoute('inventory')}>Set up in Inventory</Btn>
              </div>
            )}
          </section>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Orders */}
            <section style={{ ...card(), padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={sectionTitle}>Incoming orders</h2>
                  <p style={sectionSub}>{loading ? 'Loading…' : `${orders.filter(o => o.status === 'new').length} new · ${orders.filter(o => ['picking','ready'].includes(o.status)).length} in progress`}</p>
                </div>
                <button onClick={() => setRoute('fulfill')} style={linkBtn}>View queue <Icon name="chevR" size={14} /></button>
              </div>
              {loading
                ? [1,2].map(i => <div key={i} style={{ display: 'flex', gap: 12, padding: '13px 20px', borderTop: '1px solid var(--line)', opacity: 0.4 }}><div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--surface-2)' }} /><div style={{ flex: 1 }}><div style={{ height: 12, background: 'var(--surface-2)', borderRadius: 4, marginBottom: 6 }} /><div style={{ height: 10, background: 'var(--surface-2)', borderRadius: 4, width: '60%' }} /></div></div>)
                : orders.length === 0
                  ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>No active orders</div>
                  : orders.slice(0, 5).map(o => {
                    const name = o.Customer?.name || `Order ${o.id}`;
                    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                    return (
                      <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderTop: '1px solid var(--line)', cursor: 'pointer' }}
                        onClick={() => setRoute('fulfill')}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--surface-2)', color: 'var(--text-2)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12.5, flexShrink: 0 }}>{initials}</div>
                        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
                          <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-2)' }}><span className="mono" style={{ color: 'var(--text-3)' }}>{o.id}</span> · {o.itemCount ?? (o.items?.length ?? 0)} items · {G.money(o.total ?? o.pricing?.total ?? 0)}</div>
                        </div>
                        <Pill tone={ORDER_TONE[o.status] || 'neutral'} size="sm">
                          {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                        </Pill>
                      </div>
                    );
                  })}
            </section>

            {/* Purchase orders */}
            <section style={{ ...card(), padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={sectionTitle}>Purchase orders</h2>
                  <p style={sectionSub}>{loading ? 'Loading…' : `${deliveries.length} open`}</p>
                </div>
                <button onClick={() => setRoute('purchase-orders')} style={linkBtn}>All POs <Icon name="chevR" size={14} /></button>
              </div>
              {loading
                ? [1,2].map(i => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderTop: '1px solid var(--line)', opacity: 0.4 }}><div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)' }} /><div style={{ flex: 1 }}><div style={{ height: 12, background: 'var(--surface-2)', borderRadius: 4, marginBottom: 6 }} /><div style={{ height: 10, background: 'var(--surface-2)', borderRadius: 4, width: '60%' }} /></div></div>)
                : deliveries.length === 0
                  ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>No open purchase orders</div>
                  : deliveries.map(d => {
                    const status = d.status || 'draft';
                    return (
                      <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderTop: '1px solid var(--line)', cursor: 'pointer' }}
                        onClick={() => setRoute(status === 'arrived' ? 'receive' : 'purchase-orders')}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface-2)', color: 'var(--text-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name="truck" size={18} /></span>
                        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.3 }}>
                          <div style={{ fontWeight: 700, fontSize: 13.5 }}>{d.supplier || d.Supplier?.name || '—'}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-2)' }}><span className="mono">{d.id}</span> · {d.itemCount ?? d.lineItems?.length ?? 0} lines{d.eta ? ` · ETA ${fmtEta(d.eta)}` : ''}</div>
                        </div>
                        <Pill tone={PO_STATUS_TONE[status] || 'neutral'} dot size="sm">{PO_STATUS_LABEL[status] || status}</Pill>
                      </div>
                    );
                  })}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
