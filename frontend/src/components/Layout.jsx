import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, ClipboardList, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { itemCount } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/orders', icon: ClipboardList, label: 'Orders' },
    { path: '/cart', icon: ShoppingBag, label: 'Cart', badge: itemCount },
    { path: '/profile', icon: User, label: user ? (user.first_name || user.username) : 'Profile' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column' }}>
      {/* Top logo bar */}
      <div style={{
        padding: '10px 16px', maxWidth: '480px', margin: '0 auto',
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)', textDecoration: 'none' }}>
          🍴 MarocMiam
        </Link>
        {!user ? (
          <Link to="/login" style={{
            fontSize: '13px', fontWeight: '700', color: '#fff',
            background: 'var(--primary)', padding: '7px 18px', borderRadius: '20px',
            textDecoration: 'none',
          }}>
            Login
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: '6px' }}>
            {user.is_staff && (
              <Link to="/admin" style={{
                fontSize: '11px', fontWeight: '700', color: '#f59e0b',
                background: '#fef9c3', padding: '5px 10px', borderRadius: '8px',
                textDecoration: 'none',
              }}>
                ⚙️ Admin
              </Link>
            )}
            <Link to="/profile" style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'var(--primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '800', fontSize: '14px', textDecoration: 'none',
            }}>
              {user.first_name ? user.first_name[0].toUpperCase() : user.username[0].toUpperCase()}
            </Link>
          </div>
        )}
      </div>

      <main style={{ flex: 1, paddingBottom: '72px', maxWidth: '480px', margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--border)', zIndex: 50,
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', padding: '8px 8px 6px' }}>
          {navItems.map(({ path, icon: Icon, label, badge }) => {
            const isActive = location.pathname === path;
            return (
              <Link key={path} to={path} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                padding: '6px 12px', borderRadius: '12px', position: 'relative',
                color: isActive ? 'var(--primary)' : 'var(--muted-fg)',
                textDecoration: 'none', transition: 'all 0.2s',
              }}>
                <div style={{ position: 'relative' }}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {badge > 0 && (
                    <span style={{
                      position: 'absolute', top: '-6px', right: '-6px',
                      background: 'var(--primary)', color: '#fff',
                      borderRadius: '50%', width: '16px', height: '16px',
                      fontSize: '9px', fontWeight: '700',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '10px', fontWeight: isActive ? '700' : '500', maxWidth: '60px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {label}
                </span>
                {isActive && (
                  <span style={{
                    position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                    height: '2px', width: '16px', borderRadius: '2px', background: 'var(--primary)',
                  }} />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}