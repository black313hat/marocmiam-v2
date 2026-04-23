import { useState, useEffect } from 'react';
import API from '../../../services/api';
import {
  TrendingUp, ShoppingBag, Store, Users,
  DollarSign, RefreshCw, Clock, CheckCircle,
  XCircle, Bike,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, LineChart, Line, Area, AreaChart,
} from 'recharts';
import { motion } from 'framer-motion';

const STATUS_COLORS = {
  pending:   { bg: '#fef9c3', color: '#ca8a04' },
  confirmed: { bg: '#dbeafe', color: '#2563eb' },
  preparing: { bg: '#f3e8ff', color: '#7c3aed' },
  picked_up: { bg: '#cffafe', color: '#0891b2' },
  delivered: { bg: '#dcfce7', color: '#16a34a' },
  cancelled: { bg: '#fee2e2', color: '#dc2626' },
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{
      fontSize: '11px', fontWeight: '600', padding: '3px 10px',
      borderRadius: '20px', background: c.bg, color: c.color,
    }}>
      {status}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, bg, delay = 0, trend }) {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={color} />
        </div>
        {trend !== undefined && (
          <span style={{
            fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px',
            background: trend >= 0 ? '#dcfce7' : '#fee2e2',
            color: trend >= 0 ? '#16a34a' : '#dc2626',
          }}>
            {trend >= 0 ? '↑' : '↓'} Today: {trend}
          </span>
        )}
      </div>
      <p style={{ fontSize: '26px', fontWeight: '900', lineHeight: 1, marginBottom: '4px', letterSpacing: '-0.02em' }}>{value}</p>
      <p style={{ fontSize: '13px', fontWeight: '600', color: '#09090b' }}>{label}</p>
      {sub && <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{sub}</p>}
    </motion.div>
  );
}

