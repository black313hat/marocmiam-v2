import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, ShoppingBag, UtensilsCrossed, ToggleLeft, ToggleRight,
  RefreshCw, Plus, Edit2, Trash2, CheckCircle, XCircle,
  ChevronDown, ChevronUp, DollarSign, Clock, Star
} from 'lucide-react';
import toast from 'react-hot-toast';

const ORDER_STATUS_COLORS = {
  pending: { bg: '#fef9c3', color: '#ca8a04' },
  confirmed: { bg: '#dbeafe', color: '#2563eb' },
  preparing: { bg: '#f3e8ff', color: '#7c3aed' },
  picked_up: { bg: '#cffafe', color: '#0891b2' },
  delivered: { bg: '#dcfce7', color: '#16a34a' },
  cancelled: { bg: '#fee2e2', color: '#dc2626' },
};

export default function RestaurantOwnerApp() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('orders');
  const [expanded, setExpanded] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: 'Plats' });
  const [updating, setUpdating] = useState(null);

  useEffect(() => { init(); }, []);

  useEffect(() => {
    if (tab === 'orders') {
      const interval = setInterval(loadOrders, 15000);
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
    } catch {
      toast.error('Not a restaurant owner or not approved yet');
      navigate('/apply/restaurant');
    }
    setLoading(false);
  }

  async function loadOrders() {
    try {
      const res = await API.get('/owner/orders/');
      setOrders(res.data);
    } catch { }
  }

  async function toggleOpen() {
    try {
      const res = await API.patch('/owner/restaurant/update/', { is_open: !restaurant.is_open });
      setRestaurant(res.data);
      toast.success(res.data.is_open ? 'Restaurant ouvert ✅' : 'Restaurant fermé 🔴');
    } catch { toast.error('Failed'); }
  }

  async function updateOrderStatus(orderId, status) {
    setUpdating(orderId);
    try {
      await API.patch(`/owner/orders/${orderId}/`, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      toast.success(`Commande → ${status}`);
    } catch { toast.error('Failed'); }
    setUpdating(null);
  }

  async function addMenuItem() {
    if (!newItem.name || !newItem.price) { toast.error('Fill name and price'); return; }
    try {
      const res = await API.post('/owner/menu/add/', newItem);
      setMenu(prev => [...prev, res.data]);
      setNewItem({ name: '', description: '', price: '', category: 'Plats' });
      setShowAddItem(false);
      toast.success('Item added! 🍽️');
    } catch { toast.error('Failed to add item'); }
  }

  async function toggleItemAvailable(itemId, current) {
    try {
      const res = await API.patch(`/owner/menu/${itemId}/`, { is_available: !current });
      setMenu(prev => prev.map(i => i.id === itemId ? res.data : i));
    } catch { toast.error('Failed'); }
  }

  async function deleteMenuItem(itemId) {
    if (!window.confirm('Delete this item?')) return;
    try {
      await API.delete(`/owner/menu/${itemId}/`);
      setMenu(prev => prev.filter(i => i.id !== itemId));
      toast.success('Item deleted');
    } catch { toast.error('Failed'); }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '48px' }}>🏪</div>
      <p style={{ color: '#64748b' }}>Loading dashboard...</p>
    </div>
  );

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const categories = [...new Set(menu.map(i => i.category))];

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{
        background: restaurant?.is_open
          ? 'linear-gradient(135deg, #00A651, #007a3d)'
          : 'linear-gradient(135deg, #64748b, #475569)',
        padding: '20px 16px 24px',
        transition: 'background 0.5s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
            }}>
              🏪
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Dashboard</p>
              <p style={{ color: '#fff', fontWeight: '800', fontSize: '16px', lineHeight: 1.2 }}>
                {restaurant?.name}
              </p>
            </div>
          </div>

          {/* Open/Close toggle */}
          <button onClick={toggleOpen} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)',
            borderRadius: '24px', padding: '8px 14px',
            color: '#fff', fontWeight: '700', fontSize: '12px', cursor: 'pointer',
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: restaurant?.is_open ? '#4ade80' : '#f87171',
            }} />
            {restaurant?.is_open ? 'Ouvert' : 'Fermé'}
            {restaurant?.is_open ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { label: "Aujourd'hui", value: `${stats?.net_today_revenue?.toFixed(0) || 0} MAD`, icon: '💰', sub: 'net (80%)' },
            { label: 'En attente', value: stats?.pending_orders || 0, icon: '⏳' },
            { label: 'Note', value: stats?.rating?.toFixed(1) || '—', icon: '⭐' },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, background: 'rgba(255,255,255,0.15)',
              borderRadius: '12px', padding: '10px', textAlign: 'center',
            }}>
              <p style={{ fontSize: '16px', marginBottom: '2px' }}>{s.icon}</p>
              <p style={{ color: '#fff', fontWeight: '800', fontSize: '14px' }}>{s.value}</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '10px' }}>{s.label}</p>
              {s.sub && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px' }}>{s.sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[
            { key: 'orders', label: `🛍️ Commandes ${activeOrders.length > 0 ? `(${activeOrders.length})` : ''}` },
            { key: 'menu', label: `🍽️ Menu (${menu.length})` },
            { key: 'history', label: '📋 Historique' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: '10px 6px', borderRadius: '12px', border: 'none',
              cursor: 'pointer', fontSize: '12px', fontWeight: '700',
              background: tab === t.key ? '#00A651' : '#fff',
              color: tab === t.key ? '#fff' : '#64748b',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              whiteSpace: 'nowrap',
            }}>
              {t.label}
            </button>
          ))}
          <button onClick={() => { loadOrders(); init(); }} style={{
            width: '42px', height: '42px', borderRadius: '12px', border: 'none',
            cursor: 'pointer', background: '#fff', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <RefreshCw size={15} color="#64748b" />
          </button>
        </div>

        {/* Orders tab */}
        {tab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
                <p style={{ fontWeight: '700', color: '#374151' }}>Aucune commande active</p>
                <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Les nouvelles commandes apparaîtront ici</p>
              </div>
            ) : activeOrders.map((order, i) => {
              const c = ORDER_STATUS_COLORS[order.status] || ORDER_STATUS_COLORS.pending;
              const isOpen = expanded === order.id;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    background: '#fff', borderRadius: '16px',
                    border: `2px solid ${c.color}30`, overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ background: c.bg, padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: c.color }}>
                      {order.status === 'pending' ? '🔔 NOUVELLE COMMANDE' :
                        order.status === 'confirmed' ? '✅ CONFIRMÉE' :
                          order.status === 'preparing' ? '👨‍🍳 EN PRÉPARATION' : order.status.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '11px', color: c.color }}>
                      {new Date(order.created_at).toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    style={{ padding: '12px 14px', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '700' }}>Commande #{order.id}</p>
                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          👤 {order.customer_username}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '800', color: '#00A651' }}>
                          {parseFloat(order.total_price).toFixed(0)} MAD
                        </span>
                        {isOpen ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
                      </div>
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
                        <div style={{ padding: '0 14px 14px', borderTop: '1px solid #f1f5f9' }}>
                          <p style={{ fontSize: '12px', color: '#64748b', margin: '10px 0 8px' }}>
                            📍 {order.delivery_address}
                          </p>
                          {order.items?.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '3px 0' }}>
                              <span>{item.quantity}× {item.menu_item_name}</span>
                              <span style={{ fontWeight: '600' }}>{(item.price * item.quantity).toFixed(0)} MAD</span>
                            </div>
                          ))}

                          {/* Action buttons */}
                          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            {order.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                  disabled={updating === order.id}
                                  style={{
                                    flex: 2, padding: '10px', borderRadius: '10px', border: 'none',
                                    background: '#00A651', color: '#fff', fontWeight: '700',
                                    fontSize: '13px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                  }}
                                >
                                  <CheckCircle size={15} /> Accepter
                                </button>
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                  disabled={updating === order.id}
                                  style={{
                                    flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                                    background: '#fee2e2', color: '#dc2626', fontWeight: '700',
                                    fontSize: '13px', cursor: 'pointer',
                                  }}
                                >
                                  <XCircle size={15} />
                                </button>
                              </>
                            )}
                            {order.status === 'confirmed' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'preparing')}
                                disabled={updating === order.id}
                                style={{
                                  flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                                  background: '#f3e8ff', color: '#7c3aed', fontWeight: '700',
                                  fontSize: '13px', cursor: 'pointer',
                                }}
                              >
                                👨‍🍳 Commencer la préparation
                              </button>
                            )}
                            {order.status === 'preparing' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'picked_up')}
                                disabled={updating === order.id}
                                style={{
                                  flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                                  background: '#cffafe', color: '#0891b2', fontWeight: '700',
                                  fontSize: '13px', cursor: 'pointer',
                                }}
                              >
                                🛵 Prêt pour livraison
                              </button>
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

        {/* Menu tab */}
        {tab === 'menu' && (
          <div>
            <button
              onClick={() => setShowAddItem(!showAddItem)}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                background: '#00A651', color: '#fff', fontWeight: '700', fontSize: '14px',
                cursor: 'pointer', marginBottom: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <Plus size={18} /> Ajouter un article
            </button>

            {/* Add item form */}
            <AnimatePresence>
              {showAddItem && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden', marginBottom: '14px' }}
                >
                  <div style={{ background: '#fff', borderRadius: '14px', padding: '16px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>
                      Nouvel article
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input
                        placeholder="Nom *"
                        value={newItem.name}
                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                        style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                      />
                      <input
                        placeholder="Description"
                        value={newItem.description}
                        onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                        style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          placeholder="Prix (MAD) *"
                          type="number"
                          value={newItem.price}
                          onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                          style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                        />
                        <select
                          value={newItem.category}
                          onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                          style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                        >
                          {['Plats', 'Entrées', 'Desserts', 'Boissons', 'Accompagnements'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={addMenuItem}
                        style={{
                          padding: '12px', borderRadius: '10px', border: 'none',
                          background: '#00A651', color: '#fff', fontWeight: '700',
                          fontSize: '14px', cursor: 'pointer',
                        }}
                      >
                        ✅ Ajouter
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Menu items by category */}
            {categories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '14px', color: '#94a3b8' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🍽️</div>
                <p style={{ fontWeight: '600' }}>Aucun article dans le menu</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>Ajoutez des articles pour commencer</p>
              </div>
            ) : categories.map(cat => (
              <div key={cat} style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: '#374151' }}>
                  {cat}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {menu.filter(i => i.category === cat).map(item => (
                    <div key={item.id} style={{
                      background: '#fff', borderRadius: '12px', padding: '12px 14px',
                      border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', opacity: item.is_available ? 1 : 0.6,
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '13px', fontWeight: '700' }}>{item.name}</p>
                        <p style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>{item.description}</p>
                        <p style={{ fontSize: '13px', fontWeight: '800', color: '#00A651', marginTop: '3px' }}>
                          {item.price} MAD
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '10px' }}>
                        <button
                          onClick={() => toggleItemAvailable(item.id, item.is_available)}
                          style={{
                            padding: '5px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: item.is_available ? '#dcfce7' : '#f1f5f9',
                            color: item.is_available ? '#16a34a' : '#94a3b8',
                            fontSize: '11px', fontWeight: '600',
                          }}
                        >
                          {item.is_available ? 'Dispo' : 'Indispo'}
                        </button>
                        <button
                          onClick={() => deleteMenuItem(item.id)}
                          style={{
                            width: '30px', height: '30px', borderRadius: '8px', border: 'none',
                            cursor: 'pointer', background: '#fee2e2', color: '#dc2626',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History tab */}
        {tab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              background: '#fff', borderRadius: '14px', padding: '16px',
              border: '1px solid #e2e8f0', marginBottom: '8px',
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
            }}>
              {[
                { label: 'Total commandes', value: stats?.total_orders || 0, icon: '📦' },
                { label: 'Revenu brut', value: `${stats?.total_revenue?.toFixed(0) || 0} MAD`, icon: '💵' },
                { label: 'Votre part (80%)', value: `${stats?.net_revenue?.toFixed(0) || 0} MAD`, icon: '💰' },
                { label: 'Commission (20%)', value: `${((stats?.total_revenue || 0) * 0.20).toFixed(0)} MAD`, icon: '🏦' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '24px', marginBottom: '4px' }}>{s.icon}</p>
                  <p style={{ fontSize: '18px', fontWeight: '800', color: '#00A651' }}>{s.value}</p>
                  <p style={{ fontSize: '11px', color: '#94a3b8' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {orders.filter(o => ['delivered', 'cancelled'].includes(o.status)).map((order, i) => {
              const c = ORDER_STATUS_COLORS[order.status];
              return (
                <div key={order.id} style={{
                  background: '#fff', borderRadius: '12px', padding: '12px 14px',
                  border: '1px solid #e2e8f0', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '700' }}>Commande #{order.id}</p>
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      {order.customer_username} · {new Date(order.created_at).toLocaleDateString('fr-MA')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#00A651' }}>
                      {parseFloat(order.total_price).toFixed(0)} MAD
                    </span>
                    <span style={{
                      fontSize: '10px', fontWeight: '600', padding: '2px 8px',
                      borderRadius: '20px', background: c?.bg, color: c?.color,
                    }}>
                      {order.status}
                    </span>
                  </div>
                </div>
              );
            })}

            {orders.filter(o => ['delivered', 'cancelled'].includes(o.status)).length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '14px', color: '#94a3b8' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📋</div>
                <p style={{ fontWeight: '600' }}>Pas encore d'historique</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}