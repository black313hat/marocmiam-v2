import { useState, useEffect, useRef } from 'react';
import API from '../../services/api';
import { Bike, MapPin, CheckCircle, RefreshCw, ToggleLeft, ToggleRight, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function CourierDashboard() {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
  const watchRef = useRef(null);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => {
      clearInterval(interval);
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, []);

  async function load() {
    try {
      const res = await API.get('/orders/all/');
      const all = res.data;
      setAvailableOrders(all.filter(o => o.status === 'preparing' && !o.courier_assigned));
      const active = all.find(o => o.status === 'picked_up');
      setActiveOrder(active || null);
    } catch {}
    setLoading(false);
  }

  function toggleOnline() {
    const newState = !isOnline;
    setIsOnline(newState);
    if (newState) {
      startGPS();
      toast.success('You are now online 🟢');
    } else {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      toast('You are now offline', { icon: '🔴' });
    }
  }

  function startGPS() {
    if (!navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          await API.patch('/courier/location/', { lat, lng });
        } catch {}
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  }

  async function acceptOrder(orderId) {
    setAccepting(orderId);
    try {
      await API.patch(`/orders/${orderId}/`, { status: 'picked_up' });
      await load();
      toast.success('Order accepted! 🛵');
    } catch {
      toast.error('Could not accept order');
    }
    setAccepting(null);
  }

  async function deliverOrder(orderId) {
    try {
      await API.patch(`/orders/${orderId}/`, { status: 'delivered' });
      setActiveOrder(null);
      await load();
      toast.success('Order delivered! 🎉');
    } catch {
      toast.error('Could not update order');
    }
  }

  return (
    <div style={{ padding: '16px', maxWidth: '480px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bike size={20} color="var(--primary)" /> Courier Dashboard
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--muted-fg)', marginTop: '2px' }}>
            {isOnline ? '🟢 Online — accepting orders' : '🔴 Offline'}
          </p>
        </div>
        <button onClick={toggleOnline} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700',
          background: isOnline ? '#dcfce7' : 'var(--muted)',
          color: isOnline ? '#16a34a' : 'var(--muted-fg)',
        }}>
          {isOnline ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          {isOnline ? 'Online' : 'Offline'}
        </button>
      </div>

      {/* Active Order */}
      {activeOrder && (
        <div style={{
          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
          borderRadius: '16px', padding: '16px', marginBottom: '20px', color: '#fff',
        }}>
          <p style={{ fontSize: '11px', fontWeight: '700', opacity: 0.8, marginBottom: '6px' }}>
            🛵 ACTIVE DELIVERY
          </p>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>
            Order #{activeOrder.id}
          </h3>
          <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '12px' }}>
            📍 {activeOrder.delivery_address}
          </p>
          <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '16px' }}>
            👤 {activeOrder.customer_username} · {parseFloat(activeOrder.total_price).toFixed(0)} MAD
          </p>
          <button
            onClick={() => deliverOrder(activeOrder.id)}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px',
              background: '#fff', color: 'var(--primary)',
              fontSize: '14px', fontWeight: '800',
            }}
          >
            ✅ Mark as Delivered
          </button>
        </div>
      )}

      {/* Available Orders */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '700' }}>
          Available Orders ({availableOrders.length})
        </h2>
        <button onClick={load} style={{ background: 'var(--muted)', padding: '6px', borderRadius: '8px' }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {!isOnline ? (
        <div style={{
          textAlign: 'center', padding: '40px', background: 'var(--muted)',
          borderRadius: '14px', color: 'var(--muted-fg)',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔴</div>
          <p style={{ fontWeight: '600', marginBottom: '6px' }}>You are offline</p>
          <p style={{ fontSize: '13px' }}>Go online to see available orders</p>
        </div>
      ) : loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2].map(i => <div key={i} style={{ height: '80px', background: 'var(--muted)', borderRadius: '14px' }} />)}
        </div>
      ) : availableOrders.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '40px', background: 'var(--muted)',
          borderRadius: '14px', color: 'var(--muted-fg)',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>⏳</div>
          <p style={{ fontWeight: '600' }}>No orders available right now</p>
          <p style={{ fontSize: '13px', marginTop: '6px' }}>New orders will appear automatically</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {availableOrders.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: '#fff', borderRadius: '14px', padding: '14px',
                border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '700' }}>Order #{o.id}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted-fg)', marginTop: '2px' }}>
                    {o.restaurant_name}
                  </p>
                </div>
                <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '16px' }}>
                  {parseFloat(o.total_price).toFixed(0)} MAD
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted-fg)', marginBottom: '12px' }}>
                📍 {o.delivery_address}
              </p>
              <button
                onClick={() => acceptOrder(o.id)}
                disabled={accepting === o.id || !!activeOrder}
                style={{
                  width: '100%', padding: '10px', borderRadius: '10px',
                  background: activeOrder ? 'var(--muted)' : 'var(--primary)',
                  color: activeOrder ? 'var(--muted-fg)' : '#fff',
                  fontSize: '13px', fontWeight: '700',
                  opacity: accepting === o.id ? 0.6 : 1,
                }}
              >
                {accepting === o.id ? 'Accepting...' :
                 activeOrder ? 'Finish current delivery first' : '🛵 Accept Delivery'}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}