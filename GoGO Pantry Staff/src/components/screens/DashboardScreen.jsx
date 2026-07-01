import { useState, useEffect, useMemo, useCallback } from 'react';
import { G, API_BASE, apiFetch } from '../../globals.js';
import { PageHead, ProductSwatch, Pill, StockBar, Btn, SortableTh, EmptyState, card, sectionTitle, sectionSub, th, td, linkBtn } from '../ui.jsx';
import { Icon } from '../icons.jsx';

function fmtEta(s) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const PO_STATUS_TONE = { draft: 'neutral', ordered: 'info', in_transit: 'info', arrived: 'ok', received: 'neutral' };
const PO_STATUS_LABEL = { draft: 'Draft', ordered: 'Ordered', in_transit: 'In transit', arrived: 'Arrived', received: 'Received' };
const ORDER_TONE = { new: 'info', picking: 'low', ready: 'ok', completed: 'neutral', cancelled: 'neutral' };

const ROLE_LABEL = { admin: 'Admin', staff: 'Staff' };
const ROLE_COLOR = {
  admin: { bg: 'var(--red-100)', fg: 'var(--red-500)' },
  staff: { bg: 'var(--blue-100)', fg: 'var(--blue-500)' },
};

const SAVED_VIEWS = [
  { key: 'all',      label: 'All products',  filter: () => true },
  { key: 'low',      label: 'Low stock',     filter: p => ['low', 'critical', 'out'].includes(p.status) },
  { key: 'critical', label: 'Critical only', filter: p => ['critical', 'out'].includes(p.status) },
  { key: 'untracked',label: 'Untracked',     filter: (_, raw) => !raw.tracked },
];

function RoleBadge({ userType }) {
  const role = userType || 'staff';
  const { bg, fg } = ROLE_COLOR[role] || ROLE_COLOR.staff;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: bg, color: fg,
      fontSize: 11, fontWeight: 700,
      padding: '3px 9px', borderRadius: 999,
    }}>
      <Icon name={role === 'admin' ? 'shield' : 'user'} size={12} />
      {ROLE_LABEL[role] || role}
    </span>
  );
}

