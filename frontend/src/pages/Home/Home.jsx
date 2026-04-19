import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRestaurants } from '../../services/api';
import { Search, MapPin, Star, Clock, ChevronDown, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CITIES = ['Al Hoceima', 'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir'];

const TOP_CATEGORIES = [
  { key: 'all', label: 'Restaurants', emoji: '🍽️', color: '#FF6B35' },
  { key: 'Supermarket', label: 'Supermarché', emoji: '🛒', color: '#00A651' },
  { key: 'Café', label: 'Cafés', emoji: '☕', color: '#8B4513' },
  { key: 'Fast Food', label: 'Fast Food', emoji: '🍟', color: '#FFC107' },
  { key: 'Barbecue', label: 'Grills', emoji: '🔥', color: '#E53935' },
];

const CUISINE_FILTERS = ['Tous', 'Moroccan', 'Fast Food', 'Café', 'Barbecue', 'Restaurant', 'Supermarket'];

const BRANDS = [
  { name: "McDonald's", emoji: '🍔' },
  { name: 'KFC', emoji: '🍗' },
  { name: 'Pizza Hut', emoji: '🍕' },
  { name: 'Marjane', emoji: '🛒' },
  { name: 'Starbucks', emoji: '☕' },
  { name: 'Burger King', emoji: '🍔' },
];

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('all');
  const [cuisine, setCuisine] = useState('Tous');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('Al Hoceima');
  const [showCities, setShowCities] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getRestaurants()
      .then(res => { setRestaurants(res.data); setFiltered(res.data); })
      .catch(() => toast.error('Could not load restaurants'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = restaurants;
    if (category !== 'all') result = result.filter(r => r.category === category);
    if (cuisine !== 'Tous') result = result.filter(r => r.category.toLowerCase().includes(cuisine.toLowerCase()));
    if (search) result = result.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [category, cuisine, search, restaurants]);

  const toggleFav = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #00A651 0%, #007a3d 100%)',
        padding: '20px 16px 28px',
      }}>
        {/* City selector */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <button
            onClick={() => setShowCities(!showCities)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '20px', padding: '6px 14px',
              color: '#fff', fontSize: '13px', fontWeight: '600',
            }}
          >
            <MapPin size={14} />
            {city}
            <ChevronDown size={14} />
          </button>

          <AnimatePresence>
            {showCities && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  position: 'absolute', top: '40px', left: 0,
                  background: '#fff', borderRadius: '14px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  zIndex: 100, overflow: 'hidden', minWidth: '180px',
                }}
              >
                {CITIES.map(c => (
                  <button key={c} onClick={() => { setCity(c); setShowCities(false); }} style={{
                    display: 'block', width: '100%', padding: '12px 16px',
                    textAlign: 'left', fontSize: '14px',
                    fontWeight: c === city ? '700' : '400',
                    color: c === city ? '#00A651' : '#09090b',
                    background: c === city ? 'rgba(0,166,81,0.1)' : '#fff',
                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                  }}>
                    📍 {c}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <h1 style={{ color: '#fff', fontSize: '26px', fontWeight: '800', marginBottom: '6px', lineHeight: 1.2 }}>
          On vous livre plus<br />que des repas 🍴
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', marginBottom: '16px' }}>
          Restaurants, supermarchés, pharmacies et plus
        </p>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: '#fff', borderRadius: '12px', padding: '12px 16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}>
          <Search size={18} color="#999" />
          <input
            placeholder="Rechercher restaurants, plats..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, fontSize: '14px', color: '#1a1a1a', background: 'none' }}
          />
        </div>
      </div>

      {/* Top Categories */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          {TOP_CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '6px', flexShrink: 0, padding: '12px 16px',
                borderRadius: '14px', minWidth: '72px',
                background: category === cat.key ? cat.color : '#fff',
                border: category === cat.key ? 'none' : '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '24px' }}>{cat.emoji}</span>
              <span style={{
                fontSize: '11px', fontWeight: '600',
                color: category === cat.key ? '#fff' : '#09090b',
                whiteSpace: 'nowrap',
              }}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Brands */}
      <div style={{ padding: '20px 16px 0' }}>
        <h2 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '12px' }}>
          Marques populaires
        </h2>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          {BRANDS.map(brand => (
            <div key={brand.name} style={{
              flexShrink: 0, width: '72px', textAlign: 'center',
              background: '#fff', borderRadius: '14px', padding: '12px 8px',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              cursor: 'pointer',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>{brand.emoji}</div>
              <p style={{ fontSize: '10px', fontWeight: '600', color: '#09090b' }}>
                {brand.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Cuisine filter */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {CUISINE_FILTERS.map(c => (
            <button key={c} onClick={() => setCuisine(c)} style={{
              padding: '7px 16px', borderRadius: '20px', fontSize: '13px',
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
      </div>

      {/* Restaurant Grid */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '800' }}>
            {category === 'all' ? 'Tous les restaurants' : TOP_CATEGORIES.find(c => c.key === category)?.label}
            <span style={{ fontSize: '13px', fontWeight: '400', color: '#64748b', marginLeft: '6px' }}>
              ({filtered.length})
            </span>
          </h2>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: '180px', background: '#f1f5f9', borderRadius: '14px' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍽️</div>
            <p style={{ fontWeight: '600' }}>Aucun restaurant trouvé</p>
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
                      background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: 'none', cursor: 'pointer',
                    }}
                  >
                    <Heart
                      size={14}
                      color={favorites.includes(r.id) ? '#ff4757' : '#fff'}
                      fill={favorites.includes(r.id) ? '#ff4757' : 'none'}
                    />
                  </button>
                </div>

                <div style={{ padding: '10px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '3px', lineHeight: 1.2 }}>
                    {r.name}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                    {r.category}
                  </p>
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
      </div>

      {/* Opportunities section */}
      <div style={{ padding: '8px 16px 16px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '12px' }}>Opportunités</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #00A651, #007a3d)',
            borderRadius: '16px', padding: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ color: '#fff', fontWeight: '800', fontSize: '15px' }}>Devenir livreur</p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginTop: '2px' }}>
                Gagnez de l'argent en livrant
              </p>
            </div>
            <span style={{ fontSize: '40px' }}>🛵</span>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #FF6B35, #e55a2b)',
            borderRadius: '16px', padding: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ color: '#fff', fontWeight: '800', fontSize: '15px' }}>Devenir partenaire</p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginTop: '2px' }}>
                Boostez vos ventes avec nous
              </p>
            </div>
            <span style={{ fontSize: '40px' }}>🏪</span>
          </div>
        </div>
      </div>

    </div>
  );
}