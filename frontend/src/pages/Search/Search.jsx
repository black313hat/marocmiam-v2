import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRestaurants } from '../../services/api';
import { Search as SearchIcon, X, ArrowLeft, Star, Clock, Heart, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function getFavs() {
  try { return JSON.parse(localStorage.getItem('fav_restaurants') || '[]'); } catch { return []; }
}
function toggleFav(id) {
  const favs = getFavs();
  const updated = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
  localStorage.setItem('fav_restaurants', JSON.stringify(updated));
  window.dispatchEvent(new Event('favs-updated'));
}
function getRecentSearches() {
  return JSON.parse(localStorage.getItem('recent_searches') || '[]');
}
function saveSearch(q) {
  if (!q.trim()) return;
  const searches = getRecentSearches().filter(s => s !== q).slice(0, 4);
  localStorage.setItem('recent_searches', JSON.stringify([q, ...searches]));
}

const POPULAR = [
  { label: 'Pizza', emoji: '🍕' },
  { label: 'Burger', emoji: '🍔' },
  { label: 'Tacos', emoji: '🌮' },
  { label: 'Sushi', emoji: '🍣' },
  { label: 'Grills', emoji: '🔥' },
  { label: 'Café', emoji: '☕' },
  { label: 'Moroccan', emoji: '🍲' },
  { label: 'Desserts', emoji: '🍰' },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(getFavs());
  const [recentSearches, setRecentSearches] = useState(getRecentSearches());
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    getRestaurants().then(res => setAllRestaurants(res.data)).catch(() => {});
    const h = () => setFavorites(getFavs());
    window.addEventListener('favs-updated', h);
    return () => window.removeEventListener('favs-updated', h);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      let filtered = allRestaurants.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.city?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
      );
      if (sortBy === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      if (sortBy === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
      setResults(filtered);
      saveSearch(query.trim());
      setRecentSearches(getRecentSearches());
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, allRestaurants, sortBy]);

  return (
    <div style={{ minHeight: '100vh', background: '#F7F7F8', paddingBottom: '80px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Header */}
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #F0F0F0', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => navigate(-1)} style={{ background: '#F5F5F5', border: 'none', borderRadius: '50%', width: '38px', height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ArrowLeft size={18} color="#333" />
          </button>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: '#F5F5F5', borderRadius: '14px', padding: '11px 14px' }}>
            <SearchIcon size={18} color='#BBB' />
            <input
              ref={inputRef}
              placeholder="Rechercher un restaurant, plat..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ flex: 1, fontSize: '14px', color: '#111', background: 'none', border: 'none', outline: 'none', fontFamily: 'inherit' }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}>
                <X size={16} color="#BBB" />
              </button>
            )}
          </div>
          <button onClick={() => setShowFilters(!showFilters)} style={{ background: showFilters ? '#FF6B00' : '#F5F5F5', border: 'none', borderRadius: '12px', width: '42px', height: '42px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <SlidersHorizontal size={18} color={showFilters ? '#fff' : '#666'} />
          </button>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
              <div style={{ paddingTop: '12px', display: 'flex', gap: '8px' }}>
                {[{ key: 'rating', label: '⭐ Note' }, { key: 'name', label: '🔤 Nom' }].map(s => (
                  <button key={s.key} onClick={() => setSortBy(s.key)} style={{
                    padding: '7px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                    border: 'none', cursor: 'pointer',
                    background: sortBy === s.key ? '#FF6B00' : '#F5F5F5',
                    color: sortBy === s.key ? '#fff' : '#666',
                    fontFamily: 'inherit',
                  }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Empty state — show suggestions */}
        {!query && (
          <>
            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '800', color: '#111' }}>Recherches récentes</p>
                  <button onClick={() => { localStorage.removeItem('recent_searches'); setRecentSearches([]); }} style={{ fontSize: '12px', color: '#FF6B00', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Effacer
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {recentSearches.map(s => (
                    <button key={s} onClick={() => setQuery(s)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#fff', borderRadius: '12px', border: '1.5px solid #F0F0F0', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                      <Clock size={14} color="#BBB" />
                      <span style={{ fontSize: '13px', color: '#444', fontWeight: '500' }}>{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular categories */}
            <div>
              <p style={{ fontSize: '14px', fontWeight: '800', color: '#111', marginBottom: '12px' }}>Populaires</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {POPULAR.map(p => (
                  <button key={p.label} onClick={() => setQuery(p.label)} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '20px', fontSize: '13px',
                    fontWeight: '600', cursor: 'pointer', border: 'none',
                    background: '#fff', border: '1.5px solid #F0F0F0',
                    fontFamily: 'inherit', color: '#444',
                  }}>
                    {p.emoji} {p.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Results */}
        {query && (
          <>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[1, 2, 3].map(i => <div key={i} style={{ height: '90px', background: '#fff', borderRadius: '16px' }} />)}
              </div>
            ) : results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                <div style={{ fontSize: '52px', marginBottom: '16px' }}>🔍</div>
                <p style={{ fontSize: '17px', fontWeight: '800', color: '#111', marginBottom: '8px' }}>Aucun résultat</p>
                <p style={{ fontSize: '13px', color: '#AAA' }}>Essayez avec un autre mot-clé</p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '13px', color: '#AAA', fontWeight: '600', marginBottom: '12px' }}>
                  {results.length} résultat{results.length > 1 ? 's' : ''} pour "{query}"
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {results.map((r, i) => (
                    <motion.div key={r.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      onClick={() => navigate(`/restaurant/${r.id}`)}
                      style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', display: 'flex', gap: '12px', padding: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1.5px solid #F0F0F0' }}
                    >
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img src={r.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80'} alt={r.name}
                          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px' }}
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80'; }} />
                        {!r.is_open && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#fff', fontSize: '9px', fontWeight: '700' }}>FERMÉ</span>
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#111' }}>{r.name}</h3>
                          <button onClick={e => { e.stopPropagation(); toggleFav(r.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            <Heart size={16} color={favorites.includes(r.id) ? '#FF6B00' : '#DDD'} fill={favorites.includes(r.id) ? '#FF6B00' : 'none'} />
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
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
