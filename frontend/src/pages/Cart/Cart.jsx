import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useLang } from '../../context/LanguageContext';
import { Plus, Minus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cart() {
  const { cart, updateQuantity, removeItem, total } = useCart();
  const navigate = useNavigate();
  const { t, isRTL } = useLang();

  if (cart.length === 0) return (
    <div style={{ textAlign: 'center', padding: '80px 16px', direction: isRTL ? 'rtl' : 'ltr' }}>
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        background: '#FFF3E8', display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 20px',
      }}>
        <ShoppingBag size={36} color='#FF6B00' />
      </div>
      <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>{t('empty_cart')}</h2>
      <p style={{ color: '#999', marginBottom: '28px', fontSize: '14px' }}>{t('empty_cart_sub')}</p>
      <button onClick={() => navigate('/')} style={{
        background: '#FF6B00', color: '#fff', padding: '14px 32px',
        borderRadius: '25px', fontWeight: '700', fontSize: '15px',
        cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,107,0,0.3)',
      }}>
        {t('order_now_btn')}
      </button>
    </div>
  );

  return (
    <div style={{ background: '#f8f8f8', minHeight: '100vh', paddingBottom: '100px', direction: isRTL ? 'rtl' : 'ltr' }}>

      {/* Header */}
      <div style={{ background: '#fff', padding: '16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate(-1)} style={{
          width: '38px', height: '38px', borderRadius: '50%',
          background: '#f5f5f5', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ArrowLeft size={18} color='#1a1a1a' />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: '800', flex: 1 }}>{t('my_cart')}</h1>
        <span style={{ fontSize: '13px', color: '#999' }}>{cart.length} items</span>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Items */}
        <AnimatePresence>
          {cart.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{
                background: '#fff', borderRadius: '16px', padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}
            >
              {/* Item image placeholder */}
              <div style={{
                width: '60px', height: '60px', borderRadius: '12px',
                background: '#FFF3E8', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0, fontSize: '28px',
              }}>
                🍽️
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>{item.name}</h3>
                <p style={{ fontSize: '15px', fontWeight: '900', color: '#FF6B00' }}>
                  {(item.price * item.quantity).toFixed(0)} MAD
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  style={{
                    width: '30px', height: '30px', borderRadius: '50%',
                    background: '#f5f5f5', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Minus size={13} color='#666' />
                </button>
                <span style={{ fontWeight: '800', minWidth: '20px', textAlign: 'center', fontSize: '15px' }}>
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  style={{
                    width: '30px', height: '30px', borderRadius: '50%',
                    background: '#FF6B00', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Plus size={13} color='#fff' />
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '4px', padding: '4px' }}
                >
                  <Trash2 size={16} color='#ef4444' />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Promo code */}
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '14px 16px',
          display: 'flex', gap: '10px', alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <input
            placeholder='Promo code'
            style={{
              flex: 1, fontSize: '14px', color: '#1a1a1a',
              background: '#f5f5f5', borderRadius: '10px', padding: '10px 14px',
            }}
          />
          <button style={{
            background: '#FF6B00', color: '#fff', padding: '10px 18px',
            borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer',
          }}>
            Apply
          </button>
        </div>

        {/* Order summary */}
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '16px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px' }}>Order Summary</h3>
          {[
            { label: t('subtotal'), value: `${total.toFixed(0)} MAD` },
            { label: t('delivery'), value: '15 MAD', color: '#1a1a1a' },
            { label: t('service_fee'), value: '5 MAD', color: '#1a1a1a' },
          ].map((row, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              marginBottom: '10px', fontSize: '14px',
            }}>
              <span style={{ color: '#999' }}>{row.label}</span>
              <span style={{ fontWeight: '600', color: row.color || '#1a1a1a' }}>{row.value}</span>
            </div>
          ))}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            paddingTop: '12px', borderTop: '1px solid #f0f0f0',
            fontSize: '18px', fontWeight: '900',
          }}>
            <span>{t('total')}</span>
            <span style={{ color: '#FF6B00' }}>{(total + 20).toFixed(0)} MAD</span>
          </div>
        </div>
      </div>

      {/* Checkout button */}
      <div style={{
        position: 'fixed', bottom: '72px',
        left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)', maxWidth: '448px', zIndex: 50,
      }}>
        <button
          onClick={() => navigate('/checkout')}
          style={{
            width: '100%', background: '#FF6B00', color: '#fff',
            padding: '16px', borderRadius: '16px', fontSize: '16px',
            fontWeight: '800', cursor: 'pointer', border: 'none',
            boxShadow: '0 8px 32px rgba(255,107,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <span style={{
            background: 'rgba(0,0,0,0.2)', borderRadius: '8px',
            padding: '4px 10px', fontSize: '14px',
          }}>
            {cart.length} items
          </span>
          <span>{t('checkout')}</span>
          <span>{(total + 20).toFixed(0)} MAD</span>
        </button>
      </div>
    </div>
  );
}