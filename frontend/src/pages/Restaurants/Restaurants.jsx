import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRestaurants } from '../../services/api';
import { Search, Star, Clock, Heart, ArrowLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useLang } from '../../context/LanguageContext';

function getFavs() {
  try { return JSON.parse(localStorage.getItem('fav_restaurants') || '[]'); } catch { return []; }
}
function toggleFav(id) {
  const favs = getFavs();
  const updated = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
  localStorage.setItem('fav_restaurants', JSON.stringify(updated));
  window.dispatchEvent(new Event('favs-updated'));
}

const CATEGORY_COLORS = {
  all: { bg: '#FFF3E8', color: '#FF6B00', emoji: '🍴' },
  Restaurant: { bg: '#FFF3E8', color: '#FF6B00', emoji: '🍽️' },
  'Fast Food': { bg: '#FFF9E6', color: '#F59E0B', emoji: '🍟' },
  Café: { bg: '#F0FDF4', color: '#16A34A', emoji: '☕' },
  Barbecue: { bg: '#FEF2F2', color: '#EF4444', emoji: '🔥' },
  Supermarket: { bg: '#EFF6FF', color: '#3B82F6', emoji: '🛒' },
};

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState(getFavs());
  const navigate = useNavigate();
  const { t, isRTL } = useLang();

  const CATEGORIES = [
    { key: 'all', label: t('all') },
    { key: 'Restaurant', label: t('restos') },
    { key: 'Fast Food', label: t('fast_food') },
    { key: 'Café', label: t('cafes') },
    { key: 'Barbecue', label: t('grills') },
    { key: 'Supermarket', label: t('market') },
  ];

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
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: '80px', direction: isRTL ? 'rtl' : 'ltr' }}>

      {/* Header */}
      <div style={{ background: '#FF6B00', padding: '16px 16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <button onClick={() => navigate('/')} style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <ArrowLeft size={18} color="#fff" />
          </button>
          <h1 style={{ color: '#fff', fontSize: '18px', fontWeight: '800' }}>{t('restaurants')}</h1>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: '#fff', borderRadius: '12px', padding: '11px 14px',
        }}>
          <Search size={16} color="#aaa" />
          <input
            placeholder={t('search_restaurant')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, fontSize: '14px', background: 'none', color: '#1a1a1a' }}
          />
        </div>
      </div>

      {/* Promo banner */}
      {!search && (
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{
            background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
            borderRadius: '16px', padding: '16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                background: '#fff', color: '#FF6B00', fontSize: '10px', fontWeight: '800',
                padding: '3px 10px', borderRadius: '20px', display: 'inline-block', marginBottom: '6px',
              }}>
                OFFRE DU JOUR
              </div>
              <p style={{ color: '#fff', fontSize: '20px', fontWeight: '900', lineHeight: 1.1 }}>
                Livraison<br />GRATUITE 🎉
              </p>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '11px', marginTop: '4px' }}>
                Sur votre première commande
              </p>
            </div>
            <div style={{ fontSize: '64px', opacity: 0.9, position: 'relative', zIndex: 1 }}>🛵</div>
          </div>
        </div>
      )}

      {/* Category icons */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          {CATEGORIES.map(cat => {
            const c = CATEGORY_COLORS[cat.key] || CATEGORY_COLORS.all;
            const active = category === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '6px', flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
                }}
              >
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: active ? c.color : c.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '26px', transition: 'all 0.2s',
                  boxShadow: active ? `0 4px 12px ${c.color}40` : 'none',
                  border: active ? 'none' : `1.5px solid ${c.bg}`,
                }}>
                  {c.emoji}
                </div>
                <span style={{
                  fontSize: '10px', fontWeight: '600',
                  color: active ? c.color : '#999',
                  whiteSpace: 'nowrap',
                }}>
                  {cat.label}
                </span>
              </button>
            );
          })}
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
            {/* Top rated horizontal */}
            {!search && category === 'all' && topRated.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: '800' }}>⭐ {t('top_rated')}</h2>
                  <span style={{ fontSize: '12px', color: '#FF6B00', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {t('see_all')} <ChevronRight size={14} />
                  </span>
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

            {/* Grid */}
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px' }}>
                🍴 {t('all_restaurants')}
                <span style={{ fontSize: '12px', fontWeight: '400', color: '#999', marginLeft: '6px' }}>({filtered.length})</span>
              </h2>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '16px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍽️</div>
                  <p style={{ fontWeight: '700' }}>{t('no_restaurant')}</p>
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
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#fff', fontWeight: '700', fontSize: '12px', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '8px' }}>
                              {t('closed')}
                            </span>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '10px' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '3px', color: '#1a1a1a' }}>{r.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                          {(() => {
                            const c = CATEGORY_COLORS[r.category] || CATEGORY_COLORS.all;
                            return (
                              <span style={{ fontSize: '10px', fontWeight: '600', color: c.color, background: c.bg, padding: '2px 7px', borderRadius: '6px' }}>
                                {r.category}
                              </span>
                            );
                          })()}
                        </div>
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