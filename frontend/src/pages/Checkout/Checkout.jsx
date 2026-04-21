import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import API from '../../services/api';
import { MapPin, ArrowLeft, Bike, Shield, ChevronRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AL_HOCEIMA = [35.2517, -3.9372];
const SERVICE_FEE = 5;

function getDeliveryFee(distanceKm) {
  if (!distanceKm) return 15;
  if (distanceKm <= 1) return 10;
  if (distanceKm <= 3) return 15;
  if (distanceKm <= 5) return 20;
  if (distanceKm <= 10) return 25;
  return 35;
}

function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dlat = (lat2 - lat1) * Math.PI / 180;
  const dlng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dlng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function MapPicker({ position, onMove }) {
  useMapEvents({ click: e => onMove(e.latlng) });
  return position ? <Marker position={position} /> : null;
}

export default function Checkout() {
  const { cart: items, restaurantId, clearCart } = useCart();
  const { user } = useAuth();
  const { t, isRTL } = useLang();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [position, setPosition] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [restaurant, setRestaurant] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(15);
  const [distanceKm, setDistanceKm] = useState(null);

  useEffect(() => {
    if (restaurantId) {
      API.get(`/restaurants/${restaurantId}/`)
        .then(res => setRestaurant(res.data))
        .catch(() => { });
    }
  }, [restaurantId]);

  useEffect(() => {
    if (position && restaurant?.lat && restaurant?.lng) {
      const dist = calcDistance(restaurant.lat, restaurant.lng, position.lat, position.lng);
      setDistanceKm(dist);
      setDeliveryFee(getDeliveryFee(dist));
    }
  }, [position, restaurant]);

  async function reverseGeocode(lat, lng) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      return data.display_name?.split(',').slice(0, 3).join(',') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  async function handleMapClick(latlng) {
    setPosition(latlng);
    const addr = await reverseGeocode(latlng.lat, latlng.lng);
    setAddress(addr);
  }

  function locateMe() {
    navigator.geolocation.getCurrentPosition(async pos => {
      const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setPosition(latlng);
      const addr = await reverseGeocode(latlng.lat, latlng.lng);
      setAddress(addr);
    });
  }

  const itemsTotal = (items || []).reduce((s, i) => s + i.price * i.quantity, 0);
  const total = itemsTotal + deliveryFee + SERVICE_FEE;

  async function handleOrder() {
    if (!address) { toast.error('Please select a delivery address'); return; }
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    try {
      await API.post('/orders/create/', {
        restaurant_id: restaurantId,
        delivery_address: address,
        delivery_lat: position?.lat,
        delivery_lng: position?.lng,
        payment_method: paymentMethod,
        delivery_fee: deliveryFee,
        service_fee: SERVICE_FEE,
        distance_km: distanceKm,
        items: items.map(i => ({ menu_item_id: i.id, quantity: i.quantity, price: i.price })),
      });
      clearCart();
      toast.success('Order placed! 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    }
    setLoading(false);
  }

  if (!items || items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div style={{ background: '#f8f8f8', minHeight: '100vh', paddingBottom: '120px', direction: isRTL ? 'rtl' : 'ltr' }}>

      {/* Header */}
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate(-1)} style={{
          width: '38px', height: '38px', borderRadius: '50%',
          background: '#f5f5f5', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ArrowLeft size={18} color='#1a1a1a' />
        </button>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '800' }}>Checkout</h1>
          {restaurant && <p style={{ fontSize: '12px', color: '#999' }}>{restaurant.name}</p>}
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Delivery address */}
        <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#FFF3E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={16} color='#FF6B00' />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '700' }}>Delivery Address</p>
                <p style={{ fontSize: '12px', color: '#999' }}>
                  {address || 'Tap map to select'}
                </p>
              </div>
            </div>
            <ChevronRight size={16} color='#ccc' />
          </div>

          {/* Map */}
          <div style={{ height: '180px' }}>
            <MapContainer
              center={position ? [position.lat, position.lng] : AL_HOCEIMA}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapPicker position={position} onMove={handleMapClick} />
            </MapContainer>
          </div>

          <div style={{ padding: '12px 14px', display: 'flex', gap: '8px' }}>
            <input
              placeholder="Your address..."
              value={address}
              onChange={e => setAddress(e.target.value)}
              style={{
                flex: 1, padding: '10px 12px', borderRadius: '10px',
                border: '1.5px solid #f0f0f0', fontSize: '13px', color: '#1a1a1a',
                background: '#f8f8f8',
              }}
            />
            <button onClick={locateMe} style={{
              padding: '10px 14px', borderRadius: '10px',
              background: '#FF6B00', color: '#fff', fontWeight: '700',
              fontSize: '12px', cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <MapPin size={13} /> Locate
            </button>
          </div>
          {distanceKm && (
            <p style={{ fontSize: '11px', color: '#999', padding: '0 14px 10px' }}>
              📏 {distanceKm.toFixed(1)} km from restaurant
            </p>
          )}
        </div>

        {/* Payment method */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: '15px', fontWeight: '800', marginBottom: '12px' }}>Payment Method</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { key: 'cash', label: 'Cash', icon: '💵', sub: 'Pay on delivery' },
              { key: 'card', label: 'Card', icon: '💳', sub: 'Online payment' },
            ].map(p => (
              <button key={p.key} onClick={() => setPaymentMethod(p.key)} style={{
                flex: 1, padding: '14px', borderRadius: '14px', cursor: 'pointer',
                border: paymentMethod === p.key ? '2px solid #FF6B00' : '1.5px solid #f0f0f0',
                background: paymentMethod === p.key ? '#FFF3E8' : '#f8f8f8',
                textAlign: 'center', transition: 'all 0.2s',
              }}>
                <p style={{ fontSize: '24px', marginBottom: '6px' }}>{p.icon}</p>
                <p style={{ fontSize: '13px', fontWeight: '800', color: paymentMethod === p.key ? '#FF6B00' : '#1a1a1a' }}>
                  {p.label}
                </p>
                <p style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>{p.sub}</p>
              </button>
            ))}
          </div>
          {paymentMethod === 'card' && (
            <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '10px', textAlign: 'center' }}>
              ⚠️ Card payment coming soon — please use cash
            </p>
          )}
        </div>

        {/* Order summary */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: '15px', fontWeight: '800', marginBottom: '14px' }}>Order Summary</p>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', padding: '5px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ color: '#666' }}>{item.quantity}× {item.name}</span>
              <span style={{ fontWeight: '700' }}>{(item.price * item.quantity).toFixed(0)} MAD</span>
            </div>
          ))}
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#999' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Bike size={13} /> Delivery {distanceKm ? `(${distanceKm.toFixed(1)} km)` : ''}
              </span>
              <span>{deliveryFee} MAD</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#999' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={13} /> Service fee
              </span>
              <span>{SERVICE_FEE} MAD</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '900', paddingTop: '10px', borderTop: '1px solid #f0f0f0' }}>
              <span>Total</span>
              <span style={{ color: '#FF6B00' }}>{total.toFixed(0)} MAD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Place order button */}
      <div style={{
        position: 'fixed', bottom: '72px',
        left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)', maxWidth: '448px', zIndex: 50,
      }}>
        <button
          onClick={handleOrder}
          disabled={loading || paymentMethod === 'card'}
          style={{
            width: '100%', background: loading || paymentMethod === 'card' ? '#ccc' : '#FF6B00',
            color: '#fff', padding: '0', borderRadius: '16px', border: 'none',
            cursor: loading || paymentMethod === 'card' ? 'not-allowed' : 'pointer',
            boxShadow: '0 8px 32px rgba(255,107,0,0.4)',
            display: 'flex', alignItems: 'center', overflow: 'hidden',
          }}
        >
          <div style={{ background: 'rgba(0,0,0,0.15)', padding: '16px 18px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontWeight: '800', fontSize: '15px' }}>{items.length} items</span>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: '16px 8px' }}>
            <span style={{ fontWeight: '800', fontSize: '15px' }}>
              {loading ? 'Placing order...' : 'Place Order'}
            </span>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.15)', padding: '16px 18px', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontWeight: '800', fontSize: '15px' }}>{total.toFixed(0)} MAD</span>
          </div>
        </button>
      </div>
    </div>
  );
}