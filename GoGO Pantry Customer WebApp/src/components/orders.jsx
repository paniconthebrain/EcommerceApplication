import { useEffect, useState } from 'react';
import { API_BASE, customerFetch, G } from '../globals.js';
import { BtnC, BadgeC, SkeletonText, EmptyState } from './ui.jsx';
import { IconC } from './icons.jsx';

const container = {
  minHeight: '100vh',
  background: 'var(--bg)',
  padding: '40px 16px 80px',
};

const card = {
  maxWidth: 760,
  margin: '0 auto',
};

const heading = {
  fontSize: 26,
  fontWeight: 800,
  color: 'var(--text)',
  margin: '0 0 28px',
};

const STATUS_TONE = {
  new: 'info',
  picking: 'warn',
  ready: 'success',
  completed: 'neutral',
  cancelled: 'critical',
};

const STATUS_LABEL = {
  confirmed: 'Order confirmed and submitted',
  new: 'Order confirmed and submitted',
  picking: 'Staff is picking your items',
  ready: 'Order ready for pickup/delivery',
  completed: 'Order delivered/picked up',
  cancelled: 'Order cancelled',
};

const PAGE_SIZE = 20;

function OrderCard({ order, expanded, onToggle }) {
  const placedDate = new Date(order.createdAt).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  const itemCount = order.items?.length || 0;

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', marginBottom: 14, overflow: 'hidden' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, padding: '18px 20px', background: 'transparent', border: 'none', cursor: 'pointer',
          textAlign: 'left', fontFamily: 'var(--font-sans)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text)' }}>{order.id}</span>
            <BadgeC tone={STATUS_TONE[order.status] || 'neutral'}>{order.status}</BadgeC>
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
            {order.Shop?.name || 'Store'} · {placedDate} · {itemCount} item{itemCount === 1 ? '' : 's'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{G.money(order.pricing?.total || 0)}</span>
          <IconC name={expanded ? 'chevD' : 'chevR'} size={18} style={{ color: 'var(--text-3)' }} />
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '0 20px 22px', borderTop: '1px solid var(--line)' }}>
          <div style={{ marginTop: 18, marginBottom: 18 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', margin: '0 0 10px' }}>Items</h4>
            {(order.items || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'var(--text)', padding: '6px 0' }}>
                <span>{item.qty}× {item.productName}</span>
                <span>{G.money(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 18 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', margin: '0 0 10px' }}>Pricing</h4>
            <div style={{ fontSize: 13.5, color: 'var(--text-2)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>{G.money(order.pricing?.subtotal || 0)}</span></div>
              {order.pricing?.deliveryFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Delivery fee</span><span>{G.money(order.pricing.deliveryFee)}</span></div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tax</span><span>{G.money(order.pricing?.tax || 0)}</span></div>
              {order.pricing?.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Discount</span><span>-{G.money(order.pricing.discountAmount)}</span></div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: 'var(--text)', marginTop: 4 }}><span>Total</span><span>{G.money(order.pricing?.total || 0)}</span></div>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', margin: '0 0 10px' }}>
              {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
            </h4>
            <div style={{ fontSize: 13.5, color: 'var(--text)' }}>{order.timeSlot}</div>
            {order.orderType === 'delivery' && order.delivery?.address && (
              <div style={{ fontSize: 13.5, color: 'var(--text-2)', marginTop: 4 }}>
                {order.delivery.address}, {order.delivery.city} {order.delivery.zipCode}
              </div>
            )}
          </div>

          {order.fulfillment?.timeline?.length > 0 && (
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)', margin: '0 0 10px' }}>Status timeline</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {order.fulfillment.timeline.map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13.5, color: 'var(--text)', fontWeight: 600 }}>{STATUS_LABEL[step.step] || step.step}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{new Date(step.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MyOrdersPage({ user, onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchOrders = async (nextOffset) => {
    const res = await customerFetch(`${API_BASE}/orders/customers/${user.id}?limit=${PAGE_SIZE}&offset=${nextOffset}`);
    if (!res) return null; // customerFetch already logged the user out on 401
    if (!res.ok) throw new Error('Failed to load orders');
    return res.json();
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchOrders(0)
      .then(data => {
        if (cancelled || !data) return;
        setOrders(data.data || []);
        setTotal(data.total || 0);
        setOffset((data.data || []).length);
      })
      .catch(() => { if (!cancelled) setError('Unable to load your orders. Please try again.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user.id]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const data = await fetchOrders(offset);
      if (data) {
        setOrders(prev => [...prev, ...(data.data || [])]);
        setOffset(offset + (data.data || []).length);
      }
    } catch {
      setError('Unable to load more orders.');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={heading}>My Orders</h1>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ background: 'var(--surface)', borderRadius: 16, padding: 20 }}>
                <SkeletonText lines={2} />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--red-500)', fontSize: 14 }}>{error}</div>
        )}

        {!loading && !error && orders.length === 0 && (
          <EmptyState
            icon="box"
            title="No orders yet"
            sub="When you place an order, it'll show up here."
            action={<BtnC onClick={onBack}>Start shopping</BtnC>}
          />
        )}

        {!loading && !error && orders.length > 0 && (
          <>
            {orders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                expanded={expandedId === order.id}
                onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
              />
            ))}
            {orders.length < total && (
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <BtnC variant="ghost" onClick={handleLoadMore} loading={loadingMore}>Load more</BtnC>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
