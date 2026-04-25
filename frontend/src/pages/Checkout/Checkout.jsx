import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import {
  ArrowLeft, Banknote, CreditCard, Check,
  Tag, MapPin, Loader2, Map, Clock, CalendarClock, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import MapPicker from '../../components/MapPicker';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, restaurantId, total: cartTotal, itemCount, clearCart } = useCart();
  const { user } = useAuth();
  const { t, isRTL } = useLang();

  const [paymentMethod, setPaymentMethod]     = useState('cash');
  const [address, setAddress]                 = useState('');
  const [phone, setPhone]                     = useState('');
  const [notes, setNotes]                     = useState('');
  const [submitting, setSubmitting]           = useState(false);
  const [promoCode, setPromoCode]             = useState('');
  const [promoApplied, setPromoApplied]       = useState(null);
  const [promoError, setPromoError]           = useState('');
  const [promoLoading, setPromoLoading]       = useState(false);
  const [locating, setLocating]               = useState(false);
  const [showMap, setShowMap]                 = useState(false);
  const [showSuccess, setShowSuccess]         = useState(false);
  const [createdOrderId, setCreatedOrderId]   = useState(null);
  const [scheduledDelivery, setScheduledDelivery] = useState(false);
  const [scheduledTime, setScheduledTime]     = useState('');
  const [contactless, setContactless]         = useState(false);
  const [hasExactAmount, setHasExactAmount]   = useState(true);
  const [customerAmount, setCustomerAmount]   = useState('');
  const [deliveryLat, setDeliveryLat]         = useState(null);
  const [deliveryLng, setDeliveryLng]         = useState(null);
  const isSubmittingRef = useRef(false);

  const subtotal     = cartTotal;
  const deliveryFee  = cart[0]?.deliveryFee || 15;
  const discount     = promoApplied ? Math.round(subtotal * promoApplied.discount / 100) : 0;
  const total        = Math.max(0, subtotal + deliveryFee - discount);

  useEffect(() => {
    if (itemCount === 0 && !showSuccess) navigate('/cart');
  }, []);

  async function applyPromo() {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await API.post('/promo/apply/', { code: promoCode.trim().toUpperCase(), total: subtotal });
      setPromoApplied(res.data);
      toast.success(`Code "${res.data.code}" appliqué! -${res.data.discount_amount} MAD`);
    } catch (err) {
      setPromoError(err.response?.data?.error || 'Code invalide');
    }
    setPromoLoading(false);
  }

  function locateMe() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      setDeliveryLat(lat);
      setDeliveryLng(lng);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await res.json();
        const short = [data.address?.road, data.address?.suburb, data.address?.city || data.address?.town]
          .filter(Boolean).join(', ');
        setAddress(short || data.display_name);
      } catch { setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`); }
      setLocating(false);
    }, () => setLocating(false), { enableHighAccuracy: true });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    if (!address.trim()) { toast.error('Veuillez entrer une adresse'); return; }
    if (!phone.trim()) { toast.error('Veuillez entrer votre téléphone'); return; }

    const lastOrderTime = localStorage.getItem('last_order_time');
    if (lastOrderTime && Date.now() - parseInt(lastOrderTime) < 30000) {
      toast.error('Attendez avant de passer une autre commande');
      return;
    }

    isSubmittingRef.current = true;
    setSubmitting(true);

    try {
      let finalNotes = notes;
      if (paymentMethod === 'cash' && !hasExactAmount && customerAmount) {
        const change = (parseFloat(customerAmount) - total).toFixed(0);
        finalNotes += `\n💵 Monnaie sur ${parseFloat(customerAmount).toFixed(0)} MAD (rendre ${change} MAD)`;
      }
      if (contactless) finalNotes += '\n📦 Livraison sans contact';
      if (scheduledDelivery && scheduledTime) finalNotes += `\n⏰ Livraison programmée: ${scheduledTime}`;

      const restaurantId = restaurantId; // already from useCart
      const items = cart.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const res = await API.post('/orders/create/', {
        restaurant_id: restaurantId,
        items,
        delivery_address: address,
        delivery_lat: deliveryLat,
        delivery_lng: deliveryLng,
        payment_method: paymentMethod,
        notes: finalNotes,
        promo_code: promoApplied?.code || null,
      });

      localStorage.setItem('last_order_time', Date.now().toString());
      clearCart();
      setCreatedOrderId(res.data.id);
      setShowSuccess(true);

      // Confetti
      try {
        const confetti = (await import('canvas-confetti')).default;
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ['#FF6B00', '#FF9A3C', '#fff'] });
      } catch {}

      setTimeout(() => {
        setShowSuccess(false);
        navigate('/orders');
      }, 3000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la commande');
    }

    isSubmittingRef.current = false;
    setSubmitting(false);
  }

  // ── Success screen ──
  if (showSuccess) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#030712', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '24px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
          <Check size={40} color="#fff" strokeWidth={3} />
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ color: '#fff', fontSize: '20px', fontWeight: '800', textAlign: 'center', marginBottom: '8px' }}>
          Commande confirmée! 🎉
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: '#FF6B00', color: '#fff', fontSize: '12px', fontWeight: '800', padding: '4px 14px', borderRadius: '20px', marginBottom: '16px' }}>
          COMMANDE #{createdOrderId}
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ color: '#fff', fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>
          {total.toFixed(0)} MAD
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>
          <Clock size={16} /> ~30-45 min
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9ca3af', fontSize: '12px', textAlign: 'center', maxWidth: '280px', marginBottom: '32px' }}>
          <MapPin size={13} color="#FF6B00" style={{ flexShrink: 0 }} /> {address}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          style={{ display: 'flex', gap: '6px', width: '100%', maxWidth: '300px' }}>
          {['Reçue ✓', 'Confirmée', 'Préparation', 'En route'].map((step, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: '4px', borderRadius: '2px', background: i === 0 ? '#22c55e' : '#374151', marginBottom: '4px' }} />
              <p style={{ fontSize: '9px', color: i === 0 ? '#22c55e' : '#6b7280' }}>{step}</p>
            </div>
          ))}
        </motion.div>
        <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ color: '#6b7280', fontSize: '12px', marginTop: '24px' }}>
          Redirection vers vos commandes...
        </motion.p>
      </div>
    );
  }

  const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1.5px solid #1f2937', background: '#111827', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
  const sectionStyle = { background: '#111827', borderRadius: '20px', padding: '18px', border: '1px solid #1f2937', marginBottom: '14px' };
  const labelStyle = { fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' };

  return (
    <div style={{ background: '#030712', minHeight: '100vh', paddingBottom: '180px', fontFamily: "'Plus Jakarta Sans', sans-serif", direction: isRTL ? 'rtl' : 'ltr' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Header */}
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #1f2937' }}>
        <button onClick={() => navigate(-1)} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '50%', width: '38px', height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={18} color="#9ca3af" />
        </button>
        <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: '900', letterSpacing: '-0.02em' }}>Confirmer la commande</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '16px' }}>

        {/* Order summary */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Votre commande</label>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #1f2937' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '6px', background: '#FF6B00', color: '#fff', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.quantity}</span>
                <span style={{ fontSize: '13px', color: '#e5e7eb' }}>{item.name}</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{(item.price * item.quantity).toFixed(0)} MAD</span>
            </div>
          ))}
          <div style={{ paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            <span>Sous-total</span><span>{subtotal.toFixed(0)} MAD</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            <span>🛵 Livraison</span><span>{deliveryFee.toFixed(0)} MAD</span>
          </div>
        </div>

        {/* Delivery address */}
        <div style={sectionStyle}>
          <label style={labelStyle}>📍 Adresse de livraison</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <input placeholder="Ex: 25 Av. Hassan II, Al Hoceima..." value={address} onChange={e => setAddress(e.target.value)}
              required style={{ ...inputStyle, flex: 1 }} />
            <button type="button" onClick={locateMe} style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#FF6B00', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {locating ? <Loader2 size={16} color="#fff" style={{ animation: 'spin 1s linear infinite' }} /> : <MapPin size={16} color="#fff" />}
            </button>
            <button type="button" onClick={() => setShowMap(true)} style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#1f2937', border: '1px solid #374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Map size={16} color="#9ca3af" />
            </button>
          </div>
          <label style={labelStyle}>📞 Téléphone</label>
          <input placeholder="06XXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} required style={inputStyle} />
          <div style={{ marginTop: '10px' }}>
            <label style={labelStyle}>📝 Notes (optionnel)</label>
            <textarea placeholder="Instructions spéciales, étage, code..." value={notes} onChange={e => setNotes(e.target.value)}
              rows={2} style={{ ...inputStyle, resize: 'none' }} />
          </div>
        </div>

        {/* Scheduled delivery toggle */}
        <div style={sectionStyle}>
          <button type="button" onClick={() => setScheduledDelivery(!scheduledDelivery)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CalendarClock size={18} color={scheduledDelivery ? '#FF6B00' : '#9ca3af'} />
              <div style={{ textAlign: 'left' }}>
                <p style={{ color: '#fff', fontSize: '14px', fontWeight: '700' }}>Livraison programmée</p>
                <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '2px' }}>Choisissez l'heure de livraison</p>
              </div>
            </div>
            <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: scheduledDelivery ? '#FF6B00' : '#374151', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: scheduledDelivery ? '22px' : '2px', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
            </div>
          </button>
          <AnimatePresence>
            {scheduledDelivery && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                <div style={{ marginTop: '12px' }}>
                  <input type="datetime-local" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)}
                    min={new Date(Date.now() + 45 * 60000).toISOString().slice(0, 16)}
                    style={{ ...inputStyle }} />
                  <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>Minimum 45 minutes à l'avance</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Contactless */}
        <div style={sectionStyle}>
          <button type="button" onClick={() => { setContactless(!contactless); if (!contactless) setPaymentMethod('card'); }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ color: '#fff', fontSize: '14px', fontWeight: '700' }}>📦 Livraison sans contact</p>
              <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '2px' }}>Déposer devant la porte</p>
            </div>
            <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: contactless ? '#FF6B00' : '#374151', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: contactless ? '22px' : '2px', transition: 'left 0.2s' }} />
            </div>
          </button>
        </div>

        {/* Payment */}
        <div style={sectionStyle}>
          <label style={labelStyle}>💳 Mode de paiement</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            {[
              { key: 'cash', icon: <Banknote size={22} />, label: 'Espèces' },
              { key: 'card', icon: <CreditCard size={22} />, label: 'Carte' },
            ].map(m => {
              const active = paymentMethod === m.key;
              const disabled = m.key === 'cash' && contactless;
              return (
                <button key={m.key} type="button" onClick={() => !disabled && setPaymentMethod(m.key)} disabled={disabled}
                  style={{ padding: '14px', borderRadius: '14px', border: `2px solid ${active && !disabled ? '#FF6B00' : '#1f2937'}`, background: active && !disabled ? 'rgba(255,107,0,0.1)' : '#1f2937', cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', opacity: disabled ? 0.4 : 1 }}>
                  <span style={{ color: active && !disabled ? '#FF6B00' : '#9ca3af' }}>{m.icon}</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: active && !disabled ? '#FF6B00' : '#9ca3af' }}>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Cash change calculator */}
          {paymentMethod === 'cash' && !contactless && (
            <div style={{ background: '#1f2937', borderRadius: '12px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <p style={{ color: '#fff', fontSize: '13px', fontWeight: '700' }}>Monnaie exacte?</p>
                  <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }}>Avez-vous le montant exact?</p>
                </div>
                <button type="button" onClick={() => setHasExactAmount(!hasExactAmount)}
                  style={{ width: '44px', height: '24px', borderRadius: '12px', background: hasExactAmount ? '#FF6B00' : '#374151', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: hasExactAmount ? '22px' : '2px', transition: 'left 0.2s' }} />
                </button>
              </div>
              {!hasExactAmount && (
                <div>
                  <label style={{ ...labelStyle, marginBottom: '6px' }}>Votre billet (MAD)</label>
                  <div style={{ position: 'relative' }}>
                    <input type="number" placeholder={`${Math.ceil(total)} MAD minimum`} value={customerAmount} onChange={e => setCustomerAmount(e.target.value)}
                      style={{ ...inputStyle, paddingRight: '50px' }} />
                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '13px' }}>MAD</span>
                  </div>
                  {customerAmount && parseFloat(customerAmount) >= total && (
                    <p style={{ color: '#22c55e', fontSize: '12px', marginTop: '6px', fontWeight: '700' }}>
                      ✓ Monnaie à rendre: {(parseFloat(customerAmount) - total).toFixed(0)} MAD
                    </p>
                  )}
                  {customerAmount && parseFloat(customerAmount) < total && (
                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>
                      ⚠️ Montant insuffisant (minimum {total.toFixed(0)} MAD)
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Promo Code */}
        <div style={sectionStyle}>
          <label style={labelStyle}>🎟️ Code promo</label>
          {promoApplied ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(34,197,94,0.1)', borderRadius: '12px', padding: '12px 14px', border: '1px solid rgba(34,197,94,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={14} color="#22c55e" />
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#22c55e' }}>"{promoApplied.code}" — -{promoApplied.discount}%</span>
              </div>
              <button type="button" onClick={() => { setPromoApplied(null); setPromoCode(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={16} color="#22c55e" />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input placeholder="CODE PROMO" value={promoCode} onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyPromo())}
                style={{ ...inputStyle, flex: 1, letterSpacing: '0.08em', fontWeight: '700' }} />
              <button type="button" onClick={applyPromo} disabled={promoLoading || !promoCode.trim()}
                style={{ padding: '11px 16px', borderRadius: '12px', border: 'none', background: promoCode.trim() ? '#FF6B00' : '#1f2937', color: promoCode.trim() ? '#fff' : '#6b7280', fontWeight: '800', fontSize: '13px', cursor: promoCode.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                {promoLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Appliquer'}
              </button>
            </div>
          )}
          {promoError && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>❌ {promoError}</p>}
        </div>

        {/* Total summary */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
            <span>Sous-total</span><span>{subtotal.toFixed(0)} MAD</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
            <span>🛵 Livraison</span><span>{deliveryFee.toFixed(0)} MAD</span>
          </div>
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#22c55e', marginBottom: '8px' }}>
              <span>🎟️ Réduction</span><span>-{discount.toFixed(0)} MAD</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #1f2937' }}>
            <span style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>Total</span>
            <span style={{ fontSize: '20px', fontWeight: '900', color: '#FF6B00' }}>{total.toFixed(0)} MAD</span>
          </div>
        </div>
      </form>

      {/* Map Modal */}
      <AnimatePresence>
        {showMap && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
              style={{ background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '480px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '800' }}>📍 Choisir sur la carte</h3>
                <button onClick={() => setShowMap(false)} style={{ background: '#F5F5F5', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={16} color="#888" />
                </button>
              </div>
              <MapPicker onSelect={({ lat, lng, address: addr }) => {
                setAddress(addr);
                setDeliveryLat(lat);
                setDeliveryLng(lng);
              }} />
              <button onClick={() => setShowMap(false)} style={{ width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)', color: '#fff', fontWeight: '800', fontSize: '15px', cursor: 'pointer', marginTop: '16px', fontFamily: 'inherit' }}>
                ✓ Confirmer cette adresse
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      <div style={{ position: 'fixed', bottom: '72px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', padding: '16px', background: 'linear-gradient(to top, #030712 80%, transparent)', zIndex: 40 }}>
        <button type="submit" form="checkout-form" onClick={handleSubmit}
          disabled={submitting || !address.trim() || !phone.trim() || (scheduledDelivery && !scheduledTime) || (!hasExactAmount && customerAmount && parseFloat(customerAmount) < total)}
          style={{
            width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
            background: submitting ? '#9ca3af' : 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
            color: '#fff', fontSize: '16px', fontWeight: '800', cursor: submitting ? 'not-allowed' : 'pointer',
            boxShadow: '0 8px 32px rgba(255,107,0,0.4)', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
          {submitting ? (
            <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Commande en cours...</>
          ) : (
            `🛵 Commander · ${total.toFixed(0)} MAD`
          )}
        </button>
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
