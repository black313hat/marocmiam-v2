import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRestaurant, getMenu } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import { Plus, Minus, ShoppingBag, Star, ArrowLeft, Clock, MapPin, Bike, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  Plats: { bg: '#FFF3E8', color: '#FF6B00' },
  Entrées: { bg: '#FFF9E6', color: '#F59E0B' },
  Desserts: { bg: '#FDF2F8', color: '#EC4899' },
  Boissons: { bg: '#EFF6FF', color: '#3B82F6' },
  Accompagnements: { bg: '#F0FDF4', color: '#16A34A' },
};

function getCatStyle(cat) {
  return CATEGORY_COLORS[cat] || { bg: '#F5F5F5', color: '#666' };
}

export default function Restaurant() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
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

  const getQuantity = (itemId) => {
    const found = cart.find(i => i.id === itemId);
    return found ? found.quantity : 0;
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '40px' }}>🍽️</div>
      <p style={{ color: '#999' }}>Loading menu...</p>
    </div>
  );

  if (!restaurant) return (
    <div style={{ textAlign: 'center', padding: '80px' }}>Restaurant not found</div>
  );

  const categories = [...new Set(menu.map(i => i.category))];
  const fallbackImg = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80';
  const restaurantItems = cart.filter(i => i.restaurantId === parseInt(id));

  return (
    <div style={{ paddingBottom: itemCount > 0 ? '100px' : '24px', direction: isRTL ? 'rtl' : 'ltr' }}>

      {/* Hero Image */}
      <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
        <img
          src={restaurant.image_url || fallbackImg}
          alt={restaurant.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.src = fallbackImg; }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.15) 60%)' }} />

        {/* Top buttons */}
        <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={() => navigate(-1)} style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
          }}>
            <ArrowLeft size={18} color="#fff" />
          </button>
          <button onClick={toggleFav} style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
          }}>
            <Heart size={18} color={fav ? '#FF6B00' : '#fff'} fill={fav ? '#FF6B00' : 'none'} />
          </button>
        </div>

        {/* Restaurant info overlay */}
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              background: restaurant.is_open ? '#22c55e' : '#ef4444',
              color: '#fff', fontSize: '10px', fontWeight: '700',
              padding: '3px 10px', borderRadius: '20px',
            }}>
              {restaurant.is_open ? '🟢 Ouvert' : '🔴 Fermé'}
            </span>
            <span style={{
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
              color: '#fff', fontSize: '10px', fontWeight: '600',
              padding: '3px 10px', borderRadius: '20px',
            }}>
              {restaurant.category}
            </span>
          </div>
          <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '900', marginBottom: '4px' }}>
            {restaurant.name}
          </h1>
          {restaurant.description && (
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', lineHeight: 1.4 }}>
              {restaurant.description}
            </p>
          )}
        </div>
      </div>

      {/* Info bar */}
      <div style={{
        display: 'flex', gap: '0',
        background: '#fff', borderBottom: '1px solid #f0f0f0',
      }}>
        {[
          { icon: <Star size={14} fill="#FF6B00" color="#FF6B00" />, value: restaurant.rating, color: '#FF6B00' },
          { icon: <Clock size={13} color="#999" />, value: '25-35 min', color: '#666' },
          { icon: <Bike size={13} color="#22c55e" />, value: 'Gratuit', color: '#22c55e' },
          { icon: <MapPin size={13} color="#999" />, value: restaurant.city, color: '#666' },
        ].map((info, i) => (
          <div key={i} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '4px', padding: '12px 4px',
            borderRight: i < 3 ? '1px solid #f0f0f0' : 'none',
          }}>
            {info.icon}
            <span style={{ fontSize: '11px', fontWeight: '700', color: info.color, whiteSpace: 'nowrap' }}>
              {info.value}
            </span>
          </div>
        ))}
      </div>

      {/* Category tabs - sticky */}
      {categories.length > 0 && (
        <div style={{
          display: 'flex', gap: '8px', padding: '12px 16px',
          overflowX: 'auto', background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          {categories.map(cat => {
            const c = getCatStyle(cat);
            const active = activeCategory === cat;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                padding: '7px 16px', borderRadius: '20px', fontSize: '12px',
                fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0,
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: active ? c.color : c.bg,
                color: active ? '#fff' : c.color,
              }}>
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* Menu Items */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {categories.map(cat => (
          (!activeCategory || activeCategory === cat) && (
            <div key={cat}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{
                  width: '4px', height: '20px', borderRadius: '2px',
                  background: getCatStyle(cat).color,
                }} />
                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#1a1a1a' }}>{cat}</h2>
                <span style={{ fontSize: '12px', color: '#999' }}>
                  ({menu.filter(i => i.category === cat).length})
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {menu.filter(i => i.category === cat && i.is_available).map(item => {
                  const qty = getQuantity(item.id);
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      style={{
                        background: '#fff', borderRadius: '16px',
                        border: qty > 0 ? '2px solid #FF6B00' : '1px solid #f0f0f0',
                        padding: '14px', display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center',
                        boxShadow: qty > 0 ? '0 4px 16px rgba(255,107,0,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ flex: 1, marginRight: '12px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a', marginBottom: '3px' }}>
                          {item.name}
                        </h3>
                        {item.description && (
                          <p style={{ color: '#999', fontSize: '11px', marginBottom: '6px', lineHeight: 1.4 }}>
                            {item.description}
                          </p>
                        )}
                        <span style={{ color: '#FF6B00', fontWeight: '800', fontSize: '15px' }}>
                          {item.price} MAD
                        </span>
                      </div>

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
                                onClick={() => {
                                  const found = cart.find(i => i.id === item.id);
                                  if (found && found.quantity > 1) {
                                    addItem({ ...item, quantity: -2 }, restaurant.id);
                                  } else {
                                    addItem({ ...item, quantity: -2 }, restaurant.id);
                                  }
                                }}
                                style={{
                                  width: '30px', height: '30px', borderRadius: '50%',
                                  background: '#f5f5f5', border: 'none', cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                              >
                                <Minus size={13} color="#666" />
                              </button>
                              <span style={{ fontWeight: '800', minWidth: '18px', textAlign: 'center', fontSize: '15px', color: '#FF6B00' }}>
                                {qty}
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <button
                          onClick={() => {
                            if (!user) { toast.error('Please login first'); navigate('/login'); return; }
                            addItem(item, restaurant.id);
                            toast.success(`${item.name} ajouté! 🛒`, { style: { borderRadius: '12px' } });
                          }}
                          style={{
                            width: '34px', height: '34px', borderRadius: '50%',
                            background: '#FF6B00', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(255,107,0,0.3)',
                          }}
                        >
                          <Plus size={16} color="#fff" />
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
              position: 'fixed', bottom: '72px', left: '50%',
              transform: 'translateX(-50%)',
              width: 'calc(100% - 32px)', maxWidth: '448px',
              zIndex: 50,
            }}
          >
            <button
              onClick={() => navigate('/cart')}
              style={{
                width: '100%', background: '#FF6B00', color: '#fff',
                padding: '0', borderRadius: '16px', border: 'none',
                cursor: 'pointer', overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(255,107,0,0.4)',
                display: 'flex', alignItems: 'center',
              }}
            >
              {/* Item count badge */}
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '16px 18px',
                display: 'flex', alignItems: 'center', gap: '8px',
                borderRight: '1px solid rgba(255,255,255,0.2)',
              }}>
                <ShoppingBag size={18} color="#fff" />
                <span style={{ fontWeight: '800', fontSize: '15px' }}>{itemCount}</span>
              </div>

              {/* Center text */}
              <div style={{ flex: 1, textAlign: 'center', padding: '16px 8px' }}>
                <span style={{ fontWeight: '800', fontSize: '15px' }}>
                  Voir mon panier
                </span>
              </div>

              {/* Price */}
              <div style={{
                background: 'rgba(0,0,0,0.15)',
                padding: '16px 18px',
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