import { useState, useEffect } from 'react';
import { getOrders } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ChevronDown, ChevronUp, Package, Clock, CheckCircle, ChefHat, Bike, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useLang } from '../../context/LanguageContext';

const STEPS = [
  { key: 'pending', icon: '📋', label: 'Reçue' },
  { key: 'confirmed', icon: '✅', label: 'Confirmée' },
  { key: 'preparing', icon: '👨‍🍳', label: 'Préparation' },
  { key: 'picked_up', icon: '🛵', label: 'En route' },
  { key: 'delivered', icon: '🎉', label: 'Livrée' },
];

function OrderTimeline({ status }) {
  const currentIdx = STEPS.findIndex(s => s.key === status);
  if (status === 'cancelled') return (
    <div style={{
      background: '#FEF2F2', borderRadius: '10px', padding: '10px 14px',
      display: 'flex', alignItems: 'center', gap: '8px', margin: '12px 0',
    }}>
      <span style={{ fontSize: '16px' }}>❌</span>
      <span style={{ fontSize: '13px', fontWeight: '600', color: '#EF4444' }}>Commande annulée</span>
    </div>
  );

  return (
    <div style={{ margin: '14px 0' }}>
      {/* Progress bar */}
      <div style={{ position: 'relative', marginBottom: '10px' }}>
        <div style={{ height: '4px', background: '#f0f0f0', borderRadius: '2px' }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, height: '4px',
          borderRadius: '2px', background: '#FF6B00',
          width: `${Math.min(((currentIdx) / (STEPS.length - 1)) * 100, 100)}%`,
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {STEPS.map((step, i) => {
          const done = i <= currentIdx;
          const active = i === currentIdx;
          return (
            <div key={step.key} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              flex: 1,
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: done ? '#FF6B00' : '#f0f0f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px',
                boxShadow: active ? '0 0 0 4px rgba(255,107,0,0.2)' : 'none',
                transition: 'all 0.3s',
              }}>
                {done ? <span style={{ fontSize: '14px' }}>{step.icon}</span> : <span style={{ fontSize: '11px', color: '#ccc' }}>{i + 1}</span>}
              </div>
              <span style={{
                fontSize: '9px', fontWeight: active ? '700' : '500',
                color: active ? '#FF6B00' : done ? '#666' : '#ccc',
                textAlign: 'center', lineHeight: 1.2,
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
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
    pending: { color: '#f59e0b', bg: '#fef9c3', label: t('pending') },
    confirmed: { color: '#3b82f6', bg: '#dbeafe', label: t('confirmed') },
    preparing: { color: '#8b5cf6', bg: '#f3e8ff', label: t('preparing') },
    picked_up: { color: '#06b6d4', bg: '#cffafe', label: t('on_the_way') },
    delivered: { color: '#16a34a', bg: '#dcfce7', label: t('delivered') },
    cancelled: { color: '#ef4444', bg: '#fee2e2', label: t('cancelled') },
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
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: '80px', direction: isRTL ? 'rtl' : 'ltr' }}>

      {/* Header */}
      <div style={{ background: '#FF6B00', padding: '16px 16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: '900' }}>{t('my_orders')}</h1>
          <button onClick={load} style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RefreshCw size={16} color="#fff" />
          </button>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: '120px', background: '#fff', borderRadius: '16px' }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 16px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{t('no_orders')}</h2>
            <p style={{ color: '#999', marginBottom: '20px', fontSize: '14px' }}>{t('no_orders_sub')}</p>
            <button onClick={() => navigate('/')} style={{
              background: '#FF6B00', color: '#fff', padding: '12px 28px',
              borderRadius: '12px', fontWeight: '700', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(255,107,0,0.3)',
            }}>
              {t('order_now_btn')}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                    background: '#fff', borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: isActive ? '0 4px 20px rgba(255,107,0,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
                    border: isActive ? '1.5px solid #FFE0C0' : '1px solid #f0f0f0',
                  }}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div style={{ height: '3px', background: 'linear-gradient(90deg, #FF6B00, #FFC107)' }} />
                  )}

                  {/* Order header */}
                  <div
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    style={{ padding: '14px 16px', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', color: '#999' }}>#{order.id}</span>
                          <span style={{
                            fontSize: '10px', fontWeight: '700', padding: '2px 8px',
                            borderRadius: '20px', background: s.bg, color: s.color,
                          }}>
                            {s.label}
                          </span>
                          {isActive && (
                            <span style={{
                              fontSize: '10px', fontWeight: '600', color: '#FF6B00',
                              display: 'flex', alignItems: 'center', gap: '3px',
                            }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FF6B00', display: 'inline-block' }} />
                              En direct
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '15px', fontWeight: '800', color: '#1a1a1a', marginBottom: '2px' }}>
                          {order.restaurant_name}
                        </p>
                        <p style={{ fontSize: '11px', color: '#999' }}>
                          {new Date(order.created_at).toLocaleDateString('fr-MA', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        <span style={{ fontWeight: '900', color: '#FF6B00', fontSize: '16px' }}>
                          {parseFloat(order.total_price).toFixed(0)} MAD
                        </span>
                        {isOpen
                          ? <ChevronUp size={16} color="#999" />
                          : <ChevronDown size={16} color="#999" />
                        }
                      </div>
                    </div>

                    {/* Timeline always visible for active orders */}
                    {isActive && <OrderTimeline status={order.status} />}
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '0 16px 16px', borderTop: '1px solid #f5f5f5' }}>

                          {/* Timeline for non-active */}
                          {!isActive && <OrderTimeline status={order.status} />}

                          {/* Delivery address */}
                          <div style={{
                            background: '#f9f9f9', borderRadius: '10px',
                            padding: '10px 12px', marginBottom: '12px',
                            display: 'flex', alignItems: 'start', gap: '8px',
                          }}>
                            <span style={{ fontSize: '14px' }}>📍</span>
                            <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.4 }}>
                              {order.delivery_address}
                            </p>
                          </div>

                          {/* Items */}
                          <div style={{ marginBottom: '12px' }}>
                            {order.items?.map(item => (
                              <div key={item.id} style={{
                                display: 'flex', justifyContent: 'space-between',
                                fontSize: '13px', padding: '5px 0',
                                borderBottom: '1px solid #f5f5f5',
                              }}>
                                <span style={{ color: '#555' }}>{item.quantity}× {item.menu_item_name}</span>
                                <span style={{ fontWeight: '700' }}>{(item.price * item.quantity).toFixed(0)} MAD</span>
                              </div>
                            ))}
                          </div>

                          {/* Fee breakdown */}
                          <div style={{ background: '#f9f9f9', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px' }}>
                            {order.delivery_fee > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                                <span>🛵 {t('delivery')}</span>
                                <span>{parseFloat(order.delivery_fee).toFixed(0)} MAD</span>
                              </div>
                            )}
                            {order.service_fee > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999', marginBottom: '6px' }}>
                                <span>🛡️ {t('service_fee')}</span>
                                <span>{parseFloat(order.service_fee).toFixed(0)} MAD</span>
                              </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '800', paddingTop: '6px', borderTop: '1px solid #eee' }}>
                              <span>{t('total')}</span>
                              <span style={{ color: '#FF6B00' }}>{parseFloat(order.total_price).toFixed(0)} MAD</span>
                            </div>
                            {order.payment_method && (
                              <p style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                                {order.payment_method === 'cash' ? `💵 ${t('cash_payment')}` : `💳 ${t('card_payment')}`}
                              </p>
                            )}
                          </div>

                          {/* Reorder button */}
                          {order.status === 'delivered' && (
                            <button
                              onClick={() => navigate(`/restaurant/${order.restaurant}`)}
                              style={{
                                width: '100%', padding: '12px', borderRadius: '12px',
                                background: '#FF6B00', color: '#fff',
                                fontWeight: '700', fontSize: '14px',
                                border: 'none', cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(255,107,0,0.25)',
                              }}
                            >
                              🔄 {t('reorder')}
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
    </div>
  );
}