function Skeleton({ h = 130 }) {
  return <div style={{ height: `${h}px`, background: 'linear-gradient(90deg, #f1f5f9 25%, #e8edf3 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', borderRadius: '16px', animation: 'shimmer 1.5s infinite' }} />;
}

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Try new stats endpoint first, fall back to manual calculation
      try {
        const [statsRes, ordersRes] = await Promise.all([
          API.get('/admin/stats/'),
          API.get('/orders/all/'),
        ]);
        setStats(statsRes.data);
        setOrders(ordersRes.data);
      } catch {
        // Fallback: calculate from orders + restaurants
        const [ordersRes, restRes] = await Promise.all([
          API.get('/orders/all/'),
          API.get('/restaurants/'),
        ]);
        const o = ordersRes.data;
        const delivered = o.filter(x => x.status === 'delivered');
        const revenue   = delivered.reduce((s, x) => s + parseFloat(x.total_price || 0), 0);
        const today     = new Date().toDateString();

        const chart = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(); d.setDate(d.getDate() - (6 - i));
          const rev = delivered
            .filter(x => new Date(x.created_at).toDateString() === d.toDateString())
            .reduce((s, x) => s + parseFloat(x.total_price || 0), 0);
          return {
            label: d.toLocaleDateString('fr-MA', { weekday: 'short' }),
            revenue: Math.round(rev),
            orders: o.filter(x => new Date(x.created_at).toDateString() === d.toDateString()).length,
          };
        });

        setStats({
          revenue:           revenue,
          today_revenue:     delivered.filter(x => new Date(x.created_at).toDateString() === today).reduce((s, x) => s + parseFloat(x.total_price), 0),
          commission:        revenue * 0.15,
          total_orders:      o.length,
          today_orders:      o.filter(x => new Date(x.created_at).toDateString() === today).length,
          active_orders:     o.filter(x => !['delivered', 'cancelled'].includes(x.status)).length,
          delivered_orders:  delivered.length,
          cancelled_orders:  o.filter(x => x.status === 'cancelled').length,
          total_restaurants: restRes.data.length,
          avg_basket:        delivered.length ? revenue / delivered.length : 0,
          chart,
          top_restaurants:   [],
        });
        setOrders(o);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  return (
    <div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#09090b' }}>Dashboard</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
            {new Date().toLocaleDateString('fr-MA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button onClick={load} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
          padding: '8px 14px', fontSize: '13px', fontWeight: '600',
          cursor: 'pointer', color: '#64748b',
        }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
            {[...Array(6)].map((_, i) => <Skeleton key={i} />)}
          </div>
          <Skeleton h={240} />
        </>
      ) : stats && (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <StatCard icon={DollarSign}   label="Revenu total"       value={`${stats.revenue.toFixed(0)} MAD`}        sub={`${stats.delivered_orders} livrées`}       color="#16a34a" bg="#dcfce7"              delay={0}    trend={stats.today_orders} />
            <StatCard icon={TrendingUp}   label="Commission (15%)"   value={`${stats.commission.toFixed(0)} MAD`}      sub="Vos gains"                                  color="#00A651" bg="rgba(0,166,81,0.1)"   delay={0.05} />
            <StatCard icon={ShoppingBag}  label="Commandes actives"  value={stats.active_orders}                       sub="En ce moment"                               color="#2563eb" bg="#dbeafe"              delay={0.1} />
            <StatCard icon={Store}        label="Restaurants"        value={stats.total_restaurants}                   sub="Enregistrés"                                color="#ca8a04" bg="#fef9c3"              delay={0.15} />
            <StatCard icon={ShoppingBag}  label="Total commandes"    value={stats.total_orders}                        sub="Depuis le début"                            color="#7c3aed" bg="#f3e8ff"              delay={0.2} />
            <StatCard icon={TrendingUp}   label="Panier moyen"       value={stats.avg_basket ? `${stats.avg_basket.toFixed(0)} MAD` : '—'}  sub="Par commande"         color="#ea580c" bg="#ffedd5"              delay={0.25} />
          </div>

          {/* Today summary strip */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px',
            marginBottom: '20px',
          }}>
            {[
              { label: "Aujourd'hui",    value: stats.today_orders,    icon: '📅', color: '#2563eb' },
              { label: 'Livrées',        value: stats.delivered_orders, icon: '✅', color: '#16a34a' },
              { label: 'Annulées',       value: stats.cancelled_orders, icon: '❌', color: '#dc2626' },
              { label: "Rev. aujourd'hui", value: `${stats.today_revenue?.toFixed(0) ?? 0} MAD`, icon: '💰', color: '#00A651' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                style={{
                  background: '#fff', borderRadius: '14px', padding: '14px 16px',
                  border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px',
                }}
              >
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: '18px', fontWeight: '800', color: item.color, lineHeight: 1 }}>{item.value}</p>
                  <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{item.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            {/* Revenue chart */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: '#09090b' }}>
                📈 Revenus — 7 derniers jours
              </h2>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={stats.chart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00A651" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#00A651" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={v => [`${v} MAD`, 'Revenu']}
                    contentStyle={{ borderRadius: '10px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#00A651" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ r: 4, fill: '#00A651' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Orders chart */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: '#09090b' }}>
                🛒 Commandes — 7 derniers jours
              </h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={stats.chart} barSize={28} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={v => [v, 'Commandes']}
                    contentStyle={{ borderRadius: '10px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status breakdown */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px' }}>📊 Répartition des statuts</h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {Object.entries(STATUS_COLORS).map(([status, c]) => {
                const count = orders.filter(o => o.status === status).length;
                const pct = orders.length ? Math.round((count / orders.length) * 100) : 0;
                return (
                  <div key={status} style={{
                    flex: '1 1 120px', padding: '12px 14px', borderRadius: '12px',
                    background: c.bg, border: `1px solid ${c.color}30`,
                  }}>
                    <p style={{ fontSize: '20px', fontWeight: '900', color: c.color, lineHeight: 1 }}>{count}</p>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: c.color, marginTop: '4px' }}>{status}</p>
                    <p style={{ fontSize: '10px', color: c.color, opacity: 0.7 }}>{pct}%</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent orders table */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '700' }}>🛍️ Commandes récentes</h2>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>10 dernières</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
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
                  {orders.slice(0, 10).map(o => (
                    <tr key={o.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '11px 16px', fontSize: '12px', fontWeight: '700', color: '#64748b' }}>#{o.id}</td>
                      <td style={{ padding: '11px 16px', fontSize: '13px', fontWeight: '600' }}>{o.customer_username}</td>
                      <td style={{ padding: '11px 16px', fontSize: '12px', color: '#64748b' }}>{o.restaurant_name}</td>
                      <td style={{ padding: '11px 16px', fontSize: '13px', fontWeight: '800', color: '#00A651' }}>{parseFloat(o.total_price).toFixed(0)} MAD</td>
                      <td style={{ padding: '11px 16px' }}><StatusBadge status={o.status} /></td>
                      <td style={{ padding: '11px 16px', fontSize: '12px', color: '#94a3b8' }}>
                        {new Date(o.created_at).toLocaleDateString('fr-MA')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '14px' }}>No orders yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
