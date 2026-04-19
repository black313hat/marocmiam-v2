import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRestaurants } from '../../services/api';
import { Search, Star, Clock, Heart, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const CUISINE_FILTERS = ['Tous', 'Restaurant', 'Fast Food', 'Café', 'Barbecue', 'Supermarket'];

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [cuisine, setCuisine] = useState('Tous');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
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
    if (cuisine !== 'Tous') result = result.filter(r =>
      r.category.toLowerCase().includes(cuisine.toLowerCase())
    );
    if (search) result = result.filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [cuisine, search, restaurants]);

  const toggleFav = (id) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* Green header */}
      <div style={{
        padding: '16px', background: '#00A651', paddingBottom: '20px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px',
        }}>
          <button onClick={() => navigate('/')} style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
          }}>
            <ArrowLeft size={18} color="#fff" />
          </button>
          <h1 style={{ color: '#fff', fontSize: '18px', fontWeight: '800' }}>
            Restaurants
          </h1>
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: '#fff', borderRadius: '12px', padding: '12px 16px',
        }}>
          <Search size={16} color="#999" />
          <input
            placeholder="Rechercher un restaurant..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, fontSize: '14px', background: 'none' }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{
        padding: '12px 16px', background: '#fff',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <div style={{
          display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px',
        }}>
          {CUISINE_FILTERS.map(c => (
            <button key={c} onClick={() => setCuisine(c)} style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
              fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0,
              cursor: 'pointer',
              background: cuisine === c ? '#09090b' : '#f1f5f9',
              color: cuisine === c ? '#fff' : '#64748b',
              border: 'none',
            }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: '16px' }}>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
          {filtered.length} restaurants trouvés
        </p>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                height: '180px', background: '#e2e8f0', borderRadius: '14px',
              }} />
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
                {/* Image */}
                <div style={{ position: 'relative', height: '110px', overflow: 'hidden' }}>
                  <img
                    src={r.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80'}
                    alt={r.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => {
                      e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80';
                    }}
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
                    <Heart
                      size={14}
                      color={favorites.includes(r.id) ? '#ff4757' : '#fff'}
                      fill={favorites.includes(r.id) ? '#ff4757' : 'none'}
                    />
                  </button>
                </div>

                {/* Info */}
                <div style={{ padding: '10px' }}>
                  <h3 style={{
                    fontSize: '13px', fontWeight: '700',
                    marginBottom: '3px', lineHeight: 1.2,
                  }}>
                    {r.name}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                    {r.category}
                  </p>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: '3px',
                      fontSize: '11px', fontWeight: '700', color: '#f59e0b',
                    }}>
                      <Star size={11} fill="#f59e0b" color="#f59e0b" /> {r.rating}
                    </span>
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: '3px',
                      fontSize: '11px', color: '#64748b',
                    }}>
                      <Clock size={11} /> 25-35 min
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