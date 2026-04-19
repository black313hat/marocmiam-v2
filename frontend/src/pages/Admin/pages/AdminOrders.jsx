import { useState, useEffect } from 'react';
import API from '../../../services/api';
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
      const token = localStorage.getItem('admin_token');
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await API.get('/orders/all/');
      setOrders(res.data);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  }

  async function updateStatus(id, status) {
    setUpdating(id);
    try {
      const token = localStorage.getItem('admin_token');
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await API.patch(`/orders/${id}/`, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      toast.success(`Status → ${status}`);
    } catch { toast.error('Failed'); }
    setUpdating(null);
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const counts = STATUSES.reduce((a, s) => ({ ...a, [s]: orders.filter(o => o.status === s).length }), {});

  return (
    <div>
      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button onClick={() => setFilter('all')} style={{
          padding: '7px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '600',
          whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
          background: filter === 'all' ? '#09090b' : '#fff',
          color: filter === 'all' ? '#fff' : '#64748b',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          All ({orders.length})
        </button>
        {STATUSES.map(s => {
          const c = STATUS_COLORS[s];
          return (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '7px 14px', borderRadius: '10px', fontSize: '12px',
              fontWeight: '600', whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
              background: filter === s ? c.color : '#fff',
              color: filter === s ? '#fff' : c.color,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}>
              {s} ({counts[s] || 0})
            </button>
          );
        })}
        <button onClick={load} style={{
          padding: '7px 12px', borderRadius: '10px', border: '1px solid #e2e8f0',
          background: '#fff', cursor: 'pointer',
        }}>
          <RefreshCw size={14} color="#64748b" />
        </button>
      </div>

      {/* Orders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} style={{ height: '64px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
          ))
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            No orders found
          </div>
        ) : filtered.map((o, i) => {
          const c = STATUS_COLORS[o.status] || STATUS_COLORS.pending;
          const isOpen = expanded === o.id;
          const isActive = !['delivered', 'cancelled'].includes(o.status);
          return (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              style={{
                background: '#fff', borderRadius: '12px',
                border: isActive ? `1px solid ${c.color}40` : '1px solid #e2e8f0',
                overflow: 'hidden',
              }}
            >
              {isActive && <div style={{ height: '3px', background: `linear-gradient(90deg, ${c.color}, #00A651)` }} />}
              <div
                onClick={() => setExpanded(isOpen ? null : o.id)}
                style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>#{o.id}</span>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '700' }}>{o.restaurant_name || 'Order'}</p>
                    <p style={{ fontSize: '11px', color: '#94a3b8' }}>{o.customer_username} · {new Date(o.created_at).toLocaleDateString('fr-MA')}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: c.bg, color: c.color }}>
                    {o.status}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#00A651' }}>{parseFloat(o.total_price).toFixed(0)} MAD</span>
                  {isOpen ? <ChevronUp size={15} color="#94a3b8" /> : <ChevronDown size={15} color="#94a3b8" />}
                </div>
              </div>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 16px 16px', borderTop: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '12px 0 8px' }}>📍 {o.delivery_address}</p>
                      {o.items?.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0' }}>
                          <span>{item.quantity}× {item.menu_item_name}</span>
                          <span style={{ fontWeight: '600' }}>{(item.price * item.quantity).toFixed(0)} MAD</span>
                        </div>
                      ))}
                      {!['delivered', 'cancelled'].includes(o.status) && (
                        <div style={{ marginTop: '12px' }}>
                          <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>UPDATE STATUS:</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {STATUSES.filter(s => s !== o.status).map(s => {
                              const sc = STATUS_COLORS[s];
                              return (
                                <button key={s} onClick={() => updateStatus(o.id, s)} disabled={updating === o.id} style={{
                                  padding: '5px 12px', borderRadius: '8px', fontSize: '11px',
                                  fontWeight: '600', border: 'none', cursor: 'pointer',
                                  background: sc.bg, color: sc.color,
                                  opacity: updating === o.id ? 0.6 : 1,
                                }}>
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
    </div>
  );
}