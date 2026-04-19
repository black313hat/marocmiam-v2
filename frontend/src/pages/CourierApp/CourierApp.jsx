import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bike, MapPin, Package, CheckCircle, ToggleLeft, ToggleRight,
    DollarSign, Clock, Navigation, RefreshCw, ArrowLeft, Phone, Star
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CourierApp() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [courier, setCourier] = useState(null);
    const [isOnline, setIsOnline] = useState(false);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [activeOrder, setActiveOrder] = useState(null);
    const [earnings, setEarnings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(null);
    const [tab, setTab] = useState('orders');
    const watchRef = useRef(null);

    useEffect(() => {
        init();
        return () => {
            if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
        };
    }, []);

    useEffect(() => {
        if (isOnline) {
            const interval = setInterval(loadOrders, 10000);
            startGPS();
            return () => {
                clearInterval(interval);
                if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
            };
        }
    }, [isOnline]);

    async function init() {
        setLoading(true);
        try {
            const [courierRes, activeRes, earningsRes] = await Promise.all([
                API.get('/courier/me/'),
                API.get('/courier/active/'),
                API.get('/courier/earnings/'),
            ]);
            setCourier(courierRes.data);
            setIsOnline(courierRes.data.is_online);
            setActiveOrder(activeRes.data);
            setEarnings(earningsRes.data);
            if (courierRes.data.is_online) loadOrders();
        } catch {
            toast.error('Not registered as courier');
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
                toast.success('You are now online 🟢');
                loadOrders();
            } else {
                toast('You are now offline 🔴', { icon: '⚫' });
                setAvailableOrders([]);
                if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
            }
        } catch { toast.error('Failed to update status'); }
    }

    function startGPS() {
        if (!navigator.geolocation) return;
        watchRef.current = navigator.geolocation.watchPosition(
            async pos => {
                try {
                    await API.patch('/courier/location/', {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    });
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
            toast.success('Order accepted! 🛵');
            setTab('active');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Could not accept order');
        }
        setAccepting(null);
    }

    async function deliverOrder(orderId) {
        try {
            await API.post(`/courier/deliver/${orderId}/`);
            setActiveOrder(null);
            toast.success('Order delivered! 🎉 +earnings added');
            init();
            setTab('orders');
        } catch { toast.error('Failed to mark as delivered'); }
    }

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '48px' }}>🛵</div>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Loading courier app...</p>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9', paddingBottom: '80px' }}>

            {/* Header */}
            <div style={{
                background: isOnline ? 'linear-gradient(135deg, #00A651, #007a3d)' : 'linear-gradient(135deg, #64748b, #475569)',
                padding: '20px 16px 24px', transition: 'background 0.5s',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                        }}>
                            🛵
                        </div>
                        <div>
                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Bonjour</p>
                            <p style={{ color: '#fff', fontWeight: '800', fontSize: '16px' }}>
                                {user?.first_name || user?.username}
                            </p>
                        </div>
                    </div>

                    {/* Online toggle */}
                    <button
                        onClick={toggleOnline}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: isOnline ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.15)',
                            border: '2px solid rgba(255,255,255,0.4)',
                            borderRadius: '24px', padding: '8px 16px',
                            color: '#fff', fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                        }}
                    >
                        <span style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: isOnline ? '#4ade80' : '#94a3b8',
                        }} />
                        {isOnline ? 'En ligne' : 'Hors ligne'}
                        {isOnline ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    {[
                        { label: "Aujourd'hui", value: `${earnings?.today_earnings?.toFixed(0) || 0} MAD`, icon: '💰' },
                        { label: 'Livraisons', value: earnings?.today_deliveries || 0, icon: '📦' },
                        { label: 'Total', value: `${earnings?.total_earnings?.toFixed(0) || 0} MAD`, icon: '🏦' },
                    ].map(s => (
                        <div key={s.label} style={{
                            flex: 1, background: 'rgba(255,255,255,0.15)',
                            borderRadius: '12px', padding: '10px', textAlign: 'center',
                        }}>
                            <p style={{ fontSize: '18px', marginBottom: '2px' }}>{s.icon}</p>
                            <p style={{ color: '#fff', fontWeight: '800', fontSize: '14px' }}>{s.value}</p>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px' }}>{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Active Order Banner */}
            <AnimatePresence>
                {activeOrder && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            margin: '16px', background: '#fff', borderRadius: '16px',
                            border: '2px solid #00A651', overflow: 'hidden',
                            boxShadow: '0 4px 20px rgba(0,166,81,0.2)',
                        }}
                    >
                        <div style={{ background: '#00A651', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', animation: 'pulse 1s infinite' }} />
                            <p style={{ color: '#fff', fontWeight: '700', fontSize: '13px' }}>🛵 LIVRAISON EN COURS</p>
                        </div>
                        <div style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <div>
                                    <p style={{ fontSize: '15px', fontWeight: '800' }}>Commande #{activeOrder.id}</p>
                                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                        {activeOrder.restaurant_name}
                                    </p>
                                </div>
                                <span style={{ fontWeight: '800', color: '#00A651', fontSize: '18px' }}>
                                    {parseFloat(activeOrder.total_price).toFixed(0)} MAD
                                </span>
                            </div>
                            <div style={{
                                background: '#f8fafc', borderRadius: '10px', padding: '10px 12px',
                                marginBottom: '12px', display: 'flex', alignItems: 'start', gap: '8px',
                            }}>
                                <MapPin size={16} color="#00A651" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.4 }}>
                                    {activeOrder.delivery_address}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>

                                <a href={`https://maps.google.com/?q=${encodeURIComponent(activeOrder.delivery_address)}`} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#f1f5f9', color: '#374151', fontWeight: '700', fontSize: '13px', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    <Navigation size={15} /> Naviguer
                                </a>
                                <button
                                    onClick={() => deliverOrder(activeOrder.id)}
                                    style={{
                                        flex: 2, padding: '12px', borderRadius: '10px', border: 'none',
                                        background: '#00A651', color: '#fff', fontWeight: '700',
                                        fontSize: '13px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                    }}
                                >
                                    <CheckCircle size={15} /> Marquer livré ✅
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tabs */}
            <div style={{ padding: '0 16px', marginTop: activeOrder ? '0' : '16px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    {[
                        { key: 'orders', label: `📦 Commandes (${availableOrders.length})` },
                        { key: 'earnings', label: '💰 Gains' },
                    ].map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)} style={{
                            flex: 1, padding: '10px', borderRadius: '12px', border: 'none',
                            cursor: 'pointer', fontSize: '13px', fontWeight: '700',
                            background: tab === t.key ? '#00A651' : '#fff',
                            color: tab === t.key ? '#fff' : '#64748b',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        }}>
                            {t.label}
                        </button>
                    ))}
                    <button onClick={() => { loadOrders(); init(); }} style={{
                        width: '42px', height: '42px', borderRadius: '12px', border: 'none',
                        cursor: 'pointer', background: '#fff', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    }}>
                        <RefreshCw size={16} color="#64748b" />
                    </button>
                </div>

                {/* Orders tab */}
                {tab === 'orders' && (
                    <div>
                        {!isOnline ? (
                            <div style={{
                                textAlign: 'center', padding: '48px 16px', background: '#fff',
                                borderRadius: '16px', border: '1px solid #e2e8f0',
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔴</div>
                                <p style={{ fontWeight: '700', fontSize: '16px', marginBottom: '6px' }}>
                                    Vous êtes hors ligne
                                </p>
                                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                                    Passez en ligne pour voir les commandes disponibles
                                </p>
                                <button onClick={toggleOnline} style={{
                                    background: '#00A651', color: '#fff', padding: '12px 28px',
                                    borderRadius: '12px', fontWeight: '700', border: 'none', cursor: 'pointer',
                                }}>
                                    Passer en ligne
                                </button>
                            </div>
                        ) : availableOrders.length === 0 ? (
                            <div style={{
                                textAlign: 'center', padding: '48px 16px', background: '#fff',
                                borderRadius: '16px', border: '1px solid #e2e8f0',
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '12px' }}>⏳</div>
                                <p style={{ fontWeight: '700', fontSize: '16px', marginBottom: '6px' }}>
                                    Aucune commande disponible
                                </p>
                                <p style={{ fontSize: '13px', color: '#64748b' }}>
                                    Les nouvelles commandes apparaîtront automatiquement
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {availableOrders.map((order, i) => (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        style={{
                                            background: '#fff', borderRadius: '16px', overflow: 'hidden',
                                            border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                                        }}
                                    >
                                        {/* Order header */}
                                        <div style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', padding: '12px 14px', borderBottom: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '20px' }}>🏪</span>
                                                    <div>
                                                        <p style={{ fontSize: '13px', fontWeight: '700' }}>{order.restaurant_name}</p>
                                                        <p style={{ fontSize: '11px', color: '#64748b' }}>Commande #{order.id}</p>
                                                    </div>
                                                </div>
                                                <span style={{ fontSize: '18px', fontWeight: '800', color: '#00A651' }}>
                                                    {parseFloat(order.total_price).toFixed(0)} MAD
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ padding: '12px 14px' }}>
                                            {/* Delivery address */}
                                            <div style={{ display: 'flex', alignItems: 'start', gap: '8px', marginBottom: '10px' }}>
                                                <MapPin size={14} color="#00A651" style={{ flexShrink: 0, marginTop: '2px' }} />
                                                <p style={{ fontSize: '12px', color: '#374151', lineHeight: 1.4 }}>
                                                    {order.delivery_address}
                                                </p>
                                            </div>

                                            {/* Items count */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                                                <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Package size={12} /> {order.items?.length || 0} articles
                                                </span>
                                                <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={12} /> {new Date(order.created_at).toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span style={{
                                                    fontSize: '11px', fontWeight: '700', color: '#00A651',
                                                    background: 'rgba(0,166,81,0.1)', padding: '2px 8px', borderRadius: '20px',
                                                }}>
                                                    +{(parseFloat(order.total_price) * 0.67 * 0.3).toFixed(0)} MAD gain
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => acceptOrder(order.id)}
                                                disabled={accepting === order.id || !!activeOrder}
                                                style={{
                                                    width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                                                    background: activeOrder ? '#f1f5f9' : '#00A651',
                                                    color: activeOrder ? '#94a3b8' : '#fff',
                                                    fontWeight: '700', fontSize: '14px', cursor: activeOrder ? 'not-allowed' : 'pointer',
                                                    opacity: accepting === order.id ? 0.6 : 1,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                }}
                                            >
                                                {accepting === order.id ? 'Acceptation...' :
                                                    activeOrder ? 'Terminez la livraison en cours' : '🛵 Accepter la livraison'}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Earnings tab */}
                {tab === 'earnings' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Today */}
                        <div style={{
                            background: 'linear-gradient(135deg, #00A651, #007a3d)',
                            borderRadius: '16px', padding: '20px',
                        }}>
                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginBottom: '4px' }}>
                                Gains aujourd'hui
                            </p>
                            <p style={{ color: '#fff', fontSize: '36px', fontWeight: '800', lineHeight: 1 }}>
                                {earnings?.today_earnings?.toFixed(2) || '0.00'} MAD
                            </p>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '6px' }}>
                                {earnings?.today_deliveries || 0} livraisons effectuées
                            </p>
                        </div>

                        {/* Stats grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {[
                                { label: 'Gains totaux', value: `${earnings?.total_earnings?.toFixed(0) || 0} MAD`, icon: '🏦', color: '#3b82f6' },
                                { label: 'Total livraisons', value: earnings?.total_deliveries || 0, icon: '📦', color: '#8b5cf6' },
                            ].map(s => (
                                <div key={s.label} style={{
                                    background: '#fff', borderRadius: '14px', padding: '16px',
                                    border: '1px solid #e2e8f0', textAlign: 'center',
                                }}>
                                    <p style={{ fontSize: '28px', marginBottom: '6px' }}>{s.icon}</p>
                                    <p style={{ fontSize: '20px', fontWeight: '800', color: s.color }}>{s.value}</p>
                                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Info */}
                        <div style={{
                            background: '#fff', borderRadius: '14px', padding: '16px',
                            border: '1px solid #e2e8f0',
                        }}>
                            <p style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>
                                💡 Comment sont calculés vos gains?
                            </p>
                            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
                                Vous recevez <strong>20% de chaque commande livrée</strong>.
                                Les paiements sont effectués chaque semaine par virement.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}