function KpiCard({ label, value, sub, severity, icon, onClick, loading }) {
  const severityBorder = {
    critical: 'var(--red-500)',
    warning:  'oklch(0.65 0.14 78)',
    success:  'var(--green-500)',
    info:     'var(--blue-500)',
  }[severity] || 'var(--line)';

  const valueColor = {
    critical: 'var(--red-500)',
    warning:  'oklch(0.5 0.12 78)',
  }[severity] || 'var(--text)';

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `${label}: ${value}. Click to view details.` : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      style={{
        ...card({ padding: '14px 16px' }),
        borderLeft: `3px solid ${severityBorder}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow .15s, border-color .15s',
        position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={onClick ? e => e.currentTarget.style.boxShadow = 'var(--shadow-md)' : undefined}
      onMouseLeave={onClick ? e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)' : undefined}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>{label}</span>
        <span style={{ color: 'var(--text-3)' }}><Icon name={icon} size={15} /></span>
      </div>
      {loading
        ? <div className="skeleton" style={{ height: 28, width: 64, borderRadius: 6 }} />
        : <div className="tnum" style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: valueColor, lineHeight: 1 }}>{value}</div>
      }
      {loading
        ? <div className="skeleton" style={{ height: 12, width: '80%', borderRadius: 4, marginTop: 6 }} />
        : <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 4 }}>{sub}</div>
      }
      {onClick && (
        <div style={{ position: 'absolute', bottom: 10, right: 12, color: 'var(--text-3)', opacity: 0.5 }}>
          <Icon name="chevR" size={13} />
        </div>
      )}
    </div>
  );
}

function AlertsPanel({ inventory, deliveries, setRoute }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return new Set(JSON.parse(sessionStorage.getItem('dashboard_dismissed_alerts') || '[]')); }
    catch { return new Set(); }
  });
  const [snoozed, setSnoozed] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('dashboard_snoozed_alerts') || '{}'); }
    catch { return {}; }
  });

  const dismiss = useCallback((key) => {
    setDismissed(prev => {
      const next = new Set(prev);
      next.add(key);
      sessionStorage.setItem('dashboard_dismissed_alerts', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const snooze = useCallback((key, hours) => {
    const until = Date.now() + hours * 3600 * 1000;
    setSnoozed(prev => {
      const next = { ...prev, [key]: until };
      sessionStorage.setItem('dashboard_snoozed_alerts', JSON.stringify(next));
      return next;
    });
  }, []);

  const isHidden = (key) => dismissed.has(key) || (snoozed[key] && snoozed[key] > Date.now());

  const critical = inventory.filter(i => ['critical', 'out'].includes(i.status) && !isHidden(`stock-${i.productId}`));
  const low = inventory.filter(i => i.status === 'low' && !isHidden(`stock-${i.productId}`));
  const poAlerts = deliveries.filter(d => d.status === 'arrived' && !isHidden(`po-${d.id}`));

  const total = critical.length + low.length + poAlerts.length;

  if (total === 0) {
    return (
      <section style={{ ...card({ padding: 0 }), overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 style={sectionTitle}>Alerts</h2>
        </div>
        <div style={{ padding: '32px 20px', textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--green-100)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
            <Icon name="check" size={22} style={{ color: 'var(--green-700)' }} />
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>All caught up</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>No alerts right now.</div>
        </div>
      </section>
    );
  }

  const AlertRow = ({ alertKey, severity, msg, ctaLabel, ctaRoute, snoozeHours = [2, 4] }) => (
    <div style={{
      display: 'flex', gap: 10, padding: '11px 20px',
      borderBottom: '1px solid var(--line)',
      alignItems: 'flex-start',
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: 999, flexShrink: 0, marginTop: 5,
        background: severity === 'critical' ? 'var(--red-500)' : severity === 'high' ? 'oklch(0.65 0.14 78)' : 'var(--blue-500)',
      }} aria-hidden="true" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>{msg}</div>
        {ctaLabel && (
          <button
            onClick={() => setRoute(ctaRoute)}
            style={{ ...linkBtn, fontSize: 12, marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}
            aria-label={ctaLabel}
          >
            <Icon name="chevR" size={12} /> {ctaLabel}
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'flex-start' }}>
        {snoozeHours.map(h => (
          <button
            key={h}
            onClick={() => snooze(alertKey, h)}
            title={`Snooze for ${h}h`}
            aria-label={`Snooze alert for ${h} hours`}
            style={{ fontSize: 10, color: 'var(--text-3)', cursor: 'pointer', padding: '2px 5px', borderRadius: 5, border: '1px solid var(--line)', background: 'transparent', fontFamily: 'var(--font-sans)' }}
          >
            {h}h
          </button>
        ))}
        <button
          onClick={() => dismiss(alertKey)}
          aria-label="Dismiss alert"
          style={{ fontSize: 14, color: 'var(--text-3)', cursor: 'pointer', border: 'none', background: 'transparent', lineHeight: 1, padding: '1px 3px' }}
        >
          ×
        </button>
      </div>
    </div>
  );

  return (
    <section style={{ ...card({ padding: 0 }), overflow: 'hidden' }} aria-label="Actionable alerts">
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <h2 style={sectionTitle}>Alerts</h2>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 20, height: 20, padding: '0 5px',
          background: 'var(--red-100)', color: 'var(--red-500)',
          fontSize: 10, fontWeight: 700, borderRadius: 999,
        }} aria-label={`${total} alerts`}>{total}</span>
      </div>

      {critical.length > 0 && (
        <>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-3)', padding: '6px 20px', background: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
            Critical
          </div>
          {critical.map(i => (
            <AlertRow
              key={`stock-${i.productId}`}
              alertKey={`stock-${i.productId}`}
              severity="critical"
              msg={i.status === 'out'
                ? `${i.product?.name || i.productId} is out of stock — customers can't buy this.`
                : `Only ${i.stock} unit${i.stock !== 1 ? 's' : ''} left of ${i.product?.name || i.productId}. Create a PO to avoid stockout.`}
              ctaLabel="Create PO"
              ctaRoute="purchase-orders"
              snoozeHours={[2, 4]}
            />
          ))}
        </>
      )}

      {low.length > 0 && (
        <>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-3)', padding: '6px 20px', background: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
            Low stock
          </div>
          {low.slice(0, 4).map(i => (
            <AlertRow
              key={`stock-${i.productId}`}
              alertKey={`stock-${i.productId}`}
              severity="high"
              msg={`${i.product?.name || i.productId} is below its reorder point (${i.stock} of ${i.par} needed).`}
              ctaLabel="View inventory"
              ctaRoute="inventory"
              snoozeHours={[4]}
            />
          ))}
          {low.length > 4 && (
            <div style={{ padding: '8px 20px', fontSize: 12, color: 'var(--text-3)' }}>
              + {low.length - 4} more low-stock items —{' '}
              <button onClick={() => setRoute('inventory')} style={{ ...linkBtn, fontSize: 12, display: 'inline' }}>
                view all
              </button>
            </div>
          )}
        </>
      )}

      {poAlerts.length > 0 && (
        <>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-3)', padding: '6px 20px', background: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
            Action needed
          </div>
          {poAlerts.map(d => (
            <AlertRow
              key={`po-${d.id}`}
              alertKey={`po-${d.id}`}
              severity="info"
              msg={`${d.id} from ${d.supplier} has arrived. Start receiving to update stock.`}
              ctaLabel="Receive now"
              ctaRoute="receive"
              snoozeHours={[1, 2]}
            />
          ))}
        </>
      )}
    </section>
  );
}

