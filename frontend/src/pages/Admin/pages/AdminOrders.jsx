import { useState, useEffect } from 'react';
import API from '../../../services/api';
import { RefreshCw, ChevronDown, ChevronUp, MapPin, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const STATUSES = ['pending', 'confirmed', 'preparing', 'picked_up', 'delivered', 'cancelled'];

const STATUS_META = {
  pending:   { bg: '#fef9c3', color: '#ca8a04',  border: '#fde68a', label: 'En attente',     emoji: '📋' },
  confirmed: { bg: '#dbeafe', color: '#2563eb',  border: '#bfdbfe', label: 'Confirmée',       emoji: '✅' },
  preparing: { bg: '#f3e8ff', color: '#7c3aed',  border: '#ddd6fe', label: 'En préparation', emoji: '👨‍🍳' },
  picked_up: { bg: '#cffafe', color: '#0891b2',  border: '#a5f3fc', label: 'En route',        emoji: '🛵' },
  delivered: { bg: '#dcfce7', color: '#16a34a',  border: '#a7f3d0', label: 'Livrée',          emoji: '🎉' },
  cancelled: { bg: '#fee2e2', color: '#dc2626',  border: '#fecaca', label: 'Annulée',         emoji: '❌' },
};

// Status flow: what can each status transition to
const NEXT_STATUSES = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['picked_up', 'cancelled'],
  picked_up: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export default function AdminOrders() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
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
    } catch { toast.error('Failed to load orders'); }
    setLoading(false);
  }

  async function updateStatus(id, status) {
    setUpdating(id);
    try {
      const token = localStorage.getItem('admin_token');
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await API.patch(`/orders/${id}/`, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      toast.success(`→ ${STATUS_META[status].label}`);
    } catch { toast.error('Failed to update status'); }
    setUpdating(null);
  }

  async function deleteOrder(id) {
    if (!window.confirm('Delete this order?')) return;
    try {
      const token = localStorage.getItem('admin_token');
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await API.delete(`/orders/${id}/`);
      setOrders(prev => prev.filter(o => o.id !== id));
      toast.success('Order deleted');
    } catch { toast.error('Failed to delete order'); }
  }

  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: orders.filter(o => o.status === s).length }), {});

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch = !search ||
      String(o.id).includes(search) ||
      o.customer_username?.toLowerCase().includes(search.toLowerCase()) ||
      o.restaurant_name?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800' }}>Orders</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>{orders.length} total · {orders.filter(o => !['delivered','cancelled'].includes(o.status)).length} actives</p>
        </div>
        <button onClick={load} style={{ padding: '9px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>
          <RefreshCw size={15} color="#64748b" />
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          placeholder="Search by order #, client, or restaurant..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '10px 14px 10px 36px',
            borderRadius: '10px', border: '1px solid #e2e8f0',
            fontSize: '13px', background: '#fff',
            boxSizing: 'border-box', outline: 'none',
          }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={14} color="#94a3b8" />
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '7px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
            whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer',
            border: filter === 'all' ? 'none' : '1px solid #e2e8f0',
            background: filter === 'all' ? '#09090b' : '#fff',
            color: filter === 'all' ? '#fff' : '#64748b',
          }}
        >
          All ({orders.length})
        </button>
        {STATUSES.map(s => {
          const m = STATUS_META[s];
          const isActive = filter === s;
          return (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '7px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
              whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer',
              background: isActive ? m.color : m.bg,
              color: isActive ? '#fff' : m.color,
              border: `1px solid ${m.border}`,
            }}>
              {m.emoji} {m.label} ({counts[s] || 0})
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ height: '68px', background: '#f1f5f9', borderRadius: '14px' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '14px' }}>
          No orders found
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((o, i) => {
            const isOpen   = expanded === o.id;
            const m        = STATUS_META[o.status] || STATUS_META.pending;
            const isActive = !['delivered', 'cancelled'].includes(o.status);
            const nextStatuses = NEXT_STATUSES[o.status] || [];

            return (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                style={{
                  background: '#fff', borderRadius: '14px',
                  border: isActive ? `1.5px solid ${m.color}40` : '1.5px solid #f0f0f0',
                  overflow: 'hidden',
                  boxShadow: isActive ? `0 2px 12px ${m.color}15` : '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {isActive && (
                  <div style={{ height: '3px', background: `linear-gradient(90deg, ${m.color}, #00A651)` }} />
                )}

                {/* Row */}
                <div
                  onClick={() => setExpanded(isOpen ? null : o.id)}
                  style={{ padding: '13px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                  {/* Order # */}
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', minWidth: '40px' }}>
                    #{o.id}
                  </span>

                  {/* Status badge */}
                  <span style={{
                    fontSize: '10px', fontWeight: '700', padding: '3px 9px', borderRadius: '20px',
                    background: m.bg, color: m.color, border: `1px solid ${m.border}`,
                    flexShrink: 0,
                  }}>
                    {m.emoji} {m.label}
                  </span>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#09090b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {o.customer_username} · {o.restaurant_name}
                    </p>
                    <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {new Date(o.created_at).toLocaleDateString('fr-MA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Price */}
                  <span style={{ fontSize: '14px', fontWeight: '900', color: '#00A651', flexShrink: 0 }}>
                    {parseFloat(o.total_price).toFixed(0)} MAD
                  </span>

                  {isOpen ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
                </div>

                {/* Expanded */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ padding: '0 16px 16px', borderTop: '1px solid #f5f5f5' }}>

                        {/* Delivery address */}
                        <div style={{
                          display: 'flex', alignItems: 'flex-start', gap: '8px',
                          background: '#f9f9f9', borderRadius: '10px',
                          padding: '10px 12px', margin: '12px 0',
                          border: '1px solid #f0f0f0',
                        }}>
                          <MapPin size={13} color="#FF6B00" style={{ flexShrink: 0, marginTop: '1px' }} />
                          <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.5 }}>{o.delivery_address || '—'}</p>
                        </div>

                        {/* Items */}
                        {o.order_items?.length > 0 && (
                          <div style={{ marginBottom: '12px' }}>
                            <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>Items</p>
                            {o.order_items.map(item => (
                              <div key={item.id} style={{
                                display: 'flex', justifyContent: 'space-between',
                                fontSize: '13px', padding: '5px 0',
                                borderBottom: '1px solid #f5f5f5',
                              }}>
                                <span style={{ color: '#444' }}>{item.quantity}× {item.menu_item_name}</span>
                                <span style={{ fontWeight: '700' }}>{(item.price * item.quantity).toFixed(0)} MAD</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Price breakdown */}
                        <div style={{ background: '#f9f9f9', borderRadius: '10px', padding: '10px 12px', marginBottom: '14px', border: '1px solid #f0f0f0' }}>
                          {o.delivery_fee > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                              <span>🛵 Livraison</span><span>{parseFloat(o.delivery_fee).toFixed(0)} MAD</span>
                            </div>
                          )}
                          {o.service_fee > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginBottom: '6px' }}>
                              <span>🛡️ Frais service</span><span>{parseFloat(o.service_fee).toFixed(0)} MAD</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '800', borderTop: '1px solid #eee', paddingTop: '6px' }}>
                            <span>Total</span>
                            <span style={{ color: '#00A651' }}>{parseFloat(o.total_price).toFixed(0)} MAD</span>
                          </div>
                          <p style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                            {o.payment_method === 'cash' ? '💵 Espèces' : '💳 Carte'} · Commission: {o.commission_rate || 20}%
                          </p>
                        </div>

                        {/* Status actions */}
                        <div>
                          <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>
                            Changer statut
                          </p>
                          {nextStatuses.length === 0 ? (
                            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Aucune action disponible</p>
                          ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {nextStatuses.map(s => {
                                const sm = STATUS_META[s];
                                return (
                                  <button
                                    key={s}
                                    onClick={() => updateStatus(o.id, s)}
                                    disabled={updating === o.id}
                                    style={{
                                      padding: '7px 14px', borderRadius: '10px',
                                      fontSize: '12px', fontWeight: '700',
                                      background: sm.bg, color: sm.color,
                                      border: `1.5px solid ${sm.border}`,
                                      cursor: updating === o.id ? 'not-allowed' : 'pointer',
                                      opacity: updating === o.id ? 0.6 : 1,
                                      transition: 'all 0.15s',
                                    }}
                                  >
                                    {sm.emoji} → {sm.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
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
