import { useState, useEffect } from 'react';
import API from '../../services/api';
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const STATUSES = ['pending', 'confirmed', 'preparing', 'picked_up', 'delivered', 'cancelled'];

const STATUS_COLORS = {
  pending:   { bg: '#fef9c3', color: '#ca8a04' },
  confirmed: { bg: '#dbeafe', color: '#2563eb' },
  preparing: { bg: '#f3e8ff', color: '#7c3aed' },
  picked_up: { bg: '#cffafe', color: '#0891b2' },
  delivered: { bg: '#dcfce7', color: '#16a34a' },
  cancelled: { bg: '#fee2e2', color: '#dc2626' },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await API.get('/orders/all/');
      setOrders(res.data);
    } catch { toast.error('Failed to load orders'); }
    setLoading(false);
  }

  async function updateStatus(id, status) {
    setUpdating(id);
    try {
      await API.patch(`/orders/${id}/`, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      toast.success(`Status updated to ${status}`);
    } catch { toast.error('Failed to update status'); }
    setUpdating(null);
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: orders.filter(o => o.status === s).length }), {});

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800' }}>Orders</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted-fg)', marginTop: '2px' }}>{orders.length} total orders</p>
        </div>
        <button onClick={load} style={{ background: 'var(--muted)', padding: '8px', borderRadius: '10px', color: 'var(--muted-fg)' }}>
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Filter scrollable */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button onClick={() => setFilter('all')} style={{
          padding: '7px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
          whiteSpace: 'nowrap', flexShrink: 0,
          border: filter === 'all' ? 'none' : '1px solid var(--border)',
          background: filter === 'all' ? 'var(--primary)' : 'var(--card)',
          color: filter === 'all' ? '#fff' : 'var(--muted-fg)',
        }}>
          All ({orders.length})
        </button>
        {STATUSES.map(s => {
          const c = STATUS_COLORS[s];
          const isActive = filter === s;
          return (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '7px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
              whiteSpace: 'nowrap', flexShrink: 0,
              background: isActive ? c.color : 'var(--card)',
              color: isActive ? '#fff' : c.color,
              border: `1px solid ${c.bg}`,
            }}>
              {s} ({counts[s] || 0})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3, 4].map(i => <div key={i} style={{ height: '72px', background: 'var(--muted)', borderRadius: 'var(--radius)' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted-fg)', fontSize: '14px' }}>
          No orders found
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((o, i) => {
            const isOpen = expanded === o.id;
            const c = STATUS_COLORS[o.status] || STATUS_COLORS.pending;
            const isActive = !['delivered', 'cancelled'].includes(o.status);
            return (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                style={{
                  background: 'var(--card)', borderRadius: 'var(--radius)',
                  border: isActive ? `1px solid ${c.color}40` : '1px solid var(--border)',
                  overflow: 'hidden', boxShadow: 'var(--shadow)',
                }}
              >
                {isActive && (
                  <div style={{ height: '3px', background: `linear-gradient(90deg, ${c.color}, var(--primary))` }} />
                )}
                <div
                  onClick={() => setExpanded(isOpen ? null : o.id)}
                  style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{ fontSize: '13px', fontWeight: '700' }}>Order #{o.id}</p>
                      <span style={{
                        fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px',
                        background: c.bg, color: c.color,
                      }}>
                        {o.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--muted-fg)', marginTop: '2px' }}>
                      {o.customer_username} · {o.restaurant_name} · {new Date(o.created_at).toLocaleDateString('fr-MA')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>
                      {parseFloat(o.total_price).toFixed(0)} MAD
                    </span>
                    {isOpen ? <ChevronUp size={16} color="var(--muted-fg)" /> : <ChevronDown size={16} color="var(--muted-fg)" />}
                  </div>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '12px', color: 'var(--muted-fg)', margin: '12px 0 8px', fontWeight: '600' }}>
                          📍 {o.delivery_address}
                        </p>
                        {o.items?.length > 0 && (
                          <div style={{ marginBottom: '12px' }}>
                            {o.items.map(item => (
                              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0' }}>
                                <span>{item.quantity}x {item.menu_item_name}</span>
                                <span style={{ fontWeight: '600' }}>{parseFloat(item.price * item.quantity).toFixed(0)} MAD</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Status update buttons */}
                        {!['delivered', 'cancelled'].includes(o.status) && (
                          <div>
                            <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted-fg)', marginBottom: '8px' }}>
                              UPDATE STATUS:
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {STATUSES.filter(s => s !== o.status).map(s => {
                                const sc = STATUS_COLORS[s];
                                return (
                                  <button
                                    key={s}
                                    onClick={() => updateStatus(o.id, s)}
                                    disabled={updating === o.id}
                                    style={{
                                      padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '600',
                                      background: sc.bg, color: sc.color, opacity: updating === o.id ? 0.6 : 1,
                                    }}
                                  >
                                    → {s}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}