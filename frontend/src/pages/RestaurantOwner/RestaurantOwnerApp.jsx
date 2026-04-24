import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, ShoppingBag, UtensilsCrossed, ToggleLeft, ToggleRight,
  RefreshCw, Plus, Edit2, Trash2, CheckCircle, XCircle,
  ChevronDown, ChevronUp, DollarSign, Clock, Star, Bell,
  TrendingUp, Package, X, Save, MapPin, Phone, Image,
  BarChart2, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_META = {
  pending: { bg: '#fef9c3', color: '#ca8a04', border: '#fde68a', label: 'Nouvelle', emoji: '🔔' },
  confirmed: { bg: '#dbeafe', color: '#2563eb', border: '#bfdbfe', label: 'Confirmée', emoji: '✅' },
  preparing: { bg: '#f3e8ff', color: '#7c3aed', border: '#ddd6fe', label: 'Préparation', emoji: '👨‍🍳' },
  picked_up: { bg: '#cffafe', color: '#0891b2', border: '#a5f3fc', label: 'En route', emoji: '🛵' },
  delivered: { bg: '#dcfce7', color: '#16a34a', border: '#a7f3d0', label: 'Livrée', emoji: '✓' },
  cancelled: { bg: '#fee2e2', color: '#dc2626', border: '#fecaca', label: 'Annulée', emoji: '✗' },
};

const NEXT_STATUS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: [],
  picked_up: [],
};

const CATEGORIES = ['Plats', 'Entrées', 'Desserts', 'Boissons', 'Accompagnements', 'Spéciaux'];

// ── Small Components ──