export default function DashboardScreen({ shopId, setRoute }) {
  const [kpis, setKpis] = useState(null);
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [rawInventory, setRawInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [activeView, setActiveView] = useState('all');
  const [sort, setSort] = useState({ key: 'status', dir: 'asc' });

  const currentUser = G.currentUser;
  const userType = currentUser?.userType || 'staff';

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFetch(`${API_BASE}/shops/${shopId}/dashboard`).then(r => {
        if (r?.status === 404) { window.dispatchEvent(new CustomEvent('staffShopInvalid')); return null; }
        return r?.ok ? r.json() : null;
      }),
      apiFetch(`${API_BASE}/shops/${shopId}/inventory`).then(r => r?.ok ? r.json() : []),
    ])
      .then(([dash, inv]) => {
        if (dash) {
          setKpis(dash.kpis);
          setOrders(dash.orders || []);
          setDeliveries(dash.deliveries || []);
        }
        const rawInv = Array.isArray(inv) ? inv : [];
        setRawInventory(rawInv);
        setInventory(rawInv.map(item => ({
          productId: item.productId,
          product: item.product,
          stock: item.stock,
          par: item.par,
          tracked: item.tracked,
          status: item.status || getLocalStatus(item.stock, item.par),
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [shopId]);

  function getLocalStatus(stock, par) {
    if (stock <= 0) return 'out';
    if (stock < par * 0.5) return 'critical';
    if (stock < par) return 'low';
    return 'ok';
  }

  const viewFilter = SAVED_VIEWS.find(v => v.key === activeView) || SAVED_VIEWS[0];

  const products = useMemo(() => {
    const trackedInv = inventory.filter(item => item.tracked);
    return trackedInv
      .filter((item, idx) => {
        const raw = rawInventory.find(r => r.productId === item.productId) || item;
        return viewFilter.filter(item, raw);
      })
      .filter(item => {
        const name = item.product?.name || item.productId || '';
        return name.toLowerCase().includes(q.toLowerCase());
      })
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
      .sort((a, b) => {
        const dir = sort.dir === 'asc' ? 1 : -1;
        const statusOrder = { out: 0, critical: 1, low: 2, ok: 3 };
        if (sort.key === 'name') return a.name.localeCompare(b.name) * dir;
        if (sort.key === 'stock') return (a.stock - b.stock) * dir;
        if (sort.key === 'status') return ((statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4)) * dir;
        return 0;
      });
  }, [inventory, rawInventory, viewFilter, q, sort]);

  const low = inventory.filter(i => ['low', 'critical', 'out'].includes(i.status));
  const untracked = inventory.filter(i => !i.tracked);
  const arrivedPos = deliveries.filter(d => d.status === 'arrived');

  const kpiCards = [
    {
      label: 'Orders needing attention',
      value: loading ? '—' : (kpis?.openOrders ?? 0),
      sub: 'new, picking, or ready',
      icon: 'orders',
      severity: (kpis?.openOrders > 0) ? 'warning' : 'success',
      onClick: () => setRoute('fulfill'),
    },
    {
      label: 'Low / out of stock',
      value: loading ? '—' : low.length,
      sub: `${low.filter(i => i.status === 'out').length} out · ${low.filter(i => i.status === 'critical').length} critical`,
      icon: 'alert',
      severity: low.filter(i => ['out', 'critical'].includes(i.status)).length > 0 ? 'critical' : low.length > 0 ? 'warning' : 'success',
      onClick: () => { setActiveView('low'); },
    },
    {
      label: "Today's sales",
      value: loading ? '—' : G.money(kpis?.todaySales ?? 0),
      sub: 'completed orders today',
      icon: 'orders',
      severity: 'info',
      onClick: null,
    },
    {
      label: 'Fill rate',
      value: loading ? '—' : `${kpis?.fillRate ?? 0}%`,
      sub: 'tracked products at par',
      icon: 'check',
      severity: !kpis ? 'info' : kpis.fillRate >= 80 ? 'success' : kpis.fillRate >= 60 ? 'warning' : 'critical',
      onClick: null,
    },
    {
      label: 'Receiving due',
      value: loading ? '—' : arrivedPos.length,
      sub: arrivedPos.length > 0 ? `${arrivedPos.length} PO${arrivedPos.length !== 1 ? 's' : ''} arrived` : 'no shipments arrived',
      icon: 'truck',
      severity: arrivedPos.length > 0 ? 'warning' : 'success',
      onClick: arrivedPos.length > 0 ? () => setRoute('receive') : null,
    },
  ];

  return (
    <>
      <PageHead title="Dashboard" subtitle="Live store overview">
        <RoleBadge userType={userType} />
        <Btn size="sm" icon="plus" onClick={() => setRoute('receive')}>Receive stock</Btn>
      </PageHead>

      <div style={{ flex: 1, padding: '22px 34px 48px', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>

        {/* KPI strip */}
        <div
          role="region"
          aria-label="Key performance indicators"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}
        >
          {kpiCards.map(k => (
            <KpiCard key={k.label} loading={loading} {...k} />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: 20, alignItems: 'start' }}>

          {/* Left column: alerts + orders + POs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <AlertsPanel inventory={inventory} deliveries={deliveries} setRoute={setRoute} />

            {/* Orders */}
            <section style={{ ...card(), padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={sectionTitle}>Incoming orders</h2>
                  <p style={sectionSub}>
                    {loading
                      ? 'Loading…'
                      : orders.length === 0
                        ? 'No orders yet today'
                        : `${orders.filter(o => o.status === 'new').length} new · ${orders.filter(o => ['picking', 'ready'].includes(o.status)).length} in progress`}
                  </p>
                </div>
                <button onClick={() => setRoute('fulfill')} style={linkBtn}>View queue <Icon name="chevR" size={14} /></button>
              </div>
              {loading
                ? [1, 2].map(i => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '13px 20px', borderBottom: '1px solid var(--line)', opacity: 0.4 }}>
                    <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 999 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 12, borderRadius: 4, marginBottom: 6 }} />
                      <div className="skeleton" style={{ height: 10, borderRadius: 4, width: '60%' }} />
                    </div>
                  </div>
                ))
                : orders.length === 0
                  ? (
                    <EmptyState
                      icon="orders"
                      title="No active orders"
                      sub="Orders will appear here once customers place them. Sales data updates in real time."
                    />
                  )
                  : orders.slice(0, 5).map(o => {
                    const name = o.Customer?.name || `Order ${o.id}`;
                    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                    return (
                      <div
                        key={o.id}
                        onClick={() => setRoute('fulfill')}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--surface-2)', color: 'var(--text-2)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12.5, flexShrink: 0 }}>{initials}</div>
                        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
                          <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                            <span className="mono" style={{ color: 'var(--text-3)' }}>{o.id}</span>
                            {' '}· {o.itemCount ?? (o.items?.length ?? 0)} items · {G.money(o.total ?? o.pricing?.total ?? 0)}
                          </div>
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
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={sectionTitle}>Purchase orders</h2>
                  <p style={sectionSub}>{loading ? 'Loading…' : `${deliveries.length} open`}</p>
                </div>
                <button onClick={() => setRoute('purchase-orders')} style={linkBtn}>All POs <Icon name="chevR" size={14} /></button>
              </div>
              {loading
                ? [1, 2].map(i => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderBottom: '1px solid var(--line)', opacity: 0.4 }}>
                    <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 12, borderRadius: 4, marginBottom: 6 }} />
                      <div className="skeleton" style={{ height: 10, borderRadius: 4, width: '60%' }} />
                    </div>
                  </div>
                ))
                : deliveries.length === 0
                  ? (
                    <EmptyState
                      icon="package"
                      title="No open purchase orders"
                      sub="Create a PO from the inventory screen when stock runs low."
                      action={<Btn size="sm" onClick={() => setRoute('purchase-orders')}>Go to purchase orders</Btn>}
                    />
                  )
                  : deliveries.map(d => {
                    const status = d.status || 'draft';
                    return (
                      <div
                        key={d.id}
                        onClick={() => setRoute(status === 'arrived' ? 'receive' : 'purchase-orders')}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ width: 36, height: 36, borderRadius: 10, background: status === 'arrived' ? 'var(--green-100)' : 'var(--surface-2)', color: status === 'arrived' ? 'var(--green-700)' : 'var(--text-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          <Icon name="truck" size={18} />
                        </span>
                        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.3 }}>
                          <div style={{ fontWeight: 700, fontSize: 13.5 }}>{d.supplier || d.Supplier?.name || '—'}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                            <span className="mono">{d.id}</span>
                            {' '}· {d.itemCount ?? d.lineItems?.length ?? 0} lines{d.eta ? ` · ETA ${fmtEta(d.eta)}` : ''}
                          </div>
                        </div>
                        <Pill tone={PO_STATUS_TONE[status] || 'neutral'} dot size="sm">
                          {PO_STATUS_LABEL[status] || status}
                        </Pill>
                      </div>
                    );
                  })}
            </section>
          </div>

          {/* Right column: stock overview */}
          <section style={{ ...card(), padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <h2 style={sectionTitle}>Stock overview</h2>
                <p style={sectionSub}>
                  {loading
                    ? 'Loading…'
                    : `${inventory.filter(i => i.tracked).length} tracked SKUs · ${untracked.length} untracked`}
                </p>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}>
                  <Icon name="search" size={15} />
                </span>
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Search products…"
                  aria-label="Search products"
                  style={{ padding: '8px 12px 8px 34px', borderRadius: 9, border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, width: 180, outline: 'none', fontFamily: 'var(--font-sans)' }}
                />
              </div>
            </div>

            {/* Saved views */}
            <div
              role="group"
              aria-label="Saved views"
              style={{ display: 'flex', gap: 6, padding: '10px 20px', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}
            >
              {SAVED_VIEWS.map(v => (
                <button
                  key={v.key}
                  onClick={() => setActiveView(v.key)}
                  aria-pressed={activeView === v.key}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 999,
                    border: '1px solid',
                    borderColor: activeView === v.key ? 'var(--primary)' : 'var(--line)',
                    background: activeView === v.key ? 'var(--primary-soft)' : 'transparent',
                    color: activeView === v.key ? 'var(--primary)' : 'var(--text-2)',
                    fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {v.label}
                  {v.key === 'low' && !loading && low.length > 0 && (
                    <span style={{ marginLeft: 5, background: 'var(--red-100)', color: 'var(--red-500)', fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 999 }}>
                      {low.length}
                    </span>
                  )}
                  {v.key === 'untracked' && !loading && untracked.length > 0 && (
                    <span style={{ marginLeft: 5, background: 'var(--amber-100)', color: 'oklch(0.5 0.12 78)', fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 999 }}>
                      {untracked.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div style={{ maxHeight: 500, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }} aria-label="Inventory table">
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
                    ? [1, 2, 3, 4, 5].map(i => (
                      <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                        {[1, 2, 3, 4].map(j => (
                          <td key={j} style={td}>
                            <div className="skeleton" style={{ height: 14, borderRadius: 6, opacity: 0.6 }} />
                          </td>
                        ))}
                      </tr>
                    ))
                    : products.length === 0
                      ? (
                        <tr>
                          <td colSpan={4} style={{ padding: 0 }}>
                            <EmptyState
                              icon="search"
                              title={q ? 'No products match your search' : 'No products in this view'}
                              sub={q
                                ? `No results for "${q}". Try a different name or clear the search.`
                                : activeView === 'untracked'
                                  ? 'All products are set up and tracked. Good work!'
                                  : 'Try a different view or import SKUs to get started.'}
                              action={
                                q
                                  ? <Btn size="sm" variant="ghost" onClick={() => setQ('')}>Clear search</Btn>
                                  : activeView !== 'all'
                                    ? <Btn size="sm" variant="ghost" onClick={() => setActiveView('all')}>Show all products</Btn>
                                    : <Btn size="sm" onClick={() => setRoute('inventory')}>Go to inventory</Btn>
                              }
                            />
                          </td>
                        </tr>
                      )
                      : products.map(p => {
                        const stateLabel = { ok: 'In stock', low: 'Low', critical: 'Critical', out: 'Out of stock' }[p.status] || p.status;
                        const stateTone = { ok: 'ok', low: 'low', critical: 'critical', out: 'out' }[p.status] || 'neutral';
                        return (
                          <tr
                            key={p.id}
                            style={{ borderTop: '1px solid var(--line)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={td}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                                <ProductSwatch p={p} size={34} />
                                <div style={{ lineHeight: 1.3, minWidth: 0, flex: 1 }}>
                                  <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                  <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{G.catOf(p.cat).name}</div>
                                </div>
                              </div>
                            </td>
                            <td style={td}><StockBar stock={p.stock} par={p.par} /></td>
                            <td style={td}><Pill tone={stateTone} dot size="sm">{stateLabel}</Pill></td>
                            <td style={{ ...td, textAlign: 'right' }}>
                              {['low', 'critical', 'out'].includes(p.status) && (
                                <Btn size="sm" variant="soft" onClick={() => setRoute('purchase-orders')}>Reorder</Btn>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </div>

            {!loading && untracked.length > 0 && activeView !== 'untracked' && (
              <div style={{ padding: '10px 20px', borderTop: '1px solid var(--line)', background: 'var(--amber-100)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="alert" size={14} style={{ color: 'oklch(0.5 0.12 78)', flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: 'oklch(0.4 0.1 78)', flex: 1 }}>
                  {untracked.length} product{untracked.length !== 1 ? 's' : ''} not set up yet — stock can't be tracked until configured.
                </span>
                <Btn size="sm" variant="ghost" onClick={() => setRoute('inventory')}>Set up in inventory</Btn>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
