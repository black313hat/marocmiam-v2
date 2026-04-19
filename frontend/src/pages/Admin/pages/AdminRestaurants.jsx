import { useState, useEffect } from 'react';
import API from '../../../services/api';
import { RefreshCw, Store, MapPin, Star, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await API.get('/restaurants/?all=true');
      setRestaurants(res.data);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  }

  async function toggleOpen(id, current) {
    try {
      const token = localStorage.getItem('admin_token');
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await API.patch(`/restaurants/${id}/`, { is_open: !current });
      setRestaurants(prev => prev.map(r => r.id === id ? { ...r, is_open: !current } : r));
      toast.success(current ? 'Restaurant closed' : 'Restaurant opened');
    } catch { toast.error('Failed'); }
  }

  const filtered = restaurants
    .filter(r => filter === 'all' ? true : filter === 'open' ? r.is_open : !r.is_open)
    .filter(r => search ? r.name.toLowerCase().includes(search.toLowerCase()) : true);

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          placeholder="Search restaurants..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: '200px', padding: '10px 14px', borderRadius: '10px',
            border: '1px solid #e2e8f0', fontSize: '13px', background: '#fff',
          }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'open', 'closed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '600',
              cursor: 'pointer', border: 'none',
              background: filter === f ? '#00A651' : '#fff',
              color: filter === f ? '#fff' : '#64748b',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}>
              {f === 'all' ? `All (${restaurants.length})` : f === 'open' ? `✅ Open (${restaurants.filter(r => r.is_open).length})` : `❌ Closed (${restaurants.filter(r => !r.is_open).length})`}
            </button>
          ))}
        </div>
        <button onClick={load} style={{
          padding: '8px 14px', borderRadius: '10px', border: '1px solid #e2e8f0',
          background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', color: '#64748b',
        }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Restaurant', 'Category', 'City', 'Rating', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={6} style={{ padding: '12px 16px' }}>
                  <div style={{ height: '20px', background: '#f1f5f9', borderRadius: '6px' }} />
                </td></tr>
              ))
            ) : filtered.map((r, i) => (
              <motion.tr
                key={r.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                style={{ borderTop: '1px solid #f1f5f9' }}
              >
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      overflow: 'hidden', flexShrink: 0,
                      background: '#f1f5f9',
                    }}>
                      <img
                        src={r.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=80&q=80'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=80&q=80'; }}
                      />
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '700' }}>{r.name}</p>
                      <p style={{ fontSize: '11px', color: '#94a3b8' }}>{r.phone}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>{r.category}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {r.city}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '13px', fontWeight: '700', color: '#f59e0b' }}>
                    <Star size={13} fill="#f59e0b" color="#f59e0b" /> {r.rating}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
                    background: r.is_open ? '#dcfce7' : '#fee2e2',
                    color: r.is_open ? '#16a34a' : '#dc2626',
                  }}>
                    {r.is_open ? 'Open' : 'Closed'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button
                    onClick={() => toggleOpen(r.id, r.is_open)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '6px 12px', borderRadius: '8px', border: 'none',
                      cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                      background: r.is_open ? '#fee2e2' : '#dcfce7',
                      color: r.is_open ? '#dc2626' : '#16a34a',
                    }}
                  >
                    {r.is_open ? <><X size={12} /> Close</> : <><Check size={12} /> Open</>}
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No restaurants found</p>
        )}
      </div>
    </div>
  );
}