import { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Store, ShoppingBag, RefreshCw, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const STATUS_FLOW = {
  pending: { next: 'confirmed', label: 'Confirm Order', color: '#3b82f6' },
  confirmed: { next: 'preparing', label: 'Start Preparing', color: '#8b5cf6' },
  preparing: { next: 'picked_up', label: 'Ready for Pickup', color: '#06b6d4' },
  picked_up: { next: 'delivered', label: 'Mark Delivered', color: '#10b981' },
};

const STATUS_COLORS = {
  pending:   { bg: '#fef9c3', color: '#ca8a04' },
  confirmed: { bg: '#dbeafe', color: '#2563eb' },
  preparing: { bg: '#f3e8ff', color: '#7c3aed' },
  picked_up: { bg: '#cffafe', color: '#0891b2' },
  delivered: { bg: '#dcfce7', color: '#16a34a' },
  cancelled: { bg: '#fee2e2', color: '#dc2626' },
};

export default function RestaurantDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('active');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  async function load() {
    try {
      const res = await API.get('/orders/all/');
      setOrders(res.data);
    } catch {
      toast.error('Failed to load orders');
    }
    setLoading(false);
  }

  async function updateStatus(id, status) {
    setUpdating(id);
    try {
      await API.patch(`/orders/${id}/`, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      toast.success(`Order updated to ${status}`);
    } catch {
      toast.error('Failed to update');
    }
    setUpdating(null);
  }

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));
  const displayed = filter === 'active' ? activeOrders : pastOrders;

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Store size={20} color="var(--primary)" /> Restaurant Dashboard
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--muted-fg)', marginTop: '2px' }}>
            {activeOrders.length} active orders
          </p>
        </div>
        <button onClick={load} style={{ background: 'var(--muted)', padding: '8px', borderRadius: '10px' }}>
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[
          { key: 'active', label: `🔥 Active (${activeOrders.length})` },
          { key: 'past', label: `📋 Past (${pastOrders.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{
            padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
            background: filter === t.key ? 'var(--primary)' : 'var(--muted)',
            color: filter === t.key ? '#fff' : 'var(--muted-fg)',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2].map(i => <div key={i} style={{ height: '80px', background: 'var(--muted)', borderRadius: '14px' }} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted-fg)' }}>
          {filter === 'active' ? '🎉 No active orders right now' : 'No past orders'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {displayed.map((o, i) => {
            const s = STATUS_COLORS[o.status] || STATUS_COLORS.pending;
            const flow = STATUS_FLOW[o.status];
            const isOpen = expanded === o.id;
            return (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  background: '#fff', borderRadius: '14px',
                  border: '1px solid var(--border)', overflow: 'hidden',
                  boxShadow: 'var(--shadow)',
                }}
              >
                <div
                  onClick={() => setExpanded(isOpen ? null : o.id)}
                  style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '700' }}>Order #{o.id}</p>
                      <span style={{
                        fontSize: '10px', fontWeight: '600', padding: '2px 8px',
                        borderRadius: '20px', background: s.bg, color: s.color,
                      }}>
                        {o.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--muted-fg)', marginTop: '2px' }}>
                      {o.customer_username} · {new Date(o.created_at).toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '15px' }}>
                      {parseFloat(o.total_price).toFixed(0)} MAD
                    </span>
                    {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
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
                      <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '12px', color: 'var(--muted-fg)', margin: '10px 0 8px' }}>
                          📍 {o.delivery_address}
                        </p>
                        {o.order_items?.map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '3px 0' }}>
                            <span>{item.quantity}× {item.menu_item_name}</span>
                            <span style={{ fontWeight: '600' }}>{(item.price * item.quantity).toFixed(0)} MAD</span>
                          </div>
                        ))}
                        {flow && (
                          <button
                            onClick={() => updateStatus(o.id, flow.next)}
                            disabled={updating === o.id}
                            style={{
                              marginTop: '12px', width: '100%', padding: '12px',
                              borderRadius: '10px', fontSize: '14px', fontWeight: '700',
                              background: flow.color, color: '#fff',
                              opacity: updating === o.id ? 0.6 : 1,
                            }}
                          >
                            {updating === o.id ? 'Updating...' : `→ ${flow.label}`}
                          </button>
                        )}
                        {o.status !== 'cancelled' && o.status !== 'delivered' && (
                          <button
                            onClick={() => updateStatus(o.id, 'cancelled')}
                            style={{
                              marginTop: '8px', width: '100%', padding: '10px',
                              borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                              background: '#fee2e2', color: '#dc2626',
                            }}
                          >
                            Cancel Order
                          </button>
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