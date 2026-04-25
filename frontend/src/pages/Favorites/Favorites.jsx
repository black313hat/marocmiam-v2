import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRestaurants } from '../../services/api';
import { Heart, Star, Clock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

function getFavs() {
  try { return JSON.parse(localStorage.getItem('fav_restaurants') || '[]'); } catch { return []; }
}
function toggleFav(id) {
  const favs = getFavs();
  const updated = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
  localStorage.setItem('fav_restaurants', JSON.stringify(updated));
  window.dispatchEvent(new Event('favs-updated'));
}

export default function Favorites() {
  const navigate = useNavigate();
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [favorites, setFavorites] = useState(getFavs());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRestaurants().then(res => setAllRestaurants(res.data)).finally(() => setLoading(false));
    const h = () => setFavorites(getFavs());
    window.addEventListener('favs-updated', h);
    return () => window.removeEventListener('favs-updated', h);
  }, []);

  const favRestaurants = allRestaurants.filter(r => favorites.includes(r.id));

  return (
    <div style={{ minHeight: '100vh', background: '#F7F7F8', paddingBottom: '80px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(145deg, #FF6B00, #FF9A3C)', padding: '20px 16px 28px', borderRadius: '0 0 28px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
              ❤️
            </div>
            <div>
              <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: '900', letterSpacing: '-0.02em' }}>Mes Favoris</h1>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', fontWeight: '500' }}>
                {favRestaurants.length} restaurant{favRestaurants.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3].map(i => <div key={i} style={{ height: '90px', background: '#fff', borderRadius: '16px' }} />)}
          </div>
        ) : favRestaurants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: '20px', border: '1.5px solid #F0F0F0' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>💔</div>
            <p style={{ fontSize: '18px', fontWeight: '800', color: '#111', marginBottom: '8px', letterSpacing: '-0.02em' }}>Aucun favori</p>
            <p style={{ fontSize: '13px', color: '#AAA', marginBottom: '24px', lineHeight: 1.5 }}>
              Appuyez sur ❤️ sur un restaurant pour l'ajouter à vos favoris
            </p>
            <button onClick={() => navigate('/restaurants')} style={{
              background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)', color: '#fff',
              padding: '13px 28px', borderRadius: '14px', fontWeight: '800',
              border: 'none', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit',
              boxShadow: '0 6px 20px rgba(255,107,0,0.35)',
            }}>
              Découvrir des restaurants
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {favRestaurants.map((r, i) => (
              <motion.div key={r.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/restaurant/${r.id}`)}
                style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', display: 'flex', gap: '12px', padding: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1.5px solid #F0F0F0' }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img src={r.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80'} alt={r.name}
                    style={{ width: '85px', height: '85px', objectFit: 'cover', borderRadius: '12px' }}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80'; }} />
                  {!r.is_open && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', fontSize: '9px', fontWeight: '700' }}>FERMÉ</span>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#111', letterSpacing: '-0.01em' }}>{r.name}</h3>
                    <button onClick={e => { e.stopPropagation(); toggleFav(r.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                      <Heart size={18} color="#FF6B00" fill="#FF6B00" />
                    </button>
                  </div>
                  <p style={{ fontSize: '12px', color: '#AAA', marginTop: '2px', marginBottom: '8px' }}>{r.category} · {r.city}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: '700', color: '#FF6B00' }}>
                      <Star size={11} fill='#FF6B00' color='#FF6B00' /> {r.rating}
                    </span>
                    <span style={{ fontSize: '12px', color: '#AAA', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={11} /> 25-35 min
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: r.is_open ? '#16a34a' : '#dc2626', background: r.is_open ? '#dcfce7' : '#fee2e2', padding: '2px 8px', borderRadius: '20px' }}>
                      {r.is_open ? 'Ouvert' : 'Fermé'}
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
