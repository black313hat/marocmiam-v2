import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRestaurants } from '../../services/api';
import { Search, MapPin, Star, Clock, Heart, ArrowRight, Loader2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CITIES = ['Al Hoceima', 'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir'];

const CUISINE_FILTERS = ['Tous', 'Restaurant', 'Fast Food', 'Café', 'Barbecue', 'Supermarket'];

const SECTIONS = [
  {
    key: 'customer',
    emoji: '🍽️',
    bg: 'linear-gradient(135deg, #00A651, #FF6B35)',
    title: 'Commander',
    sub: 'Explorez des centaines de restaurants et recevez vos plats en moins de 45 min',
    cta: 'Commander maintenant',
    href: null,
    stats: ['500+ restaurants', '< 45 min', 'Cash & Carte'],
  },
  {
    key: 'restaurant',
    emoji: '🏪',
    bg: 'linear-gradient(135deg, #00A651, #00c96a)',
    title: 'Devenir partenaire restaurant',
    sub: 'Augmentez vos ventes et touchez des milliers de clients dans votre ville',
    cta: 'Rejoindre en tant que restaurant',
    href: '/profile',
    stats: ['0 frais fixes', '+40% ventes', 'Dashboard live'],
  },
  {
    key: 'courier',
    emoji: '🛵',
    bg: 'linear-gradient(135deg, #FFC107, #FF9800)',
    title: 'Devenir livreur',
    sub: "Gagnez de l'argent en livrant quand vous voulez, où vous voulez",
    cta: 'Rejoindre en tant que livreur',
    href: '/courier-dashboard',
    stats: ['Horaires libres', 'Paiement hebdo', 'Équipement offert'],
  },
];

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [cuisine, setCuisine] = useState('Tous');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [locating, setLocating] = useState(false);
  const [showRestaurants, setShowRestaurants] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [city, setCity] = useState('Al Hoceima');
  const [showCities, setShowCities] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getRestaurants()
      .then(res => { setRestaurants(res.data); setFiltered(res.data); })
      .catch(() => toast.error('Could not load restaurants'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = restaurants;
    if (cuisine !== 'Tous') result = result.filter(r => r.category.toLowerCase().includes(cuisine.toLowerCase()));
    if (search) result = result.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [cuisine, search, restaurants]);

  function handleLocate() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
          const data = await res.json();
          const parts = [data.address?.road, data.address?.city || data.address?.town].filter(Boolean);
          setAddress(parts.join(', ') || '');
        } catch {}
        setLocating(false);
      },
      () => setLocating(false)
    );
  }

  const toggleFav = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4f5', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ padding: '20px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '22px', fontWeight: '800', color: '#00A651' }}>🍴 MarocMiam</span>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowCities(!showCities)}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '20px', padding: '6px 12px',
              fontSize: '12px', fontWeight: '600', color: '#09090b',
              cursor: 'pointer',
            }}
          >
            <MapPin size={12} color="#00A651" />
            {city}
            <ChevronDown size={12} />
          </button>
          <AnimatePresence>
            {showCities && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{
                  position: 'absolute', top: '40px', right: 0,
                  background: '#fff', borderRadius: '14px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  zIndex: 100, overflow: 'hidden', minWidth: '160px',
                }}
              >
                {CITIES.map(c => (
                  <button key={c} onClick={() => { setCity(c); setShowCities(false); }} style={{
                    display: 'block', width: '100%', padding: '10px 14px',
                    textAlign: 'left', fontSize: '13px', cursor: 'pointer',
                    fontWeight: c === city ? '700' : '400',
                    color: c === city ? '#00A651' : '#09090b',
                    background: c === city ? 'rgba(0,166,81,0.08)' : '#fff',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    border: 'none',
                  }}>
                    📍 {c}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hero text */}
      <div style={{ padding: '8px 16px 20px' }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '28px', fontWeight: '800', lineHeight: 1.2, marginBottom: '8px' }}
        >
          Commandez ce que<br />vous aimez 🍴
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}
        >
          Livraison rapide partout au Maroc
        </motion.p>

        {/* Address input */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', gap: '8px' }}
        >
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
            background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '16px', padding: '0 16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <MapPin size={16} color="#00A651" style={{ flexShrink: 0 }} />
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Saisissez votre adresse..."
              style={{
                flex: 1, height: '48px', background: 'transparent',
                fontSize: '14px', color: '#09090b',
              }}
            />
            <button onClick={handleLocate} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
              {locating
                ? <Loader2 size={16} color="#00A651" style={{ animation: 'spin 1s linear infinite' }} />
                : <span style={{ fontSize: '16px' }}>📍</span>
              }
            </button>
          </div>
          <button
            onClick={() => setShowRestaurants(true)}
            style={{
              height: '48px', width: '48px', borderRadius: '16px',
              background: '#00A651', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,166,81,0.3)', cursor: 'pointer', border: 'none',
            }}
          >
            <ArrowRight size={20} color="#fff" />
          </button>
        </motion.div>
      </div>

      {/* 3 Sections — Glovo style */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {SECTIONS.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1 }}
          >
            <div
              onClick={() => s.key === 'customer' ? setShowRestaurants(true) : s.href && navigate(s.href)}
              style={{
                background: s.bg, borderRadius: '24px', padding: '20px',
                overflow: 'hidden', position: 'relative', cursor: 'pointer',
              }}
            >
              {/* Background emoji */}
              <div style={{
                position: 'absolute', right: '-8px', bottom: '-8px',
                fontSize: '80px', opacity: 0.2, userSelect: 'none',
              }}>
                {s.emoji}
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '32px' }}>{s.emoji}</span>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ArrowRight size={16} color="#fff" />
                  </div>
                </div>

                <h2 style={{ color: '#fff', fontWeight: '800', fontSize: '18px', lineHeight: 1.2, marginBottom: '6px' }}>
                  {s.title}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', lineHeight: 1.5, marginBottom: '14px' }}>
                  {s.sub}
                </p>

                {/* Stats pills */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {s.stats.map(stat => (
                    <span key={stat} style={{
                      background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
                      color: '#fff', fontSize: '10px', fontWeight: '600',
                      padding: '4px 10px', borderRadius: '20px',
                    }}>
                      {stat}
                    </span>
                  ))}
                </div>

                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: '#fff', borderRadius: '20px', padding: '8px 16px',
                }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#09090b' }}>{s.cta}</span>
                  <ArrowRight size={14} color="#09090b" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Restaurant list — shows when user clicks Commander */}
      <AnimatePresence>
        {showRestaurants && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ padding: '24px 16px 0' }}
          >
            {/* Search */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: '#fff', borderRadius: '12px', padding: '12px 16px',
              marginBottom: '12px', border: '1px solid rgba(0,0,0,0.08)',
            }}>
              <Search size={16} color="#999" />
              <input
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, fontSize: '14px', background: 'none' }}
              />
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '4px' }}>
              {CUISINE_FILTERS.map(c => (
                <button key={c} onClick={() => setCuisine(c)} style={{
                  padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
                  fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0,
                  cursor: 'pointer',
                  background: cuisine === c ? '#09090b' : '#fff',
                  color: cuisine === c ? '#fff' : '#64748b',
                  border: cuisine === c ? 'none' : '1px solid rgba(0,0,0,0.08)',
                }}>
                  {c}
                </button>
              ))}
            </div>

            <h2 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '12px' }}>
              Restaurants ({filtered.length})
            </h2>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ height: '180px', background: '#e2e8f0', borderRadius: '14px' }} />
                ))}
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
                      background: '#fff', borderRadius: '14px',
                      overflow: 'hidden', cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      border: '1px solid rgba(0,0,0,0.08)',
                    }}
                  >
                    <div style={{ position: 'relative', height: '110px', overflow: 'hidden' }}>
                      <img
                        src={r.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80'}
                        alt={r.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80'; }}
                      />
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)',
                      }} />
                      <button
                        onClick={e => { e.stopPropagation(); toggleFav(r.id); }}
                        style={{
                          position: 'absolute', top: '8px', right: '8px',
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: 'rgba(0,0,0,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: 'none', cursor: 'pointer',
                        }}
                      >
                        <Heart size={14} color={favorites.includes(r.id) ? '#ff4757' : '#fff'}
                          fill={favorites.includes(r.id) ? '#ff4757' : 'none'} />
                      </button>
                    </div>
                    <div style={{ padding: '10px' }}>
                      <h3 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '3px', lineHeight: 1.2 }}>
                        {r.name}
                      </h3>
                      <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>{r.category}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: '700', color: '#f59e0b' }}>
                          <Star size={11} fill="#f59e0b" color="#f59e0b" /> {r.rating}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#64748b' }}>
                          <Clock size={11} /> 25-35 min
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '32px 16px 16px' }}>
        <p style={{ fontSize: '11px', color: '#94a3b8' }}>© 2026 MarocMiam · Maroc · Made with ❤️</p>
      </div>

    </div>
  );
}