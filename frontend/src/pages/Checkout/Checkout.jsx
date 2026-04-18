import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { createOrder } from '../../services/api';
import { ArrowLeft, MapPin, ShoppingBag } from 'lucide-react';
import MapPicker from '../../components/MapPicker';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart, total, restaurantId, clearCart } = useCart();
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [loading, setLoading] = useState(false);
  const [useMap, setUseMap] = useState(false);
  const navigate = useNavigate();

  const handleMapSelect = ({ lat, lng, address: addr }) => {
    setCoords({ lat, lng });
    setAddress(addr);
  };

  const handleOrder = async () => {
    if (!address.trim()) { toast.error('Please enter your delivery address'); return; }
    setLoading(true);
    try {
      await createOrder({
        restaurant_id: restaurantId,
        delivery_address: address,
        delivery_lat: coords.lat,
        delivery_lng: coords.lng,
        items: cart.map(i => ({
          menu_item_id: i.id,
          quantity: i.quantity,
          price: i.price,
        })),
      });
      clearCart();
      toast.success('Order placed! 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error('Could not place order. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '16px', paddingBottom: '32px' }}>
      <button onClick={() => navigate(-1)} style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: 'none', color: 'var(--muted-fg)', marginBottom: '20px', fontSize: '14px',
      }}>
        <ArrowLeft size={18} /> Back
      </button>

      <h1 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '20px' }}>Checkout</h1>

      {/* Delivery Address */}
      <div style={{
        background: '#fff', borderRadius: '14px', padding: '16px',
        boxShadow: 'var(--shadow)', marginBottom: '16px',
        border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} color="var(--primary)" /> Delivery Address
          </h2>
          <button onClick={() => setUseMap(!useMap)} style={{
            fontSize: '12px', fontWeight: '600', color: 'var(--primary)',
            background: 'var(--primary-light)', padding: '4px 10px', borderRadius: '8px',
          }}>
            {useMap ? '✏️ Type instead' : '🗺️ Pick on map'}
          </button>
        </div>

        {useMap ? (
          <MapPicker onSelect={handleMapSelect} />
        ) : (
          <textarea
            placeholder="Enter your full delivery address..."
            value={address}
            onChange={e => setAddress(e.target.value)}
            rows={3}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px',
              border: '1.5px solid var(--border)', fontSize: '14px',
              resize: 'none', background: 'var(--muted)',
            }}
          />
        )}

        {useMap && address && (
          <div style={{
            marginTop: '10px', padding: '10px 12px', borderRadius: '10px',
            background: 'var(--primary-light)', fontSize: '13px', color: 'var(--primary)', fontWeight: '500',
          }}>
            📍 {address}
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div style={{
        background: '#fff', borderRadius: '14px', padding: '16px',
        boxShadow: 'var(--shadow)', marginBottom: '20px',
        border: '1px solid var(--border)',
      }}>
        <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShoppingBag size={16} color="var(--primary)" /> Order Summary
        </h2>
        {cart.map(item => (
          <div key={item.id} style={{
            display: 'flex', justifyContent: 'space-between',
            marginBottom: '8px', fontSize: '14px',
          }}>
            <span style={{ color: 'var(--muted-fg)' }}>{item.quantity}× {item.name}</span>
            <span style={{ fontWeight: '600' }}>{(item.price * item.quantity).toFixed(2)} MAD</span>
          </div>
        ))}
        <div style={{
          borderTop: '1px solid var(--border)', marginTop: '12px', paddingTop: '12px',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span style={{ color: 'var(--muted-fg)', fontSize: '13px' }}>Delivery</span>
          <span style={{ color: 'green', fontWeight: '600', fontSize: '13px' }}>Free</span>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: '18px', fontWeight: '800', marginTop: '8px',
        }}>
          <span>Total</span>
          <span style={{ color: 'var(--primary)' }}>{total.toFixed(2)} MAD</span>
        </div>
      </div>

      <button onClick={handleOrder} disabled={loading} style={{
        width: '100%', padding: '16px', borderRadius: '12px',
        background: loading ? 'var(--muted)' : 'var(--primary)',
        color: loading ? 'var(--muted-fg)' : '#fff',
        fontSize: '16px', fontWeight: '700',
        boxShadow: loading ? 'none' : '0 8px 24px rgba(0,166,81,0.3)',
        transition: 'all 0.2s',
      }}>
        {loading ? 'Placing order...' : `Place Order — ${total.toFixed(2)} MAD`}
      </button>
    </div>
  );
}