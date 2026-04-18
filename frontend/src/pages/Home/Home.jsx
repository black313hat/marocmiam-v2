import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRestaurants } from '../../services/api';
import { Search, Star, Clock, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Moroccan', 'Burgers', 'Pizza', 'Sushi', 'Sandwiches', 'Desserts', 'Healthy'];

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getRestaurants()
      .then(res => { setRestaurants(res.data); setFiltered(res.data); })
      .catch(() => toast.error('Could not load restaurants'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = restaurants;
    if (category !== 'All') result = result.filter(r => r.category.toLowerCase().includes(category.toLowerCase()));
    if (search) result = result.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [category, search, restaurants]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%)',
        borderRadius: '20px', padding: '48px 32px', marginBottom: '32px', color: '#fff',
      }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>
          Order food you love 🍴
        </h1>
        <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '24px' }}>
          Delivered fast to your door across Morocco
        </p>
        <div style={{ display: 'flex', gap: '12px', maxWidth: '500px' }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
            background: '#fff', borderRadius: '10px', padding: '12px 16px',
          }}>
            <Search size={18} color="#999" />
            <input placeholder="Search restaurants..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, fontSize: '15px', color: '#1a1a1a' }} />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '28px', paddingBottom: '4px' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            padding: '8px 20px', borderRadius: '20px', whiteSpace: 'nowrap',
            background: category === cat ? 'var(--teal)' : '#fff',
            color: category === cat ? '#fff' : 'var(--text)',
            fontWeight: '600', fontSize: '14px',
            boxShadow: 'var(--shadow)',
            border: category === cat ? 'none' : '1.5px solid #e0e0e0',
          }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Restaurant Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>
          Loading restaurants...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>
          No restaurants found. Add some from the <a href="/admin" style={{ color: 'var(--teal)' }}>admin panel</a>.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filtered.map(r => (
            <div key={r.id} onClick={() => navigate(`/restaurant/${r.id}`)}
              style={{
                background: '#fff', borderRadius: 'var(--radius)', overflow: 'hidden',
                boxShadow: 'var(--shadow)', cursor: 'pointer',
                transition: 'transform 0.2s', ':hover': { transform: 'translateY(-4px)' },
              }}>
              <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={r.image_url || r.image ? (r.image_url || `http://localhost:8000${r.image}`) : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80'}
                  alt={r.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80'; }}
                />
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: '700' }}>{r.name}</h3>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: '600', fontSize: '14px' }}>
                    <Star size={14} fill="#f59e0b" /> {r.rating}
                  </span>
                </div>
                <p style={{ color: 'var(--text-light)', fontSize: '13px', marginTop: '4px' }}>{r.category} • {r.city}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '13px', color: 'var(--text-light)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} /> 25-35 min</span>
                  <span>Free delivery</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}