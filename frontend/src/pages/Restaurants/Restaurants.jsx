import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getRestaurants } from '../../services/api';
import { MapPin, Heart, Search, ChevronDown, Star, Clock, Bike } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const TOP_CATEGORIES = [
  { key: 'all', label: 'Restaurants', emoji: '🍽️' },
  { key: 'Supermarket', label: 'Supermarché', emoji: '🛒' },
  { key: 'Café', label: 'Cafés', emoji: '☕' },
  { key: 'Fast Food', label: 'Fast Food', emoji: '🍟' },
  { key: 'Barbecue', label: 'Grills', emoji: '🔥' },
];

const CUISINE_CATS = [
  { label: 'Tous', emoji: '🍴' },
  { label: 'Moroccan', emoji: '🍲' },
  { label: 'Fast Food', emoji: '🍟' },
  { label: 'Barbecue', emoji: '🔥' },
  { label: 'Café', emoji: '☕' },
  { label: 'Supermarket', emoji: '🛒' },
  { label: 'Restaurant', emoji: '🍽️' },
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
  const [topCategory, setTopCategory] = useState('all');
  const [cuisine, setCuisine] = useState('Tous');
  const [search, setSearch] = useState('');
  const [openNow, setOpenNow] = useState(false);
  const [favorites, setFavorites] = useState(getFavs());
  const [locating, setLocating] = useState(false);
  const [city, setCity] = useState('Al Hoceima');
  const navigate = useNavigate();

  useEffect(() => {
    getRestaurants()
      .then(res => setRestaurants(res.data))
      .catch(() => toast.error('Could not load restaurants'))
      .finally(() => setLoading(false));
    const handler = () => setFavorites(getFavs());
    window.addEventListener('favs-updated', handler);
    return () => window.removeEventListener('favs-updated', handler);
  }, []);

  function locateMe() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
          const data = await res.json();
          setCity(data.address?.city || data.address?.town || 'Al Hoceima');
        } catch {}
        setLocating(false);
      },
      () => setLocating(false)
    );
  }

  let filtered = restaurants;
  if (topCategory !== 'all') filtered = filtered.filter(r => r.category === topCategory);
  if (cuisine !== 'Tous') filtered = filtered.filter(r => r.category.toLowerCase().includes(cuisine.toLowerCase()));
  if (search) filtered = filtered.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  const topRated = [...restaurants].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
  const favRestaurants = filtered.filter(r => favorites.includes(r.id));

  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ padding: '16px 16px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Bonjour 👋</p>
            <button
              onClick={locateMe}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              <MapPin size={16} color="#00A651" />
              <span style={{ fontWeight: '700', fontSize: '16px', color: '#09090b' }}>
                {locating ? 'Localisation...' : city}
              </span>
              <ChevronDown size={14} color="#64748b" />
            </button>
          </div>
          <button
            onClick={() => {/* search focus */}}
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: '#f1f5f9', display: 'flex', alignItems: 'center',
              justifyContent: 'center', border: 'none', cursor: 'pointer',
            }}
          >
            <Search size={18} color="#09090b" />
          </button>
        </div>

        {/* Search bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: '#f1f5f9', borderRadius: '14px', padding: '11px 16px',
          marginBottom: '4px',
        }}>
          <Search size={16} color="#94a3b8" />
          <input
            placeholder="Rechercher restaurants, plats..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, fontSize: '14px', background: 'none', color: '#09090b' }}
          />
        </div>
      </div>

      {/* Top category icons */}
      <div style={{ padding: '8px 16px 4px', display: 'flex', gap: '16px', overflowX: 'auto' }}>
        {TOP_CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setTopCategory(cat.key)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '6px', flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            <div style={{
              width: '64px', height: '64px', borderRadius: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', transition: 'all 0.2s',
              background: topCategory === cat.key ? 'rgba(0,166,81,0.1)' : '#fff',
              border: topCategory === cat.key ? '2px solid #00A651' : '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              {cat.emoji}
            </div>
            <span style={{
              fontSize: '10px', fontWeight: '500',
              color: topCategory === cat.key ? '#00A651' : '#64748b',
              whiteSpace: 'nowrap',
            }}>
              {cat.label}
            </span>
          </button>
        ))}
      </div>

      {/* Cuisine pills */}
      <div style={{ padding: '12px 16px 4px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {CUISINE_CATS.map(c => (
          <button key={c.label} onClick={() => setCuisine(c.label)} style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '8px 14px', borderRadius: '20px', fontSize: '12px',
            fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0,
            cursor: 'pointer', transition: 'all 0.2s',
            background: cuisine === c.label ? 'rgba(0,166,81,0.1)' : '#fff',
            color: cuisine === c.label ? '#00A651' : '#64748b',
            border: cuisine === c.label ? '2px solid #00A651' : '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <span>{c.emoji}</span> {c.label}
          </button>
        ))}
      </div>

      {/* Open now filter */}
      <div style={{ padding: '10px 16px', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setOpenNow(p => !p)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', borderRadius: '20px', fontSize: '12px',
            fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
            background: openNow ? '#00A651' : '#fff',
            color: openNow ? '#fff' : '#64748b',
            border: openNow ? 'none' : '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: openNow ? '#fff' : '#22c55e', flexShrink: 0,
          }} />
          Ouvert maintenant
        </button>
      </div>

      <div style={{ padding: '0 16px' }}>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: '200px', background: '#e2e8f0', borderRadius: '16px' }} />
            ))}
          </div>
        ) : (
          <>
            {/* Top rated horizontal scroll */}
            {cuisine === 'Tous' && topCategory === 'all' && topRated.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '12px' }}>
                  ⭐ Les mieux notés
                </h2>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', marginLeft: '-16px', paddingLeft: '16px', paddingRight: '16px', paddingBottom: '8px' }}>
                  {topRated.map(r => (
                    <div
                      key={r.id}
                      onClick={() => navigate(`/restaurant/${r.id}`)}
                      style={{ flexShrink: 0, width: '160px', cursor: 'pointer' }}
                    >
                      <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
                        <img
                          src={r.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=80'}
                          alt={r.name}
                          style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=80'; }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)' }} />
                        <button
                          onClick={e => { e.stopPropagation(); toggleFav(r.id); }}
                          style={{
                            position: 'absolute', top: '6px', right: '6px',
                            width: '26px', height: '26px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: 'none', cursor: 'pointer',
                          }}
                        >
                          <Heart size={12} color={favorites.includes(r.id) ? '#ff4757' : '#fff'}
                            fill={favorites.includes(r.id) ? '#ff4757' : 'none'} />
                        </button>
                        <div style={{ position: 'absolute', bottom: '6px', left: '8px', right: '8px' }}>
                          <p style={{ color: '#fff', fontWeight: '600', fontSize: '11px', marginBottom: '1px' }}>{r.name}</p>
                          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '10px' }}>25-35 min · Gratuit</p>
                        </div>
                      </div>
                      <p style={{ fontSize: '10px', color: '#64748b', marginTop: '5px', paddingLeft: '2px' }}>{r.category}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Favorites */}
            {favRestaurants.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '12px' }}>
                  ❤️ Mes favoris
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {favRestaurants.map(r => (
                    <RestaurantRow key={r.id} r={r} favorites={favorites} navigate={navigate} />
                  ))}
                </div>
              </div>
            )}

            {/* All restaurants grid */}
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '12px' }}>
                🍴 {cuisine === 'Tous' ? 'Tous les restaurants' : cuisine}
                <span style={{ fontSize: '13px', fontWeight: '400', color: '#64748b', marginLeft: '6px' }}>
                  ({filtered.length})
                </span>
              </h2>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏪</div>
                  <p style={{ fontWeight: '600' }}>Aucun restaurant trouvé</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingBottom: '16px' }}>
                  {filtered.map((r, i) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => navigate(`/restaurant/${r.id}`)}
                      style={{
                        background: '#fff', borderRadius: '16px',
                        overflow: 'hidden', cursor: 'pointer',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                        border: '1px solid rgba(0,0,0,0.06)',
                      }}
                    >
                      {/* Full bleed image */}
                      <div style={{ position: 'relative', paddingBottom: '62%', overflow: 'hidden' }}>
                        <img
                          src={r.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80'}
                          alt={r.name}
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80'; }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.05) 60%)' }} />
                        <button
                          onClick={e => { e.stopPropagation(); toggleFav(r.id); }}
                          style={{
                            position: 'absolute', top: '8px', right: '8px',
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: 'none', cursor: 'pointer',
                          }}
                        >
                          <Heart size={13} color={favorites.includes(r.id) ? '#ff4757' : '#fff'}
                            fill={favorites.includes(r.id) ? '#ff4757' : 'none'} />
                        </button>
                        {/* Name overlaid on image — Wolt style */}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px' }}>
                          <h3 style={{ color: '#fff', fontWeight: '700', fontSize: '13px', lineHeight: 1.2 }}>
                            {r.name}
                          </h3>
                          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '10px', marginTop: '1px' }}>
                            {r.category}
                          </p>
                        </div>
                      </div>
                      {/* Info row */}
                      <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#64748b' }}>
                            <Bike size={11} /> Gratuit
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#64748b' }}>
                            <Clock size={11} /> 30-45 min
                          </span>
                        </div>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', fontWeight: '700', color: '#09090b' }}>
                          <Star size={11} fill="#f59e0b" color="#f59e0b" /> {r.rating}
                        </span>
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

function RestaurantRow({ r, favorites, navigate }) {
  return (
    <div
      onClick={() => navigate(`/restaurant/${r.id}`)}
      style={{
        display: 'flex', gap: '12px', background: '#fff',
        borderRadius: '14px', overflow: 'hidden', cursor: 'pointer',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        border: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <img
        src={r.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80'}
        alt={r.name}
        style={{ width: '90px', height: '80px', objectFit: 'cover', flexShrink: 0 }}
        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80'; }}
      />
      <div style={{ padding: '10px 10px 10px 0', flex: 1 }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '3px' }}>{r.name}</h3>
        <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>{r.category}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Clock size={11} /> 30-45 min
          </span>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#09090b', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <Star size={11} fill="#f59e0b" color="#f59e0b" /> {r.rating}
          </span>
        </div>
      </div>
    </div>
  );
}