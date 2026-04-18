import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, User, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <nav style={{
      background: '#fff',
      padding: '0 24px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/" style={{ fontSize: '22px', fontWeight: '800', color: 'var(--teal)' }}>
        🍴 MarocMiam
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user ? (
          <>
            <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-light)' }}>
              <User size={18} /> {user.username}
            </Link>
            <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <ShoppingBag size={24} color="var(--teal)" />
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-8px', right: '-8px',
                  background: 'var(--orange)', color: '#fff',
                  borderRadius: '50%', width: '18px', height: '18px',
                  fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {itemCount}
                </span>
              )}
            </Link>
            <button onClick={handleLogout} style={{ background: 'none', color: 'var(--text-light)' }}>
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              padding: '8px 20px', borderRadius: '8px',
              background: 'var(--teal)', color: '#fff', fontWeight: '600',
            }}>
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}