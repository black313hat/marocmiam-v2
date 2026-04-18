import { useState, useEffect } from 'react';
import { getOrders } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Package, Clock, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const STATUS = {
  pending:   { color: '#f59e0b', bg: '#fef9c3', icon: '⏳', label: 'Pending' },
  confirmed: { color: '#3b82f6', bg: '#dbeafe', icon: '✅', label: 'Confirmed' },
  preparing: { color: '#8b5cf6', bg: '#f3e8ff', icon: '👨‍🍳', label: 'Preparing' },
  picked_up: { color: '#06b6d4', bg: '#cffafe', icon: '🛵', label: 'On the way' },
  delivered: { color: '#10b981', bg: '#dcfce7', icon: '🎉', label: 'Delivered' },
  cancelled: { color: '#ef4444', bg: '#fee2e2', icon: '❌', label: 'Cancelled' },
};

const STEPS = ['pending', 'confirmed', 'preparing', 'picked_up', 'delivered'];

function OrderTimeline({ status }) {
  const currentIdx = STEPS.indexOf(status);
  if (status === 'cancelled') return (
    <div style={{ padding: '12px 0', color: '#ef4444', fontSize: '13px', fontWeight: '600' }}>
      ❌ Order cancelled
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', margin: '12px 0' }}>
      {STEPS.map((step, i) => {
        const s = STATUS[step];
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
              background: done ? 'var(--primary)' : 'var(--muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '700', color: done ? '#fff' : 'var(--muted-fg)',
              boxShadow: active ? '0 0 0 4px rgba(0,166,81,0.2)' : 'none',
              transition: 'all 0.3s',
            }}>
              {done ? '✓' : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: '2px',
                background: i < currentIdx ? 'var(--primary)' : 'var(--muted)',
                transition: 'all 0.3s',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    load();
    // Auto-refresh every 15 seconds for active orders
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  async function load() {
    try {
      const res = await getOrders();
      setOrders(res.data);
      const active = res.data.find(o => !['delivered', 'cancelled'].includes(o.status));
      if (active) setExpanded(active.id);
    } catch {
      toast.error('Could not load orders');
    }
    setLoading(false);
  }

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800' }}>My Orders</h1>
        <button onClick={load} style={{ background: 'var(--muted)', padding: '8px', borderRadius: '10px' }}>
          <RefreshCw size={15} color="var(--muted-fg)" />
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: '100px', background: 'var(--muted)', borderRadius: '14px' }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 16px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No orders yet</h2>
          <p style={{ color: 'var(--muted-fg)', marginBottom: '20px', fontSize: '14px' }}>
            Order food from your favourite restaurants
          </p>
          <button onClick={() => navigate('/')} style={{
            background: 'var(--primary)', color: '#fff',
            padding: '12px 28px', borderRadius: '10px', fontWeight: '600',
          }}>
            Order Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {orders.map((order, i) => {
            const s = STATUS[order.status] || STATUS.pending;
            const isActive = !['delivered', 'cancelled'].includes(order.status);
            const isOpen = expanded === order.id;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: '#fff', borderRadius: '14px',
                  border: isActive ? `1.5px solid ${s.color}40` : '1px solid var(--border)',
                  overflow: 'hidden', boxShadow: 'var(--shadow)',
                }}
              >
                {isActive && (
                  <div style={{ height: '3px', background: `linear-gradient(90deg, ${s.color}, var(--primary))` }} />
                )}
                <div
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  style={{ padding: '14px 16px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '700' }}>
                        {order.restaurant_name || `Order #${order.id}`}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--muted-fg)', marginTop: '2px' }}>
                        {new Date(order.created_at).toLocaleDateString('fr-MA', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: '700', padding: '3px 10px',
                        borderRadius: '20px', background: s.bg, color: s.color,
                      }}>
                        {s.icon} {s.label}
                      </span>
                      {isOpen ? <ChevronUp size={15} color="var(--muted-fg)" /> : <ChevronDown size={15} color="var(--muted-fg)" />}
                    </div>
                  </div>

                  {isActive && <OrderTimeline status={order.status} />}

                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginTop: isActive ? '4px' : '10px', paddingTop: '8px',
                    borderTop: '1px solid var(--border)',
                  }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted-fg)' }}>
                      {order.items?.length || 0} items
                    </span>
                    <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '14px' }}>
                      {parseFloat(order.total_price).toFixed(2)} MAD
                    </span>
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
                        <p style={{ fontSize: '12px', color: 'var(--muted-fg)', margin: '12px 0 8px' }}>
                          📍 {order.delivery_address}
                        </p>
                        {order.items?.map(item => (
                          <div key={item.id} style={{
                            display: 'flex', justifyContent: 'space-between',
                            fontSize: '13px', padding: '4px 0',
                          }}>
                            <span>{item.quantity}× {item.menu_item_name}</span>
                            <span style={{ fontWeight: '600' }}>
                              {(item.price * item.quantity).toFixed(2)} MAD
                            </span>
                          </div>
                        ))}
                        <button
                          onClick={() => navigate('/')}
                          style={{
                            marginTop: '12px', width: '100%', padding: '10px',
                            borderRadius: '10px', background: 'var(--muted)',
                            fontSize: '13px', fontWeight: '600', color: 'var(--muted-fg)',
                          }}
                        >
                          🔄 Reorder
                        </button>
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