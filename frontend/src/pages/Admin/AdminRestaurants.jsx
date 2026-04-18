import { useState, useEffect } from 'react';
import { getRestaurants } from '../../services/api';
import API from '../../services/api';
import { Store, MapPin, Phone, Check, X, RefreshCw, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await getRestaurants();
      setRestaurants(res.data);
    } catch { toast.error('Failed to load restaurants'); }
    setLoading(false);
  }

  async function toggleOpen(id, current) {
    try {
      await API.patch(`/restaurants/${id}/`, { is_open: !current });
      setRestaurants(prev => prev.map(r => r.id === id ? { ...r, is_open: !current } : r));
      toast.success(current ? 'Restaurant closed' : 'Restaurant opened');
    } catch { toast.error('Failed to update'); }
  }

  const filtered = filter === 'all' ? restaurants
    : filter === 'open' ? restaurants.filter(r => r.is_open)
    : restaurants.filter(r => !r.is_open);

  const counts = {
    all: restaurants.length,
    open: restaurants.filter(r => r.is_open).length,
    closed: restaurants.filter(r => !r.is_open).length,
  };

  const filterTabs = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'open', label: `✅ Open (${counts.open})` },
    { key: 'closed', label: `❌ Closed (${counts.closed})` },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800' }}>Restaurants</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted-fg)', marginTop: '2px' }}>Manage all restaurants</p>
        </div>
        <button onClick={load} style={{ background: 'var(--muted)', padding: '8px', borderRadius: '10px', color: 'var(--muted-fg)' }}>
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {filterTabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{
            padding: '7px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
            border: filter === t.key ? 'none' : '1px solid var(--border)',
            background: filter === t.key ? 'var(--primary)' : 'var(--card)',
            color: filter === t.key ? '#fff' : 'var(--muted-fg)',
            transition: 'all 0.2s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: '96px', background: 'var(--muted)', borderRadius: 'var(--radius)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted-fg)', fontSize: '14px' }}>
          No restaurants found
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                background: 'var(--card)', borderRadius: 'var(--radius)',
                border: '1px solid var(--border)', padding: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'var(--primary-light)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '22px', flexShrink: 0,
                }}>
                  🏪
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '700' }}>{r.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '3px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--muted-fg)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={10} /> {r.city}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--muted-fg)' }}>·</span>
                    <span style={{ fontSize: '11px', color: 'var(--muted-fg)' }}>{r.category}</span>
                    <span style={{ fontSize: '11px', color: 'var(--muted-fg)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Star size={10} fill="#f59e0b" color="#f59e0b" /> {r.rating}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
                  background: r.is_open ? '#dcfce7' : '#fee2e2',
                  color: r.is_open ? '#16a34a' : '#dc2626',
                }}>
                  {r.is_open ? 'Open' : 'Closed'}
                </span>
                <button
                  onClick={() => toggleOpen(r.id, r.is_open)}
                  style={{
                    padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                    background: r.is_open ? '#fee2e2' : '#dcfce7',
                    color: r.is_open ? '#dc2626' : '#16a34a',
                  }}
                >
                  {r.is_open ? 'Close' : 'Open'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}