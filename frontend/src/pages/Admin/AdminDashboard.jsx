import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Store, Bike, DollarSign, Users, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getOrders, getRestaurants } from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        background: 'var(--card)', borderRadius: 'var(--radius)',
        border: '1px solid var(--border)', padding: '16px',
        boxShadow: 'var(--shadow)',
      }}
    >
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '12px', ...color,
      }}>
        <Icon size={16} />
      </div>
      <p style={{ fontSize: '22px', fontWeight: '800', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--foreground)', marginTop: '4px' }}>{label}</p>
      {sub && <p style={{ fontSize: '11px', color: 'var(--muted-fg)', marginTop: '2px' }}>{sub}</p>}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [o, r] = await Promise.all([getOrders(), getRestaurants()]);
      setOrders(o.data);
      setRestaurants(r.data);
    } catch { toast.error('Failed to load data'); }
    setLoading(false);
  }

  const delivered = orders.filter(o => o.status === 'delivered');
  const totalRevenue = delivered.reduce((s, o) => s + parseFloat(o.total_price || 0), 0);
  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));

  // Last 7 days chart data
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('fr-MA', { weekday: 'short' });
    const dayOrders = delivered.filter(o => new Date(o.created_at).toDateString() === d.toDateString());
    return { label, revenue: dayOrders.reduce((s, o) => s + parseFloat(o.total_price || 0), 0) };
  });

  const stats = [
    { label: 'Total Revenue', value: `${totalRevenue.toFixed(0)} MAD`, icon: DollarSign, sub: `${delivered.length} delivered`, color: { background: '#dcfce7', color: '#16a34a' } },
    { label: 'Commission (15%)', value: `${(totalRevenue * 0.15).toFixed(0)} MAD`, icon: TrendingUp, sub: 'Platform earnings', color: { background: 'var(--primary-light)', color: 'var(--primary)' } },
    { label: 'Active Orders', value: activeOrders.length, icon: ShoppingBag, sub: 'Right now', color: { background: '#dbeafe', color: '#2563eb' } },
    { label: 'Restaurants', value: restaurants.length, icon: Store, sub: 'Registered', color: { background: '#fef9c3', color: '#ca8a04' } },
    { label: 'Total Orders', value: orders.length, icon: Users, sub: 'All time', color: { background: '#f3e8ff', color: '#7c3aed' } },
    { label: 'Avg Order', value: orders.length ? `${(totalRevenue / Math.max(delivered.length, 1)).toFixed(0)} MAD` : '—', icon: TrendingUp, sub: 'Per delivery', color: { background: '#ffedd5', color: '#ea580c' } },
  ];

  const tabs = [
    { key: 'stats', label: '📊 Stats' },
    { key: 'orders', label: '🛍️ Recent Orders' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800' }}>Dashboard</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted-fg)', marginTop: '2px' }}>Platform overview & stats</p>
        </div>
        <button onClick={loadData} style={{ background: 'var(--muted)', padding: '8px', borderRadius: '10px', color: 'var(--muted-fg)' }}>
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
            background: activeTab === t.key ? 'var(--primary)' : 'var(--muted)',
            color: activeTab === t.key ? '#fff' : 'var(--muted-fg)',
            transition: 'all 0.2s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: '120px', background: 'var(--muted)', borderRadius: 'var(--radius)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : activeTab === 'stats' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {stats.map((s, i) => <StatCard key={i} {...s} delay={i * 0.05} />)}
          </div>

          {/* Chart */}
          <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '20px', boxShadow: 'var(--shadow)' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>Revenue — last 7 days</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={last7} barSize={32}>
                <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v) => [`${v.toFixed(0)} MAD`, 'Revenue']} contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid var(--border)' }} />
                <Bar dataKey="revenue" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '700' }}>Recent Orders</h2>
          </div>
          {orders.slice(0, 15).map((o, i) => (
            <div key={o.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 20px', borderBottom: i < 14 ? '1px solid var(--border)' : 'none',
            }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '600' }}>{o.restaurant_name || `Order #${o.id}`}</p>
                <p style={{ fontSize: '11px', color: 'var(--muted-fg)', marginTop: '2px' }}>
                  {o.customer_username} · {new Date(o.created_at).toLocaleDateString('fr-MA')}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>{parseFloat(o.total_price).toFixed(0)} MAD</span>
                <StatusBadge status={o.status} />
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--muted-fg)', fontSize: '14px' }}>No orders yet</p>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    pending: { bg: '#fef9c3', color: '#ca8a04' },
    confirmed: { bg: '#dbeafe', color: '#2563eb' },
    preparing: { bg: '#f3e8ff', color: '#7c3aed' },
    picked_up: { bg: '#cffafe', color: '#0891b2' },
    delivered: { bg: '#dcfce7', color: '#16a34a' },
    cancelled: { bg: '#fee2e2', color: '#dc2626' },
  };
  const c = colors[status] || colors.pending;
  return (
    <span style={{
      fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
      background: c.bg, color: c.color,
    }}>
      {status}
    </span>
  );
}