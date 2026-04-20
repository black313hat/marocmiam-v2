import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRestaurants } from '../../services/api';
import { Search, Star, Clock, Heart, ArrowLeft, Bike } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { key: 'all', label: 'Tous', emoji: '🍴' },
  { key: 'Restaurant', label: 'Restos', emoji: '🍽️' },
  { key: 'Fast Food', label: 'Fast Food', emoji: '🍟' },
  { key: 'Café', label: 'Cafés', emoji: '☕' },
  { key: 'Barbecue', label: 'Grills', emoji: '🔥' },
  { key: 'Supermarket', label: 'Marché', emoji: '🛒' },
];

function getFavs() {
  try { return JSON.parse(localStorage.getItem('fav_restaurants') || '[]'); } catch { return []; }
}
function toggleFav(id) {
  const favs = getFavs();
  const updated = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
  localStorage.setItem('fav_restaurants', JSON.stringify(updated));
  window.dispatchEvent(new Event('favs-updated'));
}

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState(getFavs());
  const navigate = useNavigate();

  useEffect(() => {
    getRestaurants()
      .then(res => setRestaurants(res.data))
      .catch(() => toast.error('Could not load'))
      .finally(() => setLoading(false));
    const h = () => setFavorites(getFavs());
    window.addEventListener('favs-updated', h);
    return () => window.removeEventListener('favs-updated', h);
  }, []);

  let filtered = restaurants;
  if (category !== 'all') filtered = filtered.filter(r => r.category === category);
  if (search) filtered = filtered.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  const topRated = [...restaurants].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: '80px' }}>

      {/* Orange header */}
      <div style={{ background: '#FF6B00', padding: '16px 16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <button onClick={() => navigate('/')} style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <ArrowLeft size={18} color="#fff" />
          </button>
          <h1 style={{ color: '#fff', fontSize: '18px', fontWeight: '800' }}>Restaurants</h1>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: '#fff', borderRadius: '12px', padding: '11px 14px',
        }}>
          <Search size={16} color="#aaa" />
          <input
            placeholder="Rechercher un restaurant..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, fontSize: '14px', background: 'none', color: '#1a1a1a' }}
          />
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ background: '#fff', padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setCategory(cat.key)} style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '7px 14px', borderRadius: '20px', fontSize: '12px',
              fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0,
              cursor: 'pointer', transition: 'all 0.2s',
              background: category === cat.key ? '#FF6B00' : '#f5f5f5',
              color: category === cat.key ? '#fff' : '#666',
              border: 'none',
            }}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: '200px', background: '#fff', borderRadius: '16px' }} />
            ))}
          </div>
        ) : (
          <>
            {/* Top rated */}
            {!search && category === 'all' && topRated.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: '800' }}>⭐ Les mieux notés</h2>
                  <span style={{ fontSize: '12px', color: '#FF6B00', fontWeight: '600' }}>Voir tout</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', marginLeft: '-16px', paddingLeft: '16px', paddingRight: '16px', paddingBottom: '4px' }}>
                  {topRated.map(r => (
                    <div key={r.id} onClick={() => navigate(`/restaurant/${r.id}`)} style={{ flexShrink: 0, width: '140px', cursor: 'pointer' }}>
                      <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', height: '100px' }}>
                        <img
                          src={r.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=80'}
                          alt={r.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=80'; }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                        <div style={{
                          position: 'absolute', top: '6px', right: '6px',
                          background: '#FF6B00', borderRadius: '6px',
                          padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '2px',
                        }}>
                          <Star size={9} fill="#fff" color="#fff" />
                          <span style={{ color: '#fff', fontSize: '10px', fontWeight: '700' }}>{r.rating}</span>
                        </div>
                        <p style={{ position: 'absolute', bottom: '6px', left: '8px', right: '8px', color: '#fff', fontWeight: '700', fontSize: '11px' }}>
                          {r.name}
                        </p>
                      </div>
                      <p style={{ fontSize: '10px', color: '#999', marginTop: '5px' }}>{r.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All restaurants grid */}
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px' }}>
                {category === 'all' ? '🍴 Tous les restaurants' : CATEGORIES.find(c => c.key === category)?.label}
                <span style={{ fontSize: '12px', fontWeight: '400', color: '#999', marginLeft: '6px' }}>
                  ({filtered.length})
                </span>
              </h2>

              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '16px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍽️</div>
                  <p style={{ fontWeight: '700', color: '#1a1a1a' }}>Aucun restaurant trouvé</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {filtered.map((r, i) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => navigate(`/restaurant/${r.id}`)}
                      style={{
                        background: '#fff', borderRadius: '16px',
                        overflow: 'hidden', cursor: 'pointer',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                      }}
                    >
                      <div style={{ position: 'relative', paddingBottom: '60%', overflow: 'hidden' }}>
                        <img
                          src={r.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80'}
                          alt={r.name}
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80'; }}
                        />
                        <button
                          onClick={e => { e.stopPropagation(); toggleFav(r.id); }}
                          style={{
                            position: 'absolute', top: '8px', right: '8px',
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: '#fff', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          }}
                        >
                          <Heart size={13}
                            color={favorites.includes(r.id) ? '#FF6B00' : '#ccc'}
                            fill={favorites.includes(r.id) ? '#FF6B00' : 'none'}
                          />
                        </button>
                        {!r.is_open && (
                          <div style={{
                            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <span style={{ color: '#fff', fontWeight: '700', fontSize: '12px', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '8px' }}>
                              Fermé
                            </span>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '10px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '3px', color: '#1a1a1a' }}>
                          {r.name}
                        </h3>
                        <p style={{ fontSize: '11px', color: '#999', marginBottom: '6px' }}>{r.category}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}>
                            <Star size={11} fill="#FF6B00" color="#FF6B00" />
                            <span style={{ fontWeight: '700', color: '#FF6B00' }}>{r.rating}</span>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#999' }}>
                            <Clock size={11} /> 30-45 min
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}