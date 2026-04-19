import { useState, useEffect } from 'react';
import API from '../../../services/api';
import { TrendingUp, ShoppingBag, Store, Bike, Users, DollarSign, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

function StatCard({ icon: Icon, label, value, sub, color, bg, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid #e2e8f0', padding: '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{
        width: '40px', height: '40px', borderRadius: '12px',
        background: bg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', marginBottom: '14px',
      }}>
        <Icon size={18} color={color} />
      </div>
      <p style={{ fontSize: '24px', fontWeight: '800', lineHeight: 1, marginBottom: '4px' }}>{value}</p>
      <p style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>{label}</p>
      {sub && <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{sub}</p>}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const [o, r] = await Promise.all([
        API.get('/orders/all/'),
        API.get('/restaurants/'),
      ]);
      setOrders(o.data);
      setRestaurants(r.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const delivered = orders.filter(o => o.status === 'delivered');
  const revenue = delivered.reduce((s, o) => s + parseFloat(o.total_price || 0), 0);
  const active = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('fr-MA', { weekday: 'short' });
    const rev = delivered
      .filter(o => new Date(o.created_at).toDateString() === d.toDateString())
      .reduce((s, o) => s + parseFloat(o.total_price || 0), 0);
    return { label, revenue: Math.round(rev) };
  });

  const stats = [
    { icon: DollarSign, label: 'Revenu total', value: `${revenue.toFixed(0)} MAD`, sub: `${delivered.length} livrées`, color: '#16a34a', bg: '#dcfce7', delay: 0 },
    { icon: TrendingUp, label: 'Commission (15%)', value: `${(revenue * 0.15).toFixed(0)} MAD`, sub: 'Vos gains', color: '#00A651', bg: 'rgba(0,166,81,0.1)', delay: 0.05 },
    { icon: ShoppingBag, label: 'Commandes actives', value: active.length, sub: 'En ce moment', color: '#2563eb', bg: '#dbeafe', delay: 0.1 },
    { icon: Store, label: 'Restaurants', value: restaurants.length, sub: 'Enregistrés', color: '#ca8a04', bg: '#fef9c3', delay: 0.15 },
    { icon: ShoppingBag, label: 'Total commandes', value: orders.length, sub: 'Depuis le début', color: '#7c3aed', bg: '#f3e8ff', delay: 0.2 },
    { icon: TrendingUp, label: 'Panier moyen', value: delivered.length ? `${(revenue / delivered.length).toFixed(0)} MAD` : '—', sub: 'Par commande', color: '#ea580c', bg: '#ffedd5', delay: 0.25 },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button onClick={load} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
          padding: '8px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
          color: '#64748b',
        }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: '130px', background: '#f1f5f9', borderRadius: '16px' }} />
          ))}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {stats.map((s, i) => <StatCard key={i} {...s} />)}
          </div>

          {/* Chart */}
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '20px',
            border: '1px solid #e2e8f0', marginBottom: '24px',
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>
              📈 Revenus — 7 derniers jours
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={last7} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={v => [`${v} MAD`, 'Revenu']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="revenue" fill="#00A651" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent orders */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700' }}>🛍️ Commandes récentes</h2>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['#', 'Client', 'Restaurant', 'Total', 'Statut', 'Date'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((o, i) => (
                  <tr key={o.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#64748b' }}>#{o.id}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px' }}>{o.customer_username}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>{o.restaurant_name}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#00A651' }}>{parseFloat(o.total_price).toFixed(0)} MAD</td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={o.status} />
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#94a3b8' }}>
                      {new Date(o.created_at).toLocaleDateString('fr-MA')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' }}>
                No orders yet
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    pending:   { bg: '#fef9c3', color: '#ca8a04' },
    confirmed: { bg: '#dbeafe', color: '#2563eb' },
    preparing: { bg: '#f3e8ff', color: '#7c3aed' },
    picked_up: { bg: '#cffafe', color: '#0891b2' },
    delivered: { bg: '#dcfce7', color: '#16a34a' },
    cancelled: { bg: '#fee2e2', color: '#dc2626' },
  };
  const c = colors[status] || colors.pending;
  return (
    <span style={{
      fontSize: '11px', fontWeight: '600', padding: '3px 10px',
      borderRadius: '20px', background: c.bg, color: c.color,
    }}>
      {status}
    </span>
  );
}