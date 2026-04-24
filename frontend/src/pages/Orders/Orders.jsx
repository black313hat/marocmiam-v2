import { useState, useEffect } from 'react';
import { getOrders } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ChevronDown, ChevronUp, MapPin, RotateCcw, Clock, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useLang } from '../../context/LanguageContext';

const STEPS = [
  { key: 'pending', emoji: '📋', label: 'Reçue' },
  { key: 'confirmed', emoji: '✅', label: 'Confirmée' },
  { key: 'preparing', emoji: '👨‍🍳', label: 'Préparation' },
  { key: 'picked_up', emoji: '🛵', label: 'En route' },
  { key: 'delivered', emoji: '🎉', label: 'Livrée' },
];

const STATUS_META = {
  pending: { color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', label: 'En attente' },
  confirmed: { color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', label: 'Confirmée' },
  preparing: { color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE', label: 'En préparation' },
  picked_up: { color: '#06B6D4', bg: '#ECFEFF', border: '#A5F3FC', label: 'En route' },
  delivered: { color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', label: 'Livrée' },
  cancelled: { color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', label: 'Annulée' },
};

function PulsingDot() {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: '8px', height: '8px' }}>
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#FF6B00', opacity: 0.4, animation: 'ping 1.2s ease-in-out infinite' }} />
      <span style={{ position: 'relative', borderRadius: '50%', width: '8px', height: '8px', background: '#FF6B00' }} />
    </span>
  );
}

function OrderTimeline({ status }) {
  const currentIdx = STEPS.findIndex(s => s.key === status);

  if (status === 'cancelled') {
    return (
      <div style={{ background: '#FEF2F2', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0 4px', border: '1px solid #FECACA' }}>
        <span style={{ fontSize: '16px' }}>❌</span>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#EF4444' }}>Commande annulée</span>
      </div>
    );
  }

  const pct = Math.min((currentIdx / (STEPS.length - 1)) * 100, 100);

  return (
    <div style={{ margin: '14px 0 4px' }}>
      <div style={{ position: 'relative', height: '4px', background: '#F0F0F0', borderRadius: '4px', marginBottom: '12px' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', borderRadius: '4px', width: `${pct}%`, background: 'linear-gradient(90deg, #FF6B00, #FF9A00)', transition: 'width 0.6s cubic-bezier(.4,0,.2,1)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {STEPS.map((step, i) => {
          const done = i <= currentIdx;
          const active = i === currentIdx;
          return (
            <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flex: 1 }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: done ? '#FF6B00' : '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', boxShadow: active ? '0 0 0 5px rgba(255,107,0,0.15)' : 'none', transition: 'all 0.3s ease' }}>
                {done ? <span>{step.emoji}</span> : <span style={{ fontSize: '11px', fontWeight: '700', color: '#CCC' }}>{i + 1}</span>}
              </div>
              <span style={{ fontSize: '9px', fontWeight: active ? '800' : '500', color: active ? '#FF6B00' : done ? '#888' : '#CCC', textAlign: 'center', lineHeight: 1.2 }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', borderRadius: '20px', padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      {[80, 120, 50].map((w, i) => (
        <div key={i} style={{ height: i === 1 ? '14px' : '12px', width: `${w}%`, maxWidth: `${w * 2.8}px`, background: 'linear-gradient(90deg, #F0F0F0 25%, #E8E8E8 50%, #F0F0F0 75%)', backgroundSize: '200% 100%', borderRadius: '6px', marginBottom: '10px', animation: 'shimmer 1.5s infinite' }} />
      ))}
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [tab, setTab] = useState('all');
  const navigate = useNavigate();
  const { t, isRTL } = useLang();

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
    } catch (err) {
      if (err.response?.status !== 401) toast.error('Could not load orders');
    }
    setLoading(false);
  }

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));
  const displayed = tab === 'active' ? activeOrders : tab === 'past' ? pastOrders : orders;

  return (
    <div style={{ background: '#F7F7F8', minHeight: '100vh', paddingBottom: '90px', direction: isRTL ? 'rtl' : 'ltr', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes ping { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(1.8);opacity:0} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      {/* Header */}
      <div style={{ background: '#FF6B00', padding: '20px 16px 0', borderRadius: '0 0 28px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600', letterSpacing: '0.05em', marginBottom: '2px' }}>SUIVI</p>
            <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '900', letterSpacing: '-0.02em' }}>Mes Commandes</h1>
          </div>
          <button onClick={load} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw size={16} color="#fff" />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { key: 'all', label: 'Tout', count: orders.length },
            { key: 'active', label: 'En cours', count: activeOrders.length },
            { key: 'past', label: 'Passées', count: pastOrders.length },
          ].map(({ key, label, count }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: '10px 0 14px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '12px', fontWeight: '700',
              color: tab === key ? '#fff' : 'rgba(255,255,255,0.55)',
              borderBottom: tab === key ? '3px solid #fff' : '3px solid transparent',
              transition: 'all 0.2s', fontFamily: 'inherit',
            }}>
              {label}
              {count > 0 && (
                <span style={{ marginLeft: '5px', fontSize: '10px', fontWeight: '800', background: tab === key ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)', padding: '1px 6px', borderRadius: '20px' }}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : displayed.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px', lineHeight: 1 }}>📦</div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1A1A1A', marginBottom: '8px' }}>
              {tab === 'active' ? 'Aucune commande active' : tab === 'past' ? 'Aucune commande passée' : 'Aucune commande'}
            </h2>
            <p style={{ color: '#AAA', fontSize: '13px', marginBottom: '24px', lineHeight: 1.5 }}>
              Commandez maintenant et suivez votre livraison en temps réel
            </p>
            <button onClick={() => navigate('/')} style={{ background: '#FF6B00', color: '#fff', padding: '13px 32px', borderRadius: '14px', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '14px', boxShadow: '0 6px 20px rgba(255,107,0,0.35)', fontFamily: 'inherit' }}>
              🍔 Commander maintenant
            </button>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayed.map((order, i) => {
              const s = STATUS_META[order.status] || STATUS_META.pending;
              const isActive = !['delivered', 'cancelled'].includes(order.status);
              const isPast = ['delivered', 'cancelled'].includes(order.status);
              const isOpen = expanded === order.id;

              return (
                <motion.div key={order.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  style={{
                    background: '#fff', borderRadius: '20px', overflow: 'hidden',
                    boxShadow: isActive ? '0 6px 24px rgba(255,107,0,0.1)' : '0 2px 12px rgba(0,0,0,0.05)',
                    border: isActive ? '1.5px solid #FFE0C0' : '1.5px solid #F0F0F0',
                  }}
                >
                  {/* Active gradient bar */}
                  {isActive && <div style={{ height: '3px', background: 'linear-gradient(90deg, #FF6B00, #FF9A00, #FFC107)' }} />}

                  {/* Card header */}
                  <div onClick={() => setExpanded(isOpen ? null : order.id)} style={{ padding: '14px 16px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Status row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', color: '#BBB', fontWeight: '600' }}>#{order.id}</span>
                          <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 9px', borderRadius: '20px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, letterSpacing: '0.02em' }}>
                            {s.label}
                          </span>
                          {isActive && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: '700', color: '#FF6B00' }}>
                              <PulsingDot /> En direct
                            </span>
                          )}
                        </div>

                        {/* Restaurant name */}
                        <p style={{ fontSize: '16px', fontWeight: '800', color: '#111', marginBottom: '4px', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {order.restaurant_name}
                        </p>

                        {/* Date */}
                        <p style={{ fontSize: '11px', color: '#BBB', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={10} />
                          {new Date(order.created_at).toLocaleDateString('fr-MA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          {order.items?.length > 0 && <span style={{ marginLeft: '4px' }}>· {order.items.length} article{order.items.length > 1 ? 's' : ''}</span>}
                        </p>
                      </div>

                      {/* Right side — price only for active, chevron always */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                        {isActive && (
                          <span style={{ fontWeight: '900', color: '#FF6B00', fontSize: '17px', letterSpacing: '-0.02em' }}>
                            {parseFloat(order.total_price).toFixed(0)} MAD
                          </span>
                        )}
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isOpen ? <ChevronUp size={14} color="#999" /> : <ChevronDown size={14} color="#999" />}
                        </div>
                      </div>
                    </div>

                    {/* Timeline for active orders */}
                    {isActive && <OrderTimeline status={order.status} />}
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '0 16px 16px', borderTop: '1px solid #F5F5F5' }}>

                          {/* Timeline for past orders */}
                          {isPast && <OrderTimeline status={order.status} />}

                          {/* Delivery address */}
                          <div style={{ background: '#F9F9F9', borderRadius: '12px', padding: '11px 13px', marginBottom: '12px', display: 'flex', alignItems: 'flex-start', gap: '8px', border: '1px solid #F0F0F0' }}>
                            <MapPin size={14} color="#FF6B00" style={{ flexShrink: 0, marginTop: '1px' }} />
                            <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.5, fontWeight: '500' }}>{order.delivery_address}</p>
                          </div>

                          {/* Items list */}
                          <div style={{ marginBottom: '12px' }}>
                            {order.items?.map((item, idx) => (
                              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: idx < order.items.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#FFF3E8', color: '#FF6B00', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {item.quantity}
                                  </span>
                                  <span style={{ fontSize: '13px', color: '#444', fontWeight: '500' }}>{item.menu_item_name}</span>
                                </div>
                                {/* Item prices only for active orders */}
                                {isActive && (
                                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#222' }}>{(item.price * item.quantity).toFixed(0)} MAD</span>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Price breakdown — active orders only */}
                          {isActive && (
                            <div style={{ background: '#F9F9F9', borderRadius: '14px', padding: '12px 14px', marginBottom: '14px', border: '1px solid #F0F0F0' }}>
                              {order.delivery_fee > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginBottom: '6px' }}>
                                  <span>🛵 Livraison</span>
                                  <span style={{ fontWeight: '600' }}>{parseFloat(order.delivery_fee).toFixed(0)} MAD</span>
                                </div>
                              )}
                              {order.service_fee > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                                  <span>🛡️ Frais de service</span>
                                  <span style={{ fontWeight: '600' }}>{parseFloat(order.service_fee).toFixed(0)} MAD</span>
                                </div>
                              )}
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '900', paddingTop: '8px', borderTop: '1px solid #EBEBEB' }}>
                                <span style={{ color: '#111' }}>Total</span>
                                <span style={{ color: '#FF6B00' }}>{parseFloat(order.total_price).toFixed(0)} MAD</span>
                              </div>
                              {order.payment_method && (
                                <p style={{ fontSize: '11px', color: '#AAA', marginTop: '6px', fontWeight: '500' }}>
                                  {order.payment_method === 'cash' ? '💵 Paiement en espèces' : '💳 Paiement par carte'}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Past order info cards */}
                          {isPast && (
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                              <div style={{ background: '#FFF3E8', borderRadius: '10px', padding: '8px 10px', flex: 1 }}>
                                <p style={{ fontSize: '9px', fontWeight: '800', color: '#FF6B00', marginBottom: '3px', textTransform: 'uppercase' }}>🍽️ Restaurant</p>
                                <p style={{ fontSize: '12px', fontWeight: '700', color: '#111' }}>{order.restaurant_name}</p>
                              </div>
                              <div style={{ background: '#F9F9F9', borderRadius: '10px', padding: '8px 10px', flex: 1 }}>
                                <p style={{ fontSize: '9px', fontWeight: '800', color: '#888', marginBottom: '3px', textTransform: 'uppercase' }}>💳 Paiement</p>
                                <p style={{ fontSize: '12px', fontWeight: '700', color: '#111' }}>
                                  {order.payment_method === 'cash' ? '💵 Espèces' : '💳 Carte'}
                                </p>
                              </div>
                              {order.courier_username && (
                                <div style={{ background: '#EFF6FF', borderRadius: '10px', padding: '8px 10px', flex: 1 }}>
                                  <p style={{ fontSize: '9px', fontWeight: '800', color: '#2563eb', marginBottom: '3px', textTransform: 'uppercase' }}>🛵 Livreur</p>
                                  <p style={{ fontSize: '12px', fontWeight: '700', color: '#111' }}>{order.courier_username}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Reorder + rate buttons — delivered only */}
                          {order.status === 'delivered' && (
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button onClick={() => navigate(`/restaurant/${order.restaurant}`)} style={{ flex: 1, padding: '12px', borderRadius: '14px', background: '#FF6B00', color: '#fff', fontWeight: '800', fontSize: '13px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(255,107,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'inherit' }}>
                                <RotateCcw size={14} /> Recommander
                              </button>
                              <button onClick={() => toast('Notation à venir ⭐')} style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#FFF3E8', color: '#FF6B00', border: '1.5px solid #FFE0C0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Star size={16} />
                              </button>
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
    </div>
  );
}
