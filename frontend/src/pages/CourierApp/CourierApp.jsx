import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bike, MapPin, Package, CheckCircle, RefreshCw,
  Navigation, Clock, TrendingUp, User, Store, History,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CourierApp() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [courier, setCourier]                 = useState(null);
  const [isOnline, setIsOnline]               = useState(false);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeOrder, setActiveOrder]         = useState(null);
  const [earnings, setEarnings]               = useState(null);
  const [history, setHistory]                 = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [accepting, setAccepting]             = useState(null);
  const [tab, setTab]                         = useState('orders');
  const watchRef = useRef(null);

  useEffect(() => {
    init();
    return () => { if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current); };
  }, []);

  useEffect(() => {
    if (!isOnline) return;
    const interval = setInterval(loadOrders, 10000);
    startGPS();
    return () => {
      clearInterval(interval);
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, [isOnline]);

  async function init() {
    setLoading(true);
    try {
      const [courierRes, activeRes, earningsRes, historyRes] = await Promise.all([
        API.get('/courier/me/'),
        API.get('/courier/active/'),
        API.get('/courier/earnings/'),
        API.get('/courier/history/'),
      ]);
      setCourier(courierRes.data);
      setIsOnline(courierRes.data.is_online);
      setActiveOrder(activeRes.data);
      setEarnings(earningsRes.data);
      setHistory(historyRes.data || []);
      if (courierRes.data.is_online) loadOrders();
    } catch {
      toast.error('Accès non autorisé');
      navigate('/apply/courier');
    }
    setLoading(false);
  }

  async function loadOrders() {
    try {
      const res = await API.get('/courier/available/');
      setAvailableOrders(res.data);
    } catch { }
  }

  async function toggleOnline() {
    try {
      const res = await API.patch('/courier/online/', { is_online: !isOnline });
      setIsOnline(res.data.is_online);
      if (res.data.is_online) {
        toast.success('🟢 Vous êtes en ligne');
        loadOrders();
      } else {
        toast('🔴 Vous êtes hors ligne');
        setAvailableOrders([]);
        if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      }
    } catch { toast.error('Erreur'); }
  }

  function startGPS() {
    if (!navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      async pos => {
        try {
          await API.patch('/courier/update-location/', { lat: pos.coords.latitude, lng: pos.coords.longitude });
        } catch { }
      },
      () => { },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  }

  async function acceptOrder(orderId) {
    setAccepting(orderId);
    try {
      const res = await API.post(`/courier/accept/${orderId}/`);
      setActiveOrder(res.data.order);
      setAvailableOrders(prev => prev.filter(o => o.id !== orderId));
      toast.success('🛵 Commande acceptée!');
      setTab('active');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Impossible d\'accepter');
    }
    setAccepting(null);
  }

  async function deliverOrder(orderId) {
    try {
      await API.post(`/courier/deliver/${orderId}/`);
      const delivered = activeOrder;
      setActiveOrder(null);
      setHistory(prev => [{ ...delivered, status: 'delivered' }, ...prev]);
      toast.success('🎉 Livraison effectuée! Gains ajoutés');
      init();
      setTab('orders');
    } catch { toast.error('Erreur'); }
  }

  const gain = (price) => (parseFloat(price) * 0.20).toFixed(0);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px', background: '#F7F7F8', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>
      <div style={{ fontSize: '56px' }}>🛵</div>
      <p style={{ color: '#94a3b8', fontWeight: '600' }}>Chargement...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F7F7F8', paddingBottom: '90px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        background: isOnline
          ? 'linear-gradient(145deg, #FF6B00 0%, #FF9A3C 100%)'
          : 'linear-gradient(145deg, #64748b, #475569)',
        padding: '20px 16px 28px',
        borderRadius: '0 0 32px 32px',
        transition: 'background 0.5s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', border: '2px solid rgba(255,255,255,0.3)',
            }}>
              🛵
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '600' }}>Bonjour</p>
              <p style={{ color: '#fff', fontWeight: '900', fontSize: '18px', letterSpacing: '-0.02em' }}>
                {user?.first_name || user?.username}
              </p>
              {courier?.vehicle && <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}>🏍️ {courier.vehicle}</p>}
            </div>
          </div>

          <button onClick={toggleOnline} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: isOnline ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.4)',
            borderRadius: '24px', padding: '9px 16px',
            color: '#fff', fontWeight: '800', fontSize: '13px', cursor: 'pointer',
            fontFamily: 'inherit',
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: isOnline ? '#4ade80' : '#94a3b8',
              boxShadow: isOnline ? '0 0 6px #4ade80' : 'none',
            }} />
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { label: "Aujourd'hui", value: `${earnings?.today_earnings?.toFixed(0) || 0} MAD`, icon: '💰' },
            { label: 'Livraisons',  value: earnings?.today_deliveries || 0,                    icon: '📦' },
            { label: 'Total gagné', value: `${earnings?.total_earnings?.toFixed(0) || 0} MAD`, icon: '🏦' },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, background: 'rgba(255,255,255,0.15)',
              borderRadius: '14px', padding: '12px', textAlign: 'center',
            }}>
              <p style={{ fontSize: '18px', marginBottom: '4px' }}>{s.icon}</p>
              <p style={{ color: '#fff', fontWeight: '900', fontSize: '14px', letterSpacing: '-0.01em' }}>{s.value}</p>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '10px', marginTop: '1px' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Active Order Banner ── */}
      <AnimatePresence>
        {activeOrder && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{ margin: '16px 16px 0' }}>
            <div style={{
              background: '#fff', borderRadius: '20px',
              border: '2px solid #FF6B00', overflow: 'hidden',
              boxShadow: '0 6px 24px rgba(255,107,0,0.2)',
            }}>
              <div style={{ background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', animation: 'pulse 1s infinite' }} />
                <p style={{ color: '#fff', fontWeight: '800', fontSize: '12px', letterSpacing: '0.03em' }}>🛵 LIVRAISON EN COURS</p>
              </div>

              <div style={{ padding: '14px 16px' }}>
                {/* Restaurant + Client info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ background: '#FFF3E8', borderRadius: '12px', padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Store size={12} color="#FF6B00" />
                      <span style={{ fontSize: '10px', fontWeight: '700', color: '#FF6B00', textTransform: 'uppercase' }}>Restaurant</span>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: '800', color: '#111' }}>{activeOrder.restaurant_name}</p>
                    {activeOrder.restaurant_lat && (
                      <a href={`https://maps.google.com/?q=${activeOrder.restaurant_lat},${activeOrder.restaurant_lng}`}
                        target="_blank" rel="noreferrer"
                        style={{ fontSize: '10px', color: '#FF6B00', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '3px' }}>
                        <MapPin size={10} /> Voir sur la carte
                      </a>
                    )}
                  </div>
                  <div style={{ background: '#F0FDF4', borderRadius: '12px', padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <User size={12} color="#16a34a" />
                      <span style={{ fontSize: '10px', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase' }}>Client</span>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: '800', color: '#111' }}>{activeOrder.customer_username}</p>
                    <p style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                      {activeOrder.payment_method === 'cash' ? '💵 Espèces' : '💳 Carte'}
                    </p>
                  </div>
                </div>

                {/* Delivery address */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#F9F9F9', borderRadius: '12px', padding: '10px 12px', marginBottom: '12px', border: '1px solid #F0F0F0' }}>
                  <MapPin size={14} color="#FF6B00" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <p style={{ fontSize: '12px', color: '#555', lineHeight: 1.5 }}>{activeOrder.delivery_address}</p>
                </div>

                {/* Amount */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '13px', color: '#888', fontWeight: '600' }}>Montant commande</span>
                  <span style={{ fontSize: '16px', fontWeight: '900', color: '#FF6B00' }}>
                    {parseFloat(activeOrder.total_price).toFixed(0)} MAD
                    <span style={{ fontSize: '11px', color: '#16a34a', marginLeft: '6px' }}>
                      (+{gain(activeOrder.total_price)} MAD gain)
                    </span>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={`https://maps.google.com/?q=${activeOrder.delivery_lat || ''},${activeOrder.delivery_lng || ''}&daddr=${encodeURIComponent(activeOrder.delivery_address)}`}
                    target="_blank" rel="noreferrer"
                    style={{
                      flex: 1, padding: '12px', borderRadius: '12px',
                      background: '#F5F5F5', color: '#333',
                      fontWeight: '700', fontSize: '13px',
                      textDecoration: 'none', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '6px', fontFamily: 'inherit',
                    }}
                  >
                    <Navigation size={14} /> Naviguer
                  </a>
                  <button onClick={() => deliverOrder(activeOrder.id)} style={{
                    flex: 2, padding: '12px', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
                    color: '#fff', fontWeight: '800', fontSize: '13px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    boxShadow: '0 4px 12px rgba(255,107,0,0.3)', fontFamily: 'inherit',
                  }}>
                    <CheckCircle size={15} /> Livré ✓
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tabs ── */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: '#EBEBEB', borderRadius: '14px', padding: '4px' }}>
          {[
            { key: 'orders',   label: 'Commandes', badge: availableOrders.length },
            { key: 'earnings', label: 'Gains',      badge: null },
            { key: 'history',  label: 'Historique', badge: history.length || null },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: '10px 4px', borderRadius: '11px', border: 'none',
              cursor: 'pointer', fontSize: '12px', fontWeight: '700',
              background: tab === t.key ? '#fff' : 'transparent',
              color: tab === t.key ? '#FF6B00' : '#888',
              boxShadow: tab === t.key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              position: 'relative', transition: 'all 0.2s', fontFamily: 'inherit',
            }}>
              {t.label}
              {t.badge > 0 && (
                <span style={{
                  position: 'absolute', top: '4px', right: '4px',
                  background: '#FF6B00', color: '#fff', fontSize: '9px', fontWeight: '800',
                  width: '16px', height: '16px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
          <button onClick={() => { loadOrders(); init(); }} style={{
            width: '40px', height: '40px', borderRadius: '11px', border: 'none',
            cursor: 'pointer', background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <RefreshCw size={15} color="#888" />
          </button>
        </div>

        {/* ── Orders Tab ── */}
        {tab === 'orders' && (
          <div>
            {!isOnline ? (
              <div style={{ textAlign: 'center', padding: '56px 24px', background: '#fff', borderRadius: '20px', border: '1.5px solid #F0F0F0' }}>
                <div style={{ fontSize: '52px', marginBottom: '16px' }}>⚫</div>
                <p style={{ fontWeight: '900', fontSize: '18px', color: '#111', marginBottom: '8px' }}>Vous êtes hors ligne</p>
                <p style={{ fontSize: '13px', color: '#AAA', marginBottom: '24px', lineHeight: 1.5 }}>
                  Passez en ligne pour recevoir des commandes
                </p>
                <button onClick={toggleOnline} style={{
                  background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
                  color: '#fff', padding: '13px 32px', borderRadius: '14px',
                  fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '14px',
                  boxShadow: '0 6px 20px rgba(255,107,0,0.35)', fontFamily: 'inherit',
                }}>
                  Passer en ligne 🟢
                </button>
              </div>
            ) : availableOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '56px 24px', background: '#fff', borderRadius: '20px', border: '1.5px solid #F0F0F0' }}>
                <div style={{ fontSize: '52px', marginBottom: '16px' }}>⏳</div>
                <p style={{ fontWeight: '900', fontSize: '18px', color: '#111', marginBottom: '8px' }}>En attente de commandes</p>
                <p style={{ fontSize: '13px', color: '#AAA' }}>Les nouvelles commandes apparaîtront automatiquement</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {availableOrders.map((order, i) => (
                  <motion.div key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      background: '#fff', borderRadius: '20px', overflow: 'hidden',
                      border: '1.5px solid #F0F0F0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    }}
                  >
                    <div style={{ height: '3px', background: 'linear-gradient(90deg, #FF6B00, #FF9A3C)' }} />
                    <div style={{ padding: '16px' }}>
                      {/* Restaurant + Client */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ background: '#FFF3E8', borderRadius: '10px', padding: '9px 11px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                            <Store size={11} color="#FF6B00" />
                            <span style={{ fontSize: '9px', fontWeight: '800', color: '#FF6B00', textTransform: 'uppercase' }}>Restaurant</span>
                          </div>
                          <p style={{ fontSize: '12px', fontWeight: '800', color: '#111' }}>{order.restaurant_name}</p>
                        </div>
                        <div style={{ background: '#F0FDF4', borderRadius: '10px', padding: '9px 11px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                            <User size={11} color="#16a34a" />
                            <span style={{ fontSize: '9px', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase' }}>Client</span>
                          </div>
                          <p style={{ fontSize: '12px', fontWeight: '800', color: '#111' }}>{order.customer_username}</p>
                        </div>
                      </div>

                      {/* Address */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#F9F9F9', borderRadius: '12px', padding: '9px 11px', marginBottom: '10px', border: '1px solid #F0F0F0' }}>
                        <MapPin size={13} color="#FF6B00" style={{ flexShrink: 0, marginTop: '1px' }} />
                        <p style={{ fontSize: '12px', color: '#555', lineHeight: 1.4 }}>{order.delivery_address}</p>
                      </div>

                      {/* Meta row */}
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#888', fontWeight: '600' }}>
                          <Package size={11} /> {order.order_items?.length || 0} articles
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#888', fontWeight: '600' }}>
                          <Clock size={11} /> {new Date(order.created_at).toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {order.distance_km && (
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '20px' }}>
                            📍 {parseFloat(order.distance_km).toFixed(1)} km
                          </span>
                        )}
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '20px' }}>
                          +{gain(order.total_price)} MAD gain
                        </span>
                      </div>

                      <button
                        onClick={() => acceptOrder(order.id)}
                        disabled={accepting === order.id || !!activeOrder}
                        style={{
                          width: '100%', padding: '13px', borderRadius: '14px', border: 'none',
                          background: activeOrder ? '#F5F5F5' : 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
                          color: activeOrder ? '#BBB' : '#fff',
                          fontWeight: '800', fontSize: '13px',
                          cursor: activeOrder ? 'not-allowed' : 'pointer',
                          opacity: accepting === order.id ? 0.7 : 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          boxShadow: activeOrder ? 'none' : '0 4px 14px rgba(255,107,0,0.3)',
                          fontFamily: 'inherit',
                        }}
                      >
                        {accepting === order.id ? 'Acceptation...' :
                          activeOrder ? 'Terminez la livraison en cours' :
                          <><Bike size={16} /> Accepter la livraison</>}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Earnings Tab ── */}
        {tab === 'earnings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'slideUp 0.3s ease' }}>
            <div style={{ background: 'linear-gradient(145deg, #FF6B00, #FF9A3C)', borderRadius: '20px', padding: '24px' }}>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>Gains aujourd'hui</p>
              <p style={{ color: '#fff', fontSize: '40px', fontWeight: '900', lineHeight: 1, letterSpacing: '-0.03em' }}>
                {earnings?.today_earnings?.toFixed(2) || '0.00'} <span style={{ fontSize: '20px' }}>MAD</span>
              </p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginTop: '8px', fontWeight: '600' }}>
                {earnings?.today_deliveries || 0} livraisons effectuées
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { label: 'Gains totaux',    value: `${earnings?.total_earnings?.toFixed(0) || 0} MAD`, icon: '🏦', color: '#2563eb' },
                { label: 'Total livraisons', value: earnings?.total_deliveries || 0,                    icon: '📦', color: '#8b5cf6' },
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', borderRadius: '16px', padding: '18px', border: '1.5px solid #F0F0F0', textAlign: 'center' }}>
                  <p style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</p>
                  <p style={{ fontSize: '22px', fontWeight: '900', color: s.color, letterSpacing: '-0.02em' }}>{s.value}</p>
                  <p style={{ fontSize: '11px', color: '#AAA', fontWeight: '600', marginTop: '3px' }}>{s.label}</p>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', padding: '18px', border: '1.5px solid #F0F0F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#FFF3E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={16} color="#FF6B00" />
                </div>
                <p style={{ fontSize: '14px', fontWeight: '800', color: '#111' }}>Comment fonctionnent vos gains?</p>
              </div>
              {[
                { label: 'Par livraison', value: '20% du montant de la commande' },
                { label: 'Paiement',      value: 'Chaque semaine par virement' },
                { label: 'Bonus',         value: '+5% après 10 livraisons/jour' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F5F5F5' }}>
                  <span style={{ fontSize: '12px', color: '#888', fontWeight: '600' }}>{row.label}</span>
                  <span style={{ fontSize: '12px', color: '#333', fontWeight: '700' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── History Tab ── */}
        {tab === 'history' && (
          <div style={{ animation: 'slideUp 0.3s ease' }}>
            {/* Summary */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', border: '1.5px solid #F0F0F0', marginBottom: '16px', display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #F0F0F0' }}>
                <p style={{ fontSize: '22px', fontWeight: '900', color: '#FF6B00', letterSpacing: '-0.02em' }}>{history.length}</p>
                <p style={{ fontSize: '11px', color: '#AAA', fontWeight: '600' }}>Livraisons totales</p>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: '22px', fontWeight: '900', color: '#16a34a', letterSpacing: '-0.02em' }}>
                  {history.reduce((s, o) => s + parseFloat(gain(o.total_price)), 0).toFixed(0)} MAD
                </p>
                <p style={{ fontSize: '11px', color: '#AAA', fontWeight: '600' }}>Gains totaux</p>
              </div>
            </div>

            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '56px 24px', background: '#fff', borderRadius: '20px', border: '1.5px solid #F0F0F0' }}>
                <div style={{ fontSize: '52px', marginBottom: '16px' }}>📋</div>
                <p style={{ fontWeight: '900', fontSize: '18px', color: '#111', marginBottom: '8px' }}>Aucun historique</p>
                <p style={{ fontSize: '13px', color: '#AAA' }}>Vos livraisons effectuées apparaîtront ici</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {history.map((order, i) => (
                  <motion.div key={order.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ background: '#fff', borderRadius: '16px', padding: '14px 16px', border: '1.5px solid #F0F0F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '800', color: '#111' }}>Commande #{order.id}</p>
                        <p style={{ fontSize: '11px', color: '#AAA', marginTop: '2px' }}>
                          {new Date(order.created_at).toLocaleDateString('fr-MA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '15px', fontWeight: '900', color: '#16a34a' }}>+{gain(order.total_price)} MAD</p>
                        <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', background: '#dcfce7', color: '#16a34a' }}>
                          ✓ Livré
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                      <div style={{ background: '#FFF3E8', borderRadius: '8px', padding: '7px 9px' }}>
                        <p style={{ fontSize: '9px', fontWeight: '700', color: '#FF6B00', marginBottom: '2px' }}>🍽️ RESTAURANT</p>
                        <p style={{ fontSize: '11px', fontWeight: '700', color: '#111' }}>{order.restaurant_name}</p>
                      </div>
                      <div style={{ background: '#F0FDF4', borderRadius: '8px', padding: '7px 9px' }}>
                        <p style={{ fontSize: '9px', fontWeight: '700', color: '#16a34a', marginBottom: '2px' }}>👤 CLIENT</p>
                        <p style={{ fontSize: '11px', fontWeight: '700', color: '#111' }}>{order.customer_username}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={11} color="#AAA" />
                      <p style={{ fontSize: '11px', color: '#AAA', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.delivery_address}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
