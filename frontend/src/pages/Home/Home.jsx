import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRestaurants } from '../../services/api';
import { ChevronRight, MapPin, Bell, Star, Clock } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  { key: 'Restaurant', label: 'Restos',   img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80', color: '#FFF3E8' },
  { key: 'Fast Food',  label: 'Fast Food', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80', color: '#FFF9E6' },
  { key: 'Café',       label: 'Cafés',     img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&q=80', color: '#F0FDF4' },
  { key: 'Barbecue',   label: 'Grills',    img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&q=80', color: '#FEF2F2' },
  { key: 'Supermarket',label: 'Marché',    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80', color: '#EFF6FF' },
];

const PROMOS = [
  { bg: '#FFF3E0', title: 'Craving something amazing?', discount: '50%', sub: 'On selected restaurants', btn: 'ORDER NOW', img: '🍔', color: '#FF6B00' },
  { bg: '#F0FFF4', title: 'Fresh & Healthy meals',      discount: '25%', sub: 'On your first order',      btn: 'ORDER NOW', img: '🥗', color: '#16A34A' },
  { bg: '#FFF0F6', title: 'Sweet treats await',         discount: '30%', sub: 'On desserts today',        btn: 'ORDER NOW', img: '🍰', color: '#EC4899' },
];

export default function Home() {
  const navigate  = useNavigate();
  const { t, isRTL } = useLang();
  const { user }  = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [promoIdx, setPromoIdx]       = useState(0);

  useEffect(() => {
    getRestaurants().then(res => setRestaurants(res.data)).catch(() => {});
    const timer = setInterval(() => setPromoIdx(i => (i + 1) % PROMOS.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const deals = restaurants.filter(r => r.rating >= 4.5).slice(0, 6);
  const promo = PROMOS[promoIdx];

  // Show "Become a member" only if user is not already owner/courier/admin
  const profileRole = user?.profile_role || 'customer';
  const showMembership = !user || (profileRole === 'customer' && !user.is_staff);

  return (
    <div style={{ background: '#f8f8f8', minHeight: '100vh', paddingBottom: '80px', direction: isRTL ? 'rtl' : 'ltr' }}>

      {/* Location bar */}
      <div style={{ padding: '12px 16px 0', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} color='#FF6B00' />
            <div>
              <p style={{ fontSize: '11px', color: '#999' }}>Livraison à</p>
              <p style={{ fontSize: '14px', fontWeight: '800', color: '#1a1a1a' }}>Al Hoceima, Maroc ▾</p>
            </div>
          </div>
          <button style={{ position: 'relative', padding: '8px', background: '#f5f5f5', borderRadius: '12px', border: 'none', cursor: 'pointer' }}>
            <Bell size={20} color='#1a1a1a' />
            <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: '#FF6B00', borderRadius: '50%' }} />
          </button>
        </div>
      </div>

      {/* Promo banner */}
      <div style={{ padding: '16px' }}>
        <div style={{
          background: promo.bg, borderRadius: '20px', padding: '20px',
          position: 'relative', overflow: 'hidden', minHeight: '140px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'background 0.5s',
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>{promo.title}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
              <span style={{ fontSize: '36px', fontWeight: '900', color: promo.color }}>{promo.discount}</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: promo.color }}>OFF</span>
            </div>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '12px' }}>{promo.sub}</p>
            <button onClick={() => navigate('/restaurants')} style={{
              background: promo.color, color: '#fff', padding: '10px 20px',
              borderRadius: '25px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', border: 'none',
            }}>
              {promo.btn} →
            </button>
          </div>
          <div style={{ fontSize: '90px', opacity: 0.8 }}>{promo.img}</div>
          <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}>
            {PROMOS.map((_, i) => (
              <div key={i} onClick={() => setPromoIdx(i)} style={{
                width: i === promoIdx ? '16px' : '6px', height: '6px',
                borderRadius: '3px', background: i === promoIdx ? promo.color : '#ccc',
                cursor: 'pointer', transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800' }}>Categories</h2>
          <button onClick={() => navigate('/restaurants')} style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '13px', color: '#FF6B00', fontWeight: '600', cursor: 'pointer', border: 'none', background: 'none' }}>
            See All <ChevronRight size={16} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {CATEGORIES.slice(0, 3).map(cat => (
            <div key={cat.key} onClick={() => navigate(`/restaurants?category=${cat.key}`)} style={{
              background: cat.color, borderRadius: '16px', padding: '12px',
              cursor: 'pointer', overflow: 'hidden',
            }}>
              <img src={cat.img} alt={cat.label}
                style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '10px', marginBottom: '8px' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#1a1a1a' }}>{cat.label}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '10px' }}>
          {[0, 1].map(i => (
            <div key={i} style={{ width: i === 0 ? '16px' : '6px', height: '6px', borderRadius: '3px', background: i === 0 ? '#FF6B00' : '#e0e0e0' }} />
          ))}
        </div>
      </div>

      {/* Deals for you */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800' }}>Deals for You</h2>
          <button onClick={() => navigate('/restaurants')} style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '13px', color: '#FF6B00', fontWeight: '600', cursor: 'pointer', border: 'none', background: 'none' }}>
            View All <ChevronRight size={16} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', marginLeft: '-16px', paddingLeft: '16px', paddingRight: '16px', paddingBottom: '8px' }}>
          {deals.map(r => (
            <div key={r.id} onClick={() => navigate(`/restaurant/${r.id}`)} style={{
              flexShrink: 0, width: '200px', background: '#fff',
              borderRadius: '16px', overflow: 'hidden', cursor: 'pointer',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}>
              <div style={{ position: 'relative', height: '120px' }}>
                <img
                  src={r.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80'}
                  alt={r.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80'; }}
                />
                <div style={{
                  position: 'absolute', top: '8px', right: '8px',
                  background: '#FF6B00', borderRadius: '8px', padding: '3px 8px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                }}>
                  <span style={{ color: '#fff', fontSize: '8px', fontWeight: '600' }}>OFF</span>
                  <span style={{ color: '#fff', fontSize: '14px', fontWeight: '900', lineHeight: 1 }}>25%</span>
                </div>
              </div>
              <div style={{ padding: '10px 12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '4px' }}>{r.name}</h3>
                <p style={{ fontSize: '11px', color: '#999', marginBottom: '6px' }}>{r.category}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: '700', color: '#FF6B00' }}>
                    <Star size={12} fill='#FF6B00' color='#FF6B00' /> {r.rating}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#999' }}>
                    <Clock size={11} /> 25-35 min
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Become a Member ── */}
      {showMembership && (
        <div style={{ padding: '24px 16px 0' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1a1a1a', letterSpacing: '-0.02em' }}>
              Become a member of our family?
            </h2>
            <p style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
              Join us as a partner or courier
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

            {/* Restaurant Partner */}
            <div style={{
              background: '#fff', borderRadius: '20px', padding: '18px',
              border: '1.5px solid #F0F0F0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: '#FFF3E8', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '24px', marginBottom: '12px',
              }}>
                🍽️
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#111', marginBottom: '6px', letterSpacing: '-0.01em' }}>
                Restaurant Partner
              </h3>
              <p style={{ fontSize: '11px', color: '#999', lineHeight: 1.5, marginBottom: '12px', flex: 1 }}>
                Boost your sales and reach thousands of customers in your city
              </p>
              <div style={{ marginBottom: '14px' }}>
                {['0 fixed fees', '+40% sales', 'Live dashboard'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#FFF3E8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '9px', color: '#FF6B00' }}>✓</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate(user ? '/apply/restaurant' : '/login')}
                style={{
                  background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
                  color: '#fff', padding: '10px 14px', borderRadius: '12px',
                  fontSize: '11px', fontWeight: '800', border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255,107,0,0.3)',
                }}
              >
                Join as restaurant →
              </button>
            </div>

            {/* Delivery Courier */}
            <div style={{
              background: '#fff', borderRadius: '20px', padding: '18px',
              border: '1.5px solid #F0F0F0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: '#EFF6FF', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '24px', marginBottom: '12px',
              }}>
                🛵
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#111', marginBottom: '6px', letterSpacing: '-0.01em' }}>
                Delivery Courier
              </h3>
              <p style={{ fontSize: '11px', color: '#999', lineHeight: 1.5, marginBottom: '12px', flex: 1 }}>
                Earn money delivering when you want, where you want
              </p>
              <div style={{ marginBottom: '14px' }}>
                {['Flexible hours', 'Weekly pay', 'Free gear'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '9px', color: '#2563EB' }}>✓</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate(user ? '/apply/courier' : '/login')}
                style={{
                  background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                  color: '#fff', padding: '10px 14px', borderRadius: '12px',
                  fontSize: '11px', fontWeight: '800', border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                }}
              >
                Join as courier →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
