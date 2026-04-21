import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRestaurant, getMenu } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import { Plus, Minus, Star, ArrowLeft, Clock, MapPin, Bike, Heart, Bell, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Restaurant() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [mode, setMode] = useState('delivery');
  const [fav, setFav] = useState(false);
  const { addItem, cart, itemCount, total } = useCart();
  const { user } = useAuth();
  const { t, isRTL } = useLang();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getRestaurant(id), getMenu(id)])
      .then(([rRes, mRes]) => {
        setRestaurant(rRes.data);
        setMenu(mRes.data);
        const cats = [...new Set(mRes.data.map(i => i.category))];
        if (cats.length) setActiveCategory(cats[0]);
        const favs = JSON.parse(localStorage.getItem('fav_restaurants') || '[]');
        setFav(favs.includes(parseInt(id)));
      })
      .catch(() => toast.error('Could not load restaurant'))
      .finally(() => setLoading(false));
  }, [id]);

  function toggleFav() {
    const favs = JSON.parse(localStorage.getItem('fav_restaurants') || '[]');
    const updated = fav ? favs.filter(f => f !== parseInt(id)) : [...favs, parseInt(id)];
    localStorage.setItem('fav_restaurants', JSON.stringify(updated));
    setFav(!fav);
  }

  const getQty = (itemId) => {
    const found = cart.find(i => i.id === itemId);
    return found ? found.quantity : 0;
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '40px' }}>🍽️</div>
      <p style={{ color: '#999' }}>Loading...</p>
    </div>
  );

  if (!restaurant) return (
    <div style={{ textAlign: 'center', padding: '80px' }}>Restaurant not found</div>
  );

  const categories = [...new Set(menu.map(i => i.category))];
  const fallbackImg = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80';

  return (
    <div style={{ paddingBottom: itemCount > 0 ? '140px' : '24px', direction: isRTL ? 'rtl' : 'ltr' }}>

      {/* Hero Image */}
      <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
        <img
          src={restaurant.image_url || fallbackImg}
          alt={restaurant.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.src = fallbackImg; }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%)' }} />

        {/* Top buttons */}
        <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={() => navigate(-1)} style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
          }}>
            <ArrowLeft size={18} color='#fff' />
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer',
            }}>
              <Bell size={18} color='#fff' />
            </button>
            <button onClick={toggleFav} style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer',
            }}>
              <Heart size={18} color={fav ? '#FF6B00' : '#fff'} fill={fav ? '#FF6B00' : 'none'} />
            </button>
          </div>
        </div>

        {/* Rating badge */}
        <div style={{
          position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)',
          background: '#FF6B00', borderRadius: '20px', padding: '4px 12px',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <Star size={12} fill='#fff' color='#fff' />
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: '800' }}>{restaurant.rating}</span>
        </div>

        {/* Restaurant info */}
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px' }}>
          <h1 style={{ color: '#fff', fontSize: '26px', fontWeight: '900', marginBottom: '6px' }}>
            {restaurant.name}
          </h1>
          {restaurant.description && (
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: 1.4 }}>
              {restaurant.description}
            </p>
          )}
        </div>
      </div>

      {/* Delivery / Takeaway toggle */}
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '14px', padding: '4px', marginBottom: '16px' }}>
          {['delivery', 'takeaway'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '10px', borderRadius: '10px', fontSize: '14px',
              fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
              background: mode === m ? '#FF6B00' : 'transparent',
              color: mode === m ? '#fff' : '#999',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
              {m === 'delivery' ? '🛵' : '🏪'} {m === 'delivery' ? 'DELIVERY' : 'TAKEAWAY'}
            </button>
          ))}
        </div>

        {/* Info rows — Feasto style */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            { icon: '🏪', label: `From ${restaurant.name}`, sub: `${restaurant.city} • ${restaurant.category}` },
            { icon: '⏱️', label: 'Delivery in 25–35 mins', sub: 'Schedule for later' },
            { icon: '👥', label: 'Order with Friends', sub: 'Split the bill easily' },
          ].map((row, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 0',
              borderBottom: i < 2 ? '1px solid #f5f5f5' : 'none',
            }}>
              <span style={{ fontSize: '20px' }}>{row.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>{row.label}</p>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '1px' }}>{row.sub}</p>
              </div>
              <ChevronRight size={16} color='#ccc' />
            </div>
          ))}
        </div>
      </div>

      {/* You Might Also Like */}
      {menu.length > 0 && (
        <div style={{ background: '#fff', padding: '16px', marginTop: '8px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800' }}>You Might Also Like</h2>
            <span style={{ fontSize: '13px', color: '#FF6B00', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px' }}>
              View All <ChevronRight size={14} />
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', marginLeft: '-16px', paddingLeft: '16px', paddingRight: '16px' }}>
            {menu.slice(0, 5).map(item => (
              <div key={item.id} style={{ flexShrink: 0, width: '100px', textAlign: 'center', cursor: 'pointer' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '16px', overflow: 'hidden',
                  margin: '0 auto 6px', background: '#f5f5f5',
                }}>
                  <img
                    src={item.image_url || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80`}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80'; }}
                  />
                </div>
                <p style={{ fontSize: '11px', fontWeight: '600', color: '#1a1a1a', lineHeight: 1.2 }}>{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category tabs */}
      {categories.length > 0 && (
        <div style={{
          display: 'flex', gap: '8px', padding: '12px 16px',
          overflowX: 'auto', background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          position: 'sticky', top: '57px', zIndex: 10, marginTop: '8px',
        }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: '8px 18px', borderRadius: '25px', fontSize: '13px',
              fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0,
              cursor: 'pointer', transition: 'all 0.2s',
              background: activeCategory === cat ? '#FF6B00' : '#f5f5f5',
              color: activeCategory === cat ? '#fff' : '#666',
            }}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Menu Items */}
      <div style={{ padding: '16px', background: '#f8f8f8' }}>
        {categories.map(cat => (
          (!activeCategory || activeCategory === cat) && (
            <div key={cat} style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px', color: '#1a1a1a' }}>{cat}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {menu.filter(i => i.category === cat && i.is_available).map(item => {
                  const qty = getQty(item.id);
                  return (
                    <motion.div key={item.id} layout style={{
                      background: '#fff', borderRadius: '16px', padding: '14px',
                      display: 'flex', gap: '12px', alignItems: 'center',
                      boxShadow: qty > 0 ? '0 4px 16px rgba(255,107,0,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
                      border: qty > 0 ? '1.5px solid #FF6B00' : '1px solid transparent',
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>{item.name}</h3>
                        {item.description && (
                          <p style={{ fontSize: '12px', color: '#999', marginBottom: '6px', lineHeight: 1.4 }}>
                            {item.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px', fontWeight: '900', color: '#1a1a1a' }}>
                            {item.price} MAD
                          </span>
                        </div>
                      </div>

                      {/* Quantity controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <AnimatePresence>
                          {qty > 0 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                              <button
                                onClick={() => addItem({ ...item, quantity: -2 }, restaurant.id)}
                                style={{
                                  width: '30px', height: '30px', borderRadius: '50%',
                                  background: '#f5f5f5', border: 'none', cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                              >
                                <Minus size={13} color='#666' />
                              </button>
                              <span style={{ fontWeight: '800', minWidth: '18px', textAlign: 'center', fontSize: '15px' }}>
                                {qty}
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <button
                          onClick={() => {
                            if (!user) { toast.error('Please login first'); navigate('/login'); return; }
                            addItem(item, restaurant.id);
                            toast.success(`${item.name} added!`, { style: { borderRadius: '12px' } });
                          }}
                          style={{
                            width: '34px', height: '34px', borderRadius: '50%',
                            background: '#FF6B00', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(255,107,0,0.3)',
                          }}
                        >
                          <Plus size={16} color='#fff' />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )
        ))}
      </div>

      {/* Sticky Cart Bar — Feasto style */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            style={{
              position: 'fixed', bottom: '72px',
              left: '50%', transform: 'translateX(-50%)',
              width: 'calc(100% - 32px)', maxWidth: '448px', zIndex: 50,
            }}
          >
            <button
              onClick={() => navigate('/cart')}
              style={{
                width: '100%', background: '#FF6B00', color: '#fff',
                borderRadius: '16px', border: 'none', cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(255,107,0,0.4)',
                display: 'flex', alignItems: 'center', overflow: 'hidden',
              }}
            >
              <div style={{
                background: 'rgba(0,0,0,0.2)', padding: '16px 18px',
                borderRight: '1px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <span style={{ fontWeight: '800', fontSize: '15px' }}>{itemCount}</span>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>items</span>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '16px 8px' }}>
                <span style={{ fontWeight: '800', fontSize: '15px' }}>Add {itemCount} to Cart</span>
              </div>
              <div style={{
                background: 'rgba(0,0,0,0.15)', padding: '16px 18px',
                borderLeft: '1px solid rgba(255,255,255,0.2)',
              }}>
                <span style={{ fontWeight: '800', fontSize: '15px' }}>{total.toFixed(0)} MAD</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}