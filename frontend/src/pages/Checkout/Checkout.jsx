import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { MapPin, CreditCard, Banknote, ArrowLeft, Bike, Shield } from 'lucide-react';
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
const DELIVERY_RATES = { 1: 10, 3: 15, 5: 20, 10: 25, 99: 35 };
const SERVICE_FEE = 5;

function getDeliveryFee(distanceKm) {
  if (!distanceKm) return 15;
  for (const [limit, fee] of Object.entries(DELIVERY_RATES)) {
    if (distanceKm <= parseFloat(limit)) return fee;
  }
  return 35;
}

function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dlat = (lat2 - lat1) * Math.PI / 180;
  const dlng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dlat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dlng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function MapPicker({ position, onMove }) {
  useMapEvents({ click: e => onMove(e.latlng) });
  return position ? <Marker position={position} /> : null;
}

export default function Checkout() {
  const { items, restaurantId, clearCart } = useCart();
  const { user } = useAuth();
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
        .catch(() => {});
    }
  }, [restaurantId]);

  useEffect(() => {
    if (position && restaurant?.lat && restaurant?.lng) {
      const dist = calcDistance(
        restaurant.lat, restaurant.lng,
        position.lat, position.lng
      );
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

  const itemsTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = itemsTotal + deliveryFee + SERVICE_FEE;

  async function handleOrder() {
    if (!address) { toast.error('Please select a delivery address'); return; }
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    try {
      const res = await API.post('/orders/create/', {
        restaurant_id: restaurantId,
        delivery_address: address,
        delivery_lat: position?.lat,
        delivery_lng: position?.lng,
        payment_method: paymentMethod,
        items: items.map(i => ({
          menu_item_id: i.id,
          quantity: i.quantity,
          price: i.price,
        })),
      });
      clearCart();
      toast.success('Order placed! 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    }
    setLoading(false);
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div style={{ paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ background: '#00A651', padding: '16px' }}>
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '20px',
          padding: '6px 14px', color: '#fff', fontSize: '13px', cursor: 'pointer', marginBottom: '12px',
        }}>
          <ArrowLeft size={14} /> Back
        </button>
        <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: '800' }}>Finaliser la commande</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '2px' }}>
          {restaurant?.name}
        </p>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Map */}
        <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '2px' }}>📍 Adresse de livraison</p>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Cliquez sur la carte pour choisir votre adresse</p>
          </div>
          <div style={{ height: '200px' }}>
            <MapContainer
              center={position ? [position.lat, position.lng] : AL_HOCEIMA}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapPicker position={position} onMove={handleMapClick} />
            </MapContainer>
          </div>
          <div style={{ padding: '10px 14px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                placeholder="Votre adresse..."
                value={address}
                onChange={e => setAddress(e.target.value)}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: '10px',
                  border: '1px solid #e2e8f0', fontSize: '13px',
                }}
              />
              <button onClick={locateMe} style={{
                padding: '10px 14px', borderRadius: '10px', border: 'none',
                background: '#00A651', color: '#fff', fontWeight: '600',
                fontSize: '12px', cursor: 'pointer',
              }}>
                📍 Me localiser
              </button>
            </div>
            {distanceKm && (
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                📏 Distance: {distanceKm.toFixed(1)} km du restaurant
              </p>
            )}
          </div>
        </div>

        {/* Payment method */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>💳 Mode de paiement</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { key: 'cash', label: 'Espèces', icon: '💵', sub: 'Payez à la livraison' },
              { key: 'card', label: 'Carte', icon: '💳', sub: 'Paiement en ligne' },
            ].map(p => (
              <button
                key={p.key}
                onClick={() => setPaymentMethod(p.key)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer',
                  border: paymentMethod === p.key ? '2px solid #00A651' : '1px solid #e2e8f0',
                  background: paymentMethod === p.key ? 'rgba(0,166,81,0.06)' : '#f8fafc',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '22px', marginBottom: '4px' }}>{p.icon}</p>
                <p style={{ fontSize: '13px', fontWeight: '700', color: paymentMethod === p.key ? '#00A651' : '#374151' }}>
                  {p.label}
                </p>
                <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{p.sub}</p>
              </button>
            ))}
          </div>
          {paymentMethod === 'card' && (
            <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '10px', textAlign: 'center' }}>
              ⚠️ Paiement par carte bientôt disponible — veuillez choisir espèces
            </p>
          )}
        </div>

        {/* Order summary */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>🧾 Récapitulatif</p>

          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
              <span>{item.quantity}× {item.name}</span>
              <span style={{ fontWeight: '600' }}>{(item.price * item.quantity).toFixed(0)} MAD</span>
            </div>
          ))}

          <div style={{ borderTop: '1px dashed #e2e8f0', marginTop: '10px', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Bike size={13} /> Livraison {distanceKm ? `(${distanceKm.toFixed(1)} km)` : ''}
              </span>
              <span>{deliveryFee} MAD</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px', color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={13} /> Frais de service
              </span>
              <span>{SERVICE_FEE} MAD</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800' }}>
              <span>Total</span>
              <span style={{ color: '#00A651' }}>{total.toFixed(0)} MAD</span>
            </div>
          </div>
        </div>

        {/* Place order button */}
        <button
          onClick={handleOrder}
          disabled={loading || paymentMethod === 'card'}
          style={{
            width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
            background: loading || paymentMethod === 'card' ? '#94a3b8' : '#00A651',
            color: '#fff', fontSize: '16px', fontWeight: '800',
            cursor: loading || paymentMethod === 'card' ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 16px rgba(0,166,81,0.3)',
          }}
        >
          {loading ? 'Commande en cours...' : `Commander — ${total.toFixed(0)} MAD`}
        </button>
      </div>
    </div>
  );
}