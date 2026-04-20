import { useState, useEffect } from 'react';
import { getOrders } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useLang } from '../../context/LanguageContext';

const STEPS = ['pending', 'confirmed', 'preparing', 'picked_up', 'delivered'];

function OrderTimeline({ status, t }) {
  const currentIdx = STEPS.indexOf(status);
  if (status === 'cancelled') return (
    <div style={{ padding: '12px 0', color: '#ef4444', fontSize: '13px', fontWeight: '600' }}>
      ❌ {t('cancelled')}
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '12px 0' }}>
      {STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
              background: done ? '#FF6B00' : '#f0f0f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '700', color: done ? '#fff' : '#999',
              boxShadow: active ? '0 0 0 4px rgba(255,107,0,0.2)' : 'none',
              transition: 'all 0.3s',
            }}>
              {done ? '✓' : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: '2px',
                background: i < currentIdx ? '#FF6B00' : '#f0f0f0',
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
  const { t, isRTL } = useLang();

  const STATUS = {
    pending:   { color: '#f59e0b', bg: '#fef9c3', icon: '⏳', label: t('pending') },
    confirmed: { color: '#3b82f6', bg: '#dbeafe', icon: '✅', label: t('confirmed') },
    preparing: { color: '#8b5cf6', bg: '#f3e8ff', icon: '👨‍🍳', label: t('preparing') },
    picked_up: { color: '#06b6d4', bg: '#cffafe', icon: '🛵', label: t('on_the_way') },
    delivered: { color: '#10b981', bg: '#dcfce7', icon: '🎉', label: t('delivered') },
    cancelled: { color: '#ef4444', bg: '#fee2e2', icon: '❌', label: t('cancelled') },
  };

  useEffect(() => {
    load();
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
    <div style={{ padding: '16px', direction: isRTL ? 'rtl' : 'ltr' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800' }}>{t('my_orders')}</h1>
        <button onClick={load} style={{
          background: '#f5f5f5', padding: '8px', borderRadius: '10px',
          border: 'none', cursor: 'pointer',
        }}>
          <RefreshCw size={15} color="#999" />
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: '100px', background: '#fff', borderRadius: '14px' }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 16px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{t('no_orders')}</h2>
          <p style={{ color: '#999', marginBottom: '20px', fontSize: '14px' }}>{t('no_orders_sub')}</p>
          <button onClick={() => navigate('/')} style={{
            background: '#FF6B00', color: '#fff',
            padding: '12px 28px', borderRadius: '10px', fontWeight: '600',
            border: 'none', cursor: 'pointer',
          }}>
            {t('order_now_btn')}
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
                  border: isActive ? `1.5px solid ${s.color}40` : '1px solid #f0f0f0',
                  overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                {isActive && (
                  <div style={{ height: '3px', background: `linear-gradient(90deg, ${s.color}, #FF6B00)` }} />
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
                      <p style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
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
                      {isOpen ? <ChevronUp size={15} color="#999" /> : <ChevronDown size={15} color="#999" />}
                    </div>
                  </div>

                  {isActive && <OrderTimeline status={order.status} t={t} />}

                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginTop: isActive ? '4px' : '10px', paddingTop: '8px',
                    borderTop: '1px solid #f5f5f5',
                  }}>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {order.items?.length || 0} {t('items')}
                    </span>
                    <span style={{ fontWeight: '800', color: '#FF6B00', fontSize: '14px' }}>
                      {parseFloat(order.total_price).toFixed(0)} MAD
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
                      <div style={{ padding: '0 16px 16px', borderTop: '1px solid #f5f5f5' }}>
                        <p style={{ fontSize: '12px', color: '#999', margin: '12px 0 8px' }}>
                          📍 {order.delivery_address}
                        </p>
                        {order.items?.map(item => (
                          <div key={item.id} style={{
                            display: 'flex', justifyContent: 'space-between',
                            fontSize: '13px', padding: '4px 0',
                          }}>
                            <span>{item.quantity}× {item.menu_item_name}</span>
                            <span style={{ fontWeight: '600' }}>
                              {(item.price * item.quantity).toFixed(0)} MAD
                            </span>
                          </div>
                        ))}

                        {/* Fee breakdown */}
                        <div style={{ borderTop: '1px dashed #f0f0f0', marginTop: '8px', paddingTop: '8px' }}>
                          {order.delivery_fee > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                              <span>🛵 {t('delivery')}</span>
                              <span>{parseFloat(order.delivery_fee).toFixed(0)} MAD</span>
                            </div>
                          )}
                          {order.service_fee > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                              <span>🛡️ {t('service_fee')}</span>
                              <span>{parseFloat(order.service_fee).toFixed(0)} MAD</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '800', marginTop: '6px' }}>
                            <span>{t('total')}</span>
                            <span style={{ color: '#FF6B00' }}>{parseFloat(order.total_price).toFixed(0)} MAD</span>
                          </div>
                          {order.payment_method && (
                            <div style={{ marginTop: '6px', fontSize: '12px', color: '#999' }}>
                              {order.payment_method === 'cash' ? `💵 ${t('cash_payment')}` : `💳 ${t('card_payment')}`}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => navigate('/')}
                          style={{
                            marginTop: '12px', width: '100%', padding: '10px',
                            borderRadius: '10px', background: '#f5f5f5',
                            fontSize: '13px', fontWeight: '600', color: '#666',
                            border: 'none', cursor: 'pointer',
                          }}
                        >
                          🔄 {t('reorder')}
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