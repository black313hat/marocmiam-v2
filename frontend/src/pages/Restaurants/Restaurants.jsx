import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getRestaurants } from '../../services/api';
import { Search, Star, Clock, Heart, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useLang } from '../../context/LanguageContext';

const CATEGORIES = [
  { key: 'all', label: 'All', emoji: '🍴' },
  { key: 'Restaurant', label: 'Restos', emoji: '🍽️' },
  { key: 'Fast Food', label: 'Fast Food', emoji: '🍔' },
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
  const [searchParams] = useSearchParams();
  const { t, isRTL } = useLang();

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setCategory(cat);
  }, []);

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

  return (
    <div style={{ background: '#f8f8f8', minHeight: '100vh', paddingBottom: '80px', direction: isRTL ? 'rtl' : 'ltr' }}>

      {/* Search bar */}
      <div style={{ padding: '16px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
            background: '#f5f5f5', borderRadius: '14px', padding: '12px 14px',
          }}>
            <Search size={18} color='#bbb' />
            <input
              placeholder={t('search_restaurant')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, fontSize: '14px', color: '#1a1a1a', background: 'none' }}
            />
          </div>
          <button style={{
            width: '46px', height: '46px', borderRadius: '14px',
            background: '#FF6B00', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}>
            <SlidersHorizontal size={20} color='#fff' />
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ background: '#fff', padding: '12px 16px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {CATEGORIES.map(cat => {
            const active = category === cat.key;
            return (
              <button key={cat.key} onClick={() => setCategory(cat.key)} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '25px', fontSize: '13px',
                fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0,
                cursor: 'pointer', transition: 'all 0.2s',
                background: active ? '#FF6B00' : '#f5f5f5',
                color: active ? '#fff' : '#666',
              }}>
                <span style={{ fontSize: '14px' }}>{cat.emoji}</span>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Section title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800' }}>
            {category === 'all' ? 'All Restaurants' : CATEGORIES.find(c => c.key === category)?.label}
            <span style={{ fontSize: '13px', fontWeight: '400', color: '#999', marginLeft: '6px' }}>({filtered.length})</span>
          </h2>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ height: '100px', background: '#fff', borderRadius: '16px' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '16px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍽️</div>
            <p style={{ fontWeight: '700' }}>{t('no_restaurant')}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                  display: 'flex', gap: '12px',
                  padding: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                {/* Image */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={r.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80'}
                    alt={r.name}
                    style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '12px' }}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80'; }}
                  />
                  {!r.is_open && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                      borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ color: '#fff', fontSize: '10px', fontWeight: '700' }}>{t('closed')}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1a1a1a' }}>{r.name}</h3>
                      <button
                        onClick={e => { e.stopPropagation(); toggleFav(r.id); }}
                        style={{ background: 'none', cursor: 'pointer', padding: '2px' }}
                      >
                        <Heart size={16}
                          color={favorites.includes(r.id) ? '#FF6B00' : '#ddd'}
                          fill={favorites.includes(r.id) ? '#FF6B00' : 'none'}
                        />
                      </button>
                    </div>
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{r.category}</p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: '700' }}>
                      <Star size={12} fill='#FF6B00' color='#FF6B00' />
                      <span style={{ color: '#1a1a1a' }}>{r.rating}</span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: '#999' }}>
                      <Clock size={12} /> 25-35 min
                    </span>
                    <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: '600' }}>
                      {t('free_delivery')}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}