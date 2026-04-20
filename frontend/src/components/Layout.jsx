import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

export default function Layout() {
  const { itemCount } = useCart();
  const { user } = useAuth();
  const location = useLocation();

  const { lang, changeLang, t, isRTL } = useLang();

  const navItems = [
    { path: '/', icon: Home, label: t('home') },
    { path: '/restaurants', icon: Search, label: t('order') },
    { path: '/cart', icon: ShoppingBag, label: t('cart'), badge: itemCount },
    { path: '/profile', icon: User, label: t('profile') },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{
        padding: '10px 16px', background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 40,
        maxWidth: '480px', margin: '0 auto', width: '100%',
      }}>
        <Link to="/" style={{ fontSize: '20px', fontWeight: '900', color: '#FF6B00', letterSpacing: '-0.5px' }}>
          MarocMiam 🍴
        </Link>
        {/* Language switcher */}
        <div style={{ display: 'flex', gap: '2px', background: '#f5f5f5', borderRadius: '20px', padding: '3px' }}>
          {['fr', 'ar', 'en'].map(l => (
            <button
              key={l}
              onClick={() => changeLang(l)}
              style={{
                padding: '4px 10px', borderRadius: '16px', fontSize: '11px',
                fontWeight: '700', cursor: 'pointer', border: 'none',
                background: lang === l ? '#FF6B00' : 'transparent',
                color: lang === l ? '#fff' : '#999',
                transition: 'all 0.2s',
              }}
            >
              {l === 'fr' ? 'FR' : l === 'ar' ? 'ع' : 'EN'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {user?.is_staff && (
            <Link to="/admin-panel" style={{
              fontSize: '11px', fontWeight: '700', color: '#FF6B00',
              background: '#FFF3E8', padding: '5px 10px',
              borderRadius: '8px',
              border: '1px solid #FFE0C0',
            }}>
              ⚙️ Admin
            </Link>
          )}
          {!user ? (
            <Link to="/login" style={{
              fontSize: '13px', fontWeight: '700', color: '#fff',
              background: '#FF6B00', padding: '7px 18px',
              borderRadius: '20px',
            }}>
              Login
            </Link>
          ) : (
            <Link to="/profile" style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: '#FF6B00', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '800', fontSize: '14px',
            }}>
              {user.first_name ? user.first_name[0].toUpperCase() : user.username[0].toUpperCase()}
            </Link>
          )}
        </div>
      </div>

      {/* Main */}
      <main style={{ flex: 1, paddingBottom: '80px', maxWidth: '480px', margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '480px',
        background: '#fff', borderTop: '1px solid #f0f0f0',
        display: 'flex', justifyContent: 'space-around',
        padding: '8px 0 20px', zIndex: 50,
      }}>
        {navItems.map(({ path, icon: Icon, label, badge }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '3px', padding: '4px 16px',
            }}>
              <div style={{ position: 'relative' }}>
                <Icon size={22} color={active ? '#FF6B00' : '#bbb'} strokeWidth={active ? 2.5 : 1.8} />
                {badge > 0 && (
                  <span style={{
                    position: 'absolute', top: '-6px', right: '-8px',
                    background: '#FF6B00', color: '#fff',
                    borderRadius: '10px', fontSize: '9px', fontWeight: '800',
                    padding: '1px 5px', minWidth: '16px', textAlign: 'center',
                  }}>
                    {badge}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '10px', fontWeight: active ? '700' : '400', color: active ? '#FF6B00' : '#bbb' }}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}