function StatCard({ icon, label, value, sub, color, bg }) {
  return (
    <div style={{
      flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: '14px',
      padding: '12px', textAlign: 'center',
    }}>
      <p style={{ fontSize: '18px', marginBottom: '4px' }}>{icon}</p>
      <p style={{ color: '#fff', fontWeight: '900', fontSize: '15px', letterSpacing: '-0.02em' }}>{value}</p>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px', marginTop: '1px' }}>{label}</p>
      {sub && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px' }}>{sub}</p>}
    </div>
  );
}

function OrderCard({ order, onStatusChange, updating }) {
  const [open, setOpen] = useState(false);
  const s = STATUS_META[order.status] || STATUS_META.pending;
  const nextStatuses = NEXT_STATUS[order.status] || [];
  const isNew = order.status === 'pending';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#fff', borderRadius: '16px', overflow: 'hidden',
        border: isNew ? `2px solid ${s.color}` : `1.5px solid ${s.border}`,
        boxShadow: isNew ? `0 4px 20px ${s.color}25` : '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      {/* Status bar */}
      <div style={{
        background: s.bg, padding: '8px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${s.border}`,
      }}>
        <span style={{ fontSize: '12px', fontWeight: '800', color: s.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isNew && <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: s.color, animation: 'ping 1s infinite' }} />}
          {s.emoji} {s.label.toUpperCase()}
        </span>
        <span style={{ fontSize: '11px', color: s.color, fontWeight: '600' }}>
          {new Date(order.created_at).toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Header */}
      <div onClick={() => setOpen(!open)} style={{ padding: '13px 14px', cursor: 'pointer' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '15px', fontWeight: '800', color: '#111', letterSpacing: '-0.01em' }}>
              Commande #{order.id}
            </p>
            <p style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
              👤 {order.customer_username}
              {order.order_items?.length > 0 && ` · ${order.order_items.length} article${order.order_items.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '17px', fontWeight: '900', color: '#FF6B00', letterSpacing: '-0.02em' }}>
              {parseFloat(order.total_price).toFixed(0)} MAD
            </span>
            {open ? <ChevronUp size={16} color="#bbb" /> : <ChevronDown size={16} color="#bbb" />}
          </div>
        </div>
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 14px 14px', borderTop: '1px solid #f5f5f5' }}>
              {/* Address */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', margin: '10px 0 10px', background: '#f9f9f9', borderRadius: '10px', padding: '8px 10px' }}>
                <MapPin size={13} color="#FF6B00" style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.4 }}>{order.delivery_address}</p>
              </div>

              {/* Items */}
              <div style={{ marginBottom: '12px' }}>
                {order.order_items?.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '5px 0', borderBottom: '1px solid #f5f5f5' }}>
                    <span style={{ color: '#444', fontWeight: '500' }}>
                      <span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '5px', background: '#FFF3E8', color: '#FF6B00', fontSize: '10px', fontWeight: '800', textAlign: 'center', lineHeight: '20px', marginRight: '6px' }}>
                        {item.quantity}
                      </span>
                      {item.menu_item_name}
                    </span>
                    <span style={{ fontWeight: '700' }}>{(item.price * item.quantity).toFixed(0)} MAD</span>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div style={{ background: '#f9f9f9', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                  <span>🛵 Livraison</span><span>{parseFloat(order.delivery_fee || 0).toFixed(0)} MAD</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '800', paddingTop: '6px', borderTop: '1px solid #eee' }}>
                  <span>Total</span>
                  <span style={{ color: '#FF6B00' }}>{parseFloat(order.total_price).toFixed(0)} MAD</span>
                </div>
                <p style={{ fontSize: '10px', color: '#bbb', marginTop: '4px' }}>
                  {order.payment_method === 'cash' ? '💵 Espèces' : '💳 Carte'}
                </p>
              </div>

              {/* Action buttons */}
              {nextStatuses.length > 0 && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {nextStatuses.map(ns => {
                    const nm = STATUS_META[ns];
                    const isAccept = ns === 'confirmed';
                    const isCancel = ns === 'cancelled';
                    return (
                      <button
                        key={ns}
                        onClick={() => onStatusChange(order.id, ns)}
                        disabled={updating === order.id}
                        style={{
                          flex: isCancel ? 0 : 1,
                          width: isCancel ? '44px' : 'auto',
                          padding: '11px', borderRadius: '12px', border: 'none',
                          cursor: updating === order.id ? 'not-allowed' : 'pointer',
                          background: isAccept ? '#FF6B00' : isCancel ? '#fee2e2' : nm.bg,
                          color: isAccept ? '#fff' : isCancel ? '#dc2626' : nm.color,
                          fontWeight: '800', fontSize: '13px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          opacity: updating === order.id ? 0.6 : 1,
                        }}
                      >
                        {isAccept ? <><CheckCircle size={15} /> Accepter</> :
                          isCancel ? <XCircle size={15} /> :
                            <>{nm.emoji} {nm.label}</>}
                      </button>
                    );
                  })}
                </div>
              )}

              {order.status === 'preparing' && (
                <div style={{ padding: '11px', borderRadius: '12px', background: '#fef9c3', color: '#ca8a04', fontWeight: '700', fontSize: '12px', textAlign: 'center' }}>
                  ⏳ En attente d'un livreur...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Menu Item Modal ──
function MenuItemModal({ item, onClose, onSave, categories }) {
  const [form, setForm] = useState(item || { name: '', description: '', price: '', category: 'Plats', is_available: true });
  const [saving, setSaving] = useState(false);
  const isEdit = !!item?.id;

  async function save() {
    if (!form.name || !form.price) { toast.error('Nom et prix requis'); return; }
    setSaving(true);
    try {
      let res;
      if (isEdit) {
        res = await API.patch(`/owner/menu/${item.id}/`, form);
      } else {
        res = await API.post('/owner/menu/add/', form);
      }
      onSave(res.data, isEdit);
      toast.success(isEdit ? 'Article modifié ✅' : 'Article ajouté 🍽️');
      onClose();
    } catch { toast.error('Erreur'); }
    setSaving(false);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '480px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800' }}>{isEdit ? 'Modifier' : 'Ajouter'} un article</h2>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {[
          { key: 'name', label: 'Nom *', placeholder: 'ex: Poulet rôti', type: 'text' },
          { key: 'description', label: 'Description', placeholder: 'Décrivez le plat...', type: 'text' },
          { key: 'price', label: 'Prix (MAD) *', placeholder: '0.00', type: 'number' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '5px', textTransform: 'uppercase' }}>{f.label}</label>
            <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        ))}

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '5px', textTransform: 'uppercase' }}>Catégorie</label>
          <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', background: '#fff' }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => setForm(p => ({ ...p, is_available: !p.is_available }))} style={{
            width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            background: form.is_available ? '#FF6B00' : '#e2e8f0', position: 'relative', transition: 'background 0.2s',
          }}>
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
              position: 'absolute', top: '3px', transition: 'left 0.2s',
              left: form.is_available ? '23px' : '3px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }} />
          </button>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
            {form.is_available ? 'Disponible' : 'Indisponible'}
          </span>
        </div>

        <button onClick={save} disabled={saving} style={{
          width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
          background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
          color: '#fff', fontWeight: '800', fontSize: '15px', cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
          <Save size={16} /> {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Ajouter au menu'}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Settings Modal ──
function SettingsModal({ restaurant, onClose, onSave }) {
  const [form, setForm] = useState({ description: restaurant.description || '', phone: restaurant.phone || '', image_url: restaurant.image_url || '' });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await API.patch('/owner/restaurant/update/', form);
      onSave(res.data);
      toast.success('Restaurant mis à jour ✅');
      onClose();
    } catch { toast.error('Erreur'); }
    setSaving(false);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '480px', padding: '24px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800' }}>Paramètres du restaurant</h2>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {[
          { key: 'description', label: 'Description', placeholder: 'Décrivez votre restaurant...' },
          { key: 'phone', label: 'Téléphone', placeholder: '+212 6XX XXX XXX' },
          { key: 'image_url', label: 'URL de l\'image', placeholder: 'https://...' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '5px', textTransform: 'uppercase' }}>{f.label}</label>
            <input placeholder={f.placeholder} value={form[f.key]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        ))}

        <button onClick={save} disabled={saving} style={{
          width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
          background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
          color: '#fff', fontWeight: '800', fontSize: '15px', cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.7 : 1,
        }}>
          {saving ? 'Enregistrement...' : '💾 Sauvegarder'}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Main Component ──
export default function RestaurantOwnerApp() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('orders');
  const [updating, setUpdating] = useState(null);
  const [modal, setModal] = useState(null); // 'add_item' | 'edit_item' | 'settings'
  const [editItem, setEditItem] = useState(null);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const prevOrdersRef = useRef([]);

  useEffect(() => { init(); }, []);

  useEffect(() => {
    if (tab === 'orders') {
      const interval = setInterval(async () => {
        try {
          const res = await API.get('/owner/orders/');
          const newOrders = res.data;
          const prevIds = prevOrdersRef.current.map(o => o.id);
          const newPending = newOrders.filter(o => o.status === 'pending' && !prevIds.includes(o.id));
          if (newPending.length > 0) {
            toast('🔔 Nouvelle commande!', { icon: '🛍️' });
            setNewOrderCount(c => c + newPending.length);
          }
          prevOrdersRef.current = newOrders;
          setOrders(newOrders);
        } catch { }
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [tab]);

  async function init() {
    setLoading(true);
    try {
      const [restRes, statsRes, ordersRes, menuRes] = await Promise.all([
        API.get('/owner/restaurant/'),
        API.get('/owner/stats/'),
        API.get('/owner/orders/'),
        API.get('/owner/menu/'),
      ]);
      setRestaurant(restRes.data);
      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setMenu(menuRes.data);
      prevOrdersRef.current = ordersRes.data;
    } catch {
      toast.error('Accès non autorisé');
      navigate('/apply/restaurant');
    }
    setLoading(false);
  }

  async function toggleOpen() {
    try {
      const res = await API.patch('/owner/restaurant/update/', { is_open: !restaurant.is_open });
      setRestaurant(res.data);
      toast.success(res.data.is_open ? '✅ Restaurant ouvert' : '🔴 Restaurant fermé');
    } catch { toast.error('Erreur'); }
  }

  async function updateOrderStatus(orderId, status) {
    setUpdating(orderId);
    try {
      await API.patch(`/owner/orders/${orderId}/`, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      toast.success(`Commande → ${STATUS_META[status].label}`);
    } catch { toast.error('Erreur'); }
    setUpdating(null);
  }

  function handleMenuSave(item, isEdit) {
    if (isEdit) {
      setMenu(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
      setMenu(prev => [...prev, item]);
    }
  }

  async function deleteMenuItem(itemId) {
    if (!window.confirm('Supprimer cet article?')) return;
    try {
      await API.delete(`/owner/menu/${itemId}/`);
      setMenu(prev => prev.filter(i => i.id !== itemId));
      toast.success('Article supprimé');
    } catch { toast.error('Erreur'); }
  }

  async function toggleItemAvailable(itemId, current) {
    try {
      const res = await API.patch(`/owner/menu/${itemId}/`, { is_available: !current });
      setMenu(prev => prev.map(i => i.id === itemId ? res.data : i));
    } catch { toast.error('Erreur'); }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px', background: '#f8f8f8' }}>
      <div style={{ fontSize: '56px' }}>🍽️</div>
      <p style={{ color: '#94a3b8', fontWeight: '600' }}>Chargement du dashboard...</p>
    </div>
  );

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));
  const categories = [...new Set(menu.map(i => i.category))];
  const availableCount = menu.filter(i => i.is_available).length;

  return (
    <div style={{ minHeight: '100vh', background: '#F7F7F8', paddingBottom: '80px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes ping { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.6);opacity:0.4} }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        background: restaurant?.is_open
          ? 'linear-gradient(135deg, #FF6B00 0%, #FF9A3C 100%)'
          : 'linear-gradient(135deg, #64748b, #475569)',
        padding: '20px 16px 24px',
        borderRadius: '0 0 28px 28px',
        transition: 'background 0.5s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {restaurant?.image_url ? (
              <img src={restaurant.image_url} alt="" style={{ width: '48px', height: '48px', borderRadius: '14px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }} />
            ) : (
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🍽️</div>
            )}
            <div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', fontWeight: '600' }}>Mon restaurant</p>
              <p style={{ color: '#fff', fontWeight: '900', fontSize: '17px', letterSpacing: '-0.02em' }}>{restaurant?.name}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px' }}>{restaurant?.category} · {restaurant?.city}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Settings */}
            <button onClick={() => setModal('settings')} style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Store size={16} color="#fff" />
            </button>

            {/* Open/Close toggle */}
            <button onClick={toggleOpen} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: restaurant?.is_open ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.4)',
              borderRadius: '24px', padding: '8px 14px',
              color: '#fff', fontWeight: '800', fontSize: '12px', cursor: 'pointer',
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: restaurant?.is_open ? '#4ade80' : '#f87171' }} />
              {restaurant?.is_open ? 'Ouvert' : 'Fermé'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <StatCard icon="💰" label="Aujourd'hui" value={`${stats?.net_today_revenue?.toFixed(0) || 0} MAD`} sub="votre part (80%)" />
          <StatCard icon="⏳" label="En attente" value={stats?.pending_orders || 0} />
          <StatCard icon="⭐" label="Note" value={stats?.rating?.toFixed(1) || '—'} />
          <StatCard icon="📦" label="Total" value={stats?.total_orders || 0} />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: '#EBEBEB', borderRadius: '14px', padding: '4px' }}>
          {[
            { key: 'orders', label: 'Commandes', badge: activeOrders.length },
            { key: 'menu', label: 'Menu', badge: null },
            { key: 'history', label: 'Stats', badge: null },
          ].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setNewOrderCount(0); }} style={{
              flex: 1, padding: '10px 6px', borderRadius: '11px', border: 'none',
              cursor: 'pointer', fontSize: '12px', fontWeight: '700',
              background: tab === t.key ? '#fff' : 'transparent',
              color: tab === t.key ? '#FF6B00' : '#888',
              boxShadow: tab === t.key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              position: 'relative', transition: 'all 0.2s',
              fontFamily: 'inherit',
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
          <button onClick={init} style={{
            width: '40px', height: '40px', borderRadius: '11px', border: 'none',
            cursor: 'pointer', background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <RefreshCw size={15} color="#888" />
          </button>
        </div>

        {/* ── Orders Tab ── */}
        {tab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '56px 24px', background: '#fff', borderRadius: '20px', border: '1.5px solid #F0F0F0' }}>
                <div style={{ fontSize: '52px', marginBottom: '14px' }}>🎉</div>
                <p style={{ fontWeight: '800', color: '#111', fontSize: '16px' }}>Aucune commande active</p>
                <p style={{ fontSize: '13px', color: '#AAA', marginTop: '6px' }}>Les nouvelles commandes apparaîtront ici automatiquement</p>
              </div>
            ) : activeOrders.map(order => (
              <OrderCard key={order.id} order={order} onStatusChange={updateOrderStatus} updating={updating} />
            ))}
          </div>
        )}

        {/* ── Menu Tab ── */}
        {tab === 'menu' && (
          <div>
            {/* Menu header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <p style={{ fontSize: '15px', fontWeight: '800', color: '#111' }}>{menu.length} articles</p>
                <p style={{ fontSize: '12px', color: '#AAA' }}>{availableCount} disponibles</p>
              </div>
              <button onClick={() => { setEditItem(null); setModal('item'); }} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
                color: '#fff', padding: '10px 16px', borderRadius: '12px',
                fontWeight: '800', fontSize: '13px', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255,107,0,0.3)', fontFamily: 'inherit',
              }}>
                <Plus size={15} /> Ajouter
              </button>
            </div>

            {categories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', background: '#fff', borderRadius: '20px', border: '1.5px solid #F0F0F0' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍽️</div>
                <p style={{ fontWeight: '800', color: '#111' }}>Menu vide</p>
                <p style={{ fontSize: '13px', color: '#AAA', marginTop: '4px' }}>Ajoutez vos premiers articles</p>
              </div>
            ) : categories.map(cat => (
              <div key={cat} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cat}</h3>
                  <div style={{ flex: 1, height: '1px', background: '#F0F0F0' }} />
                  <span style={{ fontSize: '11px', color: '#BBB' }}>{menu.filter(i => i.category === cat).length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {menu.filter(i => i.category === cat).map(item => (
                    <motion.div key={item.id}
                      style={{
                        background: '#fff', borderRadius: '14px', padding: '13px 14px',
                        border: '1.5px solid #F0F0F0',
                        display: 'flex', alignItems: 'center', gap: '12px',
                        opacity: item.is_available ? 1 : 0.55,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#111', marginBottom: '2px' }}>{item.name}</p>
                        {item.description && <p style={{ fontSize: '11px', color: '#AAA', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</p>}
                        <p style={{ fontSize: '14px', fontWeight: '900', color: '#FF6B00', letterSpacing: '-0.01em' }}>{item.price} MAD</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <button onClick={() => toggleItemAvailable(item.id, item.is_available)} style={{
                          padding: '5px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                          background: item.is_available ? '#dcfce7' : '#f1f5f9',
                          color: item.is_available ? '#16a34a' : '#94a3b8',
                          fontSize: '11px', fontWeight: '700',
                        }}>
                          {item.is_available ? 'Dispo' : 'Indispo'}
                        </button>
                        <button onClick={() => { setEditItem(item); setModal('item'); }} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#FFF3E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Edit2 size={13} color="#FF6B00" />
                        </button>
                        <button onClick={() => deleteMenuItem(item.id)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={13} color="#dc2626" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Stats Tab ── */}
        {/* ── Stats Tab ── */}
        {tab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Summary strip */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', border: '1.5px solid #F0F0F0', display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #F0F0F0' }}>
                <p style={{ fontSize: '22px', fontWeight: '900', color: '#FF6B00', letterSpacing: '-0.02em' }}>{stats?.total_orders || 0}</p>
                <p style={{ fontSize: '11px', color: '#AAA', fontWeight: '600' }}>Commandes totales</p>
              </div>
              <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #F0F0F0' }}>
                <p style={{ fontSize: '22px', fontWeight: '900', color: '#16a34a', letterSpacing: '-0.02em' }}>{stats?.net_revenue?.toFixed(0) || 0} MAD</p>
                <p style={{ fontSize: '11px', color: '#AAA', fontWeight: '600' }}>Votre part (80%)</p>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: '22px', fontWeight: '900', color: '#2563eb', letterSpacing: '-0.02em' }}>{stats?.total_revenue?.toFixed(0) || 0} MAD</p>
                <p style={{ fontSize: '11px', color: '#AAA', fontWeight: '600' }}>Revenu brut</p>
              </div>
            </div>

            {/* Past orders list */}
            <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#AAA', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Historique</h3>
            {pastOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', background: '#fff', borderRadius: '20px', border: '1.5px solid #F0F0F0' }}>
                <p style={{ fontSize: '40px', marginBottom: '12px' }}>📋</p>
                <p style={{ fontWeight: '800', color: '#111' }}>Pas encore d'historique</p>
              </div>
            ) : pastOrders.map((order, i) => {
              const s = STATUS_META[order.status];
              const earning = (parseFloat(order.total_price) * 0.80).toFixed(0);
              return (
                <motion.div key={order.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
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
                      <p style={{ fontSize: '15px', fontWeight: '900', color: order.status === 'delivered' ? '#16a34a' : '#dc2626' }}>
                        {order.status === 'delivered' ? `+${earning} MAD` : `${parseFloat(order.total_price).toFixed(0)} MAD`}
                      </p>
                      <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', background: s?.bg, color: s?.color }}>
                        {s?.emoji} {s?.label}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F9F9F9', borderRadius: '10px', padding: '8px 10px', marginBottom: '8px' }}>
                    <MapPin size={11} color="#FF6B00" />
                    <p style={{ fontSize: '11px', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.delivery_address}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ background: '#F0FDF4', borderRadius: '8px', padding: '6px 10px', flex: 1 }}>
                      <p style={{ fontSize: '9px', fontWeight: '700', color: '#16a34a', marginBottom: '2px' }}>👤 CLIENT</p>
                      <p style={{ fontSize: '11px', fontWeight: '700', color: '#111' }}>{order.customer_username}</p>
                    </div>
                    <div style={{ background: '#F9F9F9', borderRadius: '8px', padding: '6px 10px', flex: 1 }}>
                      <p style={{ fontSize: '9px', fontWeight: '700', color: '#888', marginBottom: '2px' }}>💳 PAIEMENT</p>
                      <p style={{ fontSize: '11px', fontWeight: '700', color: '#111' }}>{order.payment_method === 'cash' ? '💵 Espèces' : '💳 Carte'}</p>
                    </div>
                    <div style={{ background: '#FFF3E8', borderRadius: '8px', padding: '6px 10px', flex: 1 }}>
                      <p style={{ fontSize: '9px', fontWeight: '700', color: '#FF6B00', marginBottom: '2px' }}>💰 GAIN</p>
                      <p style={{ fontSize: '11px', fontWeight: '700', color: '#FF6B00' }}>{earning} MAD</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {modal === 'item' && (
          <MenuItemModal
            item={editItem}
            onClose={() => { setModal(null); setEditItem(null); }}
            onSave={handleMenuSave}
            categories={CATEGORIES}
          />
        )}
        {modal === 'settings' && (
          <SettingsModal
            restaurant={restaurant}
            onClose={() => setModal(null)}
            onSave={r => setRestaurant(r)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
