import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Plus, Minus, Trash2, ArrowLeft } from 'lucide-react';

export default function Cart() {
  const { cart, updateQuantity, removeItem, total, clearCart } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) return (
    <div style={{ textAlign: 'center', padding: '80px 16px' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
      <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>Your cart is empty</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>Add some items to get started</p>
      <button onClick={() => navigate('/')} style={{
        background: 'var(--teal)', color: '#fff', padding: '12px 28px',
        borderRadius: '10px', fontWeight: '600', fontSize: '15px',
      }}>
        Browse Restaurants
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px' }}>
      <button onClick={() => navigate(-1)} style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: 'none', color: 'var(--text-light)', marginBottom: '20px',
      }}>
        <ArrowLeft size={18} /> Back
      </button>

      <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '24px' }}>Your Cart</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {cart.map(item => (
          <div key={item.id} style={{
            background: '#fff', borderRadius: '12px', padding: '16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: 'var(--shadow)',
          }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{item.name}</h3>
              <p style={{ color: 'var(--teal)', fontWeight: '700', marginTop: '4px' }}>
                {(item.price * item.quantity).toFixed(2)} MAD
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{
                width: '30px', height: '30px', borderRadius: '50%', background: 'var(--gray)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Minus size={13} />
              </button>
              <span style={{ fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{
                width: '30px', height: '30px', borderRadius: '50%', background: 'var(--teal)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Plus size={13} color="#fff" />
              </button>
              <button onClick={() => removeItem(item.id)} style={{ background: 'none', color: '#ef4444', marginLeft: '4px' }}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: 'var(--text-light)' }}>Subtotal</span>
          <span>{total.toFixed(2)} MAD</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ color: 'var(--text-light)' }}>Delivery</span>
          <span style={{ color: 'green' }}>Free</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>
          <span>Total</span>
          <span style={{ color: 'var(--teal)' }}>{total.toFixed(2)} MAD</span>
        </div>
        <button onClick={() => navigate('/checkout')} style={{
          width: '100%', padding: '14px', borderRadius: '10px',
          background: 'var(--teal)', color: '#fff', fontSize: '16px', fontWeight: '700',
        }}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}