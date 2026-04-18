import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRestaurant, getMenu } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Minus, ShoppingBag, Star, ArrowLeft, Clock, MapPin, Bike } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Restaurant() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const { addItem, cart, itemCount, total, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getRestaurant(id), getMenu(id)])
      .then(([rRes, mRes]) => {
        setRestaurant(rRes.data);
        setMenu(mRes.data);
        const cats = [...new Set(mRes.data.map(i => i.category))];
        if (cats.length) setActiveCategory(cats[0]);
      })
      .catch(() => toast.error('Could not load restaurant'))
      .finally(() => setLoading(false));
  }, [id]);

  const getQuantity = (itemId) => {
    const found = cart.find(i => i.id === itemId);
    return found ? found.quantity : 0;
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🍽️</div>
        <p style={{ color: 'var(--muted-fg)' }}>Loading menu...</p>
      </div>
    </div>
  );

  if (!restaurant) return (
    <div style={{ textAlign: 'center', padding: '80px' }}>Restaurant not found</div>
  );

  const categories = [...new Set(menu.map(i => i.category))];
  const fallbackImg = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80';

  return (
    <div style={{ paddingBottom: itemCount > 0 ? '100px' : '24px' }}>

      {/* Hero Image */}
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
        <img
          src={restaurant.image_url || fallbackImg}
          alt={restaurant.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.src = fallbackImg; }}
        />
        {/* Dark gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%)',
        }} />
        {/* Back button */}
        <button onClick={() => navigate(-1)} style={{
          position: 'absolute', top: '16px', left: '16px',
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff',
        }}>
          <ArrowLeft size={18} />
        </button>
        {/* Restaurant name overlaid */}
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px' }}>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            {restaurant.name}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', marginTop: '2px' }}>
            {restaurant.description}
          </p>
        </div>
      </div>

      {/* Info bar */}
      <div style={{
        display: 'flex', gap: '16px', padding: '14px 16px',
        background: '#fff', borderBottom: '1px solid var(--border)',
        overflowX: 'auto',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '600', color: '#f59e0b', flexShrink: 0 }}>
          <Star size={14} fill="#f59e0b" color="#f59e0b" /> {restaurant.rating}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--muted-fg)', flexShrink: 0 }}>
          <Clock size={13} /> 25-35 min
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--muted-fg)', flexShrink: 0 }}>
          <Bike size={13} /> Free delivery
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--muted-fg)', flexShrink: 0 }}>
          <MapPin size={13} /> {restaurant.city}
        </span>
      </div>

      {/* Category tabs */}
      {categories.length > 1 && (
        <div style={{
          display: 'flex', gap: '8px', padding: '12px 16px',
          overflowX: 'auto', background: '#fff',
          borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10,
        }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
              whiteSpace: 'nowrap', flexShrink: 0,
              background: activeCategory === cat ? 'var(--primary)' : 'var(--muted)',
              color: activeCategory === cat ? '#fff' : 'var(--muted-fg)',
              transition: 'all 0.2s',
            }}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Menu Items */}
      <div style={{ padding: '16px' }}>
        {categories.map(cat => (
          (!activeCategory || activeCategory === cat) && (
            <div key={cat} style={{ marginBottom: '24px' }}>
              <h2 style={{
                fontSize: '16px', fontWeight: '800', marginBottom: '12px',
                paddingBottom: '8px', borderBottom: '2px solid var(--primary)',
                display: 'inline-block', color: 'var(--foreground)',
              }}>
                {cat}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {menu.filter(i => i.category === cat).map(item => {
                  const qty = getQuantity(item.id);
                  return (
                    <div key={item.id} style={{
                      background: '#fff', borderRadius: '14px',
                      border: qty > 0 ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                      padding: '14px', display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', boxShadow: 'var(--shadow)',
                      transition: 'all 0.2s',
                    }}>
                      <div style={{ flex: 1, marginRight: '12px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '700' }}>{item.name}</h3>
                        {item.description && (
                          <p style={{ color: 'var(--muted-fg)', fontSize: '12px', margin: '3px 0 6px' }}>
                            {item.description}
                          </p>
                        )}
                        <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '15px' }}>
                          {item.price} MAD
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {qty > 0 ? (
                          <>
                            <button onClick={() => {
                              addItem(item, restaurant.id);
                            }} style={{
                              width: '30px', height: '30px', borderRadius: '50%',
                              background: 'var(--muted)', display: 'flex',
                              alignItems: 'center', justifyContent: 'center',
                            }}>
                              <Minus size={13} />
                            </button>
                            <span style={{ fontWeight: '800', minWidth: '18px', textAlign: 'center', fontSize: '15px' }}>
                              {qty}
                            </span>
                          </>
                        ) : null}
                        <button onClick={() => {
                          if (!user) { toast.error('Please login first'); navigate('/login'); return; }
                          addItem(item, restaurant.id);
                          toast.success(`${item.name} added!`, { icon: '🛒' });
                        }} style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          background: 'var(--primary)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(0,166,81,0.3)',
                        }}>
                          <Plus size={16} color="#fff" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ))}
      </div>

      {/* Floating Cart Button */}
      {itemCount > 0 && (
        <div style={{ position: 'fixed', bottom: '80px', left: '16px', right: '16px', zIndex: 50 }}>
          <button onClick={() => navigate('/cart')} style={{
            width: '100%', background: 'var(--primary)', color: '#fff',
            padding: '16px 24px', borderRadius: '14px', fontSize: '15px', fontWeight: '700',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(0,166,81,0.4)',
          }}>
            <span style={{
              background: 'rgba(255,255,255,0.25)', borderRadius: '8px',
              padding: '2px 10px', fontSize: '14px',
            }}>
              {itemCount}
            </span>
            <span>View Cart</span>
            <span>{total.toFixed(0)} MAD</span>
          </button>
        </div>
      )}
    </div>
  );
}