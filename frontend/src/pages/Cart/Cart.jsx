import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useLang } from '../../context/LanguageContext';
import { Plus, Minus, Trash2, ArrowLeft } from 'lucide-react';

export default function Cart() {
  const { cart, updateQuantity, removeItem, total } = useCart();
  const navigate = useNavigate();
  const { t, isRTL } = useLang();

  if (cart.length === 0) return (
    <div style={{ textAlign: 'center', padding: '80px 16px', direction: isRTL ? 'rtl' : 'ltr' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
      <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>{t('empty_cart')}</h2>
      <p style={{ color: '#999', marginBottom: '24px' }}>{t('empty_cart_sub')}</p>
      <button onClick={() => navigate('/')} style={{
        background: '#FF6B00', color: '#fff', padding: '12px 28px',
        borderRadius: '10px', fontWeight: '600', fontSize: '15px',
        border: 'none', cursor: 'pointer',
      }}>
        {t('order_now_btn')}
      </button>
    </div>
  );

  return (
    <div style={{ padding: '16px', paddingBottom: '80px', direction: isRTL ? 'rtl' : 'ltr' }}>
      {/* Header */}
      <div style={{ background: '#FF6B00', margin: '-16px -16px 20px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <ArrowLeft size={18} color="#fff" />
          </button>
          <h1 style={{ color: '#fff', fontSize: '18px', fontWeight: '800' }}>{t('my_cart')}</h1>
        </div>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {cart.map(item => (
          <div key={item.id} style={{
            background: '#fff', borderRadius: '14px', padding: '14px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>{item.name}</h3>
              <p style={{ color: '#FF6B00', fontWeight: '800', marginTop: '4px', fontSize: '14px' }}>
                {(item.price * item.quantity).toFixed(0)} MAD
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: '#f5f5f5', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Minus size={13} color="#666" />
              </button>
              <span style={{ fontWeight: '800', minWidth: '20px', textAlign: 'center', fontSize: '15px' }}>
                {item.quantity}
              </span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: '#FF6B00', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Plus size={13} color="#fff" />
              </button>
              <button onClick={() => removeItem(item.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer', marginLeft: '4px',
              }}>
                <Trash2 size={18} color="#ef4444" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
          <span style={{ color: '#999' }}>{t('subtotal')}</span>
          <span style={{ fontWeight: '600' }}>{total.toFixed(0)} MAD</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px' }}>
          <span style={{ color: '#999' }}>{t('delivery')}</span>
          <span style={{ color: '#22c55e', fontWeight: '600' }}>{t('free_delivery')}</span>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: '18px', fontWeight: '800', marginBottom: '20px',
          paddingTop: '12px', borderTop: '1px solid #f0f0f0',
        }}>
          <span>{t('total')}</span>
          <span style={{ color: '#FF6B00' }}>{total.toFixed(0)} MAD</span>
        </div>
        <button onClick={() => navigate('/checkout')} style={{
          width: '100%', padding: '14px', borderRadius: '12px',
          background: '#FF6B00', color: '#fff', fontSize: '16px', fontWeight: '700',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(255,107,0,0.3)',
        }}>
          {t('checkout')} →
        </button>
      </div>
    </div>
  );
}