import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User, Grid, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

export default function Layout() {
  const { itemCount } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  const { lang, changeLang, t } = useLang();

  const navItems = [
    { path: '/',            icon: Home,       label: t('home') },
    { path: '/restaurants', icon: Grid,       label: t('order') },
    { path: '/search',      icon: Search,     label: 'Search' },
    { path: '/cart',        icon: ShoppingBag, label: t('cart'), badge: itemCount },
    { path: '/profile',     icon: User,       label: t('profile') },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8', display: 'flex', flexDirection: 'column', maxWidth: '480px', margin: '0 auto' }}>

      {/* Top bar */}
      <div style={{
        padding: '12px 16px',
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 40,
        borderBottom: '1px solid #f0f0f0',
      }}>
        <Link to="/" style={{ fontSize: '22px', fontWeight: '900', color: '#1a1a1a', letterSpacing: '-0.5px' }}>
          MarocMiam
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Language switcher */}
          <div style={{ display: 'flex', gap: '2px', background: '#f5f5f5', borderRadius: '20px', padding: '3px' }}>
            {['fr', 'ar', 'en'].map(l => (
              <button key={l} onClick={() => changeLang(l)} style={{
                padding: '4px 10px', borderRadius: '16px', fontSize: '11px',
                fontWeight: '700', cursor: 'pointer', border: 'none',
                background: lang === l ? '#FF6B00' : 'transparent',
                color: lang === l ? '#fff' : '#999',
              }}>
                {l === 'fr' ? 'FR' : l === 'ar' ? 'ع' : 'EN'}
              </button>
            ))}
          </div>

          {!user ? (
            <Link to="/login" style={{
              fontSize: '13px', fontWeight: '700', color: '#fff',
              background: '#FF6B00', padding: '7px 18px', borderRadius: '20px',
              textDecoration: 'none',
            }}>
              {t('login')}
            </Link>
          ) : (
            <Link to="/profile" style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: '#FF6B00', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '800', fontSize: '14px', textDecoration: 'none',
            }}>
              {(user.first_name || user.username)[0].toUpperCase()}
            </Link>
          )}
        </div>
      </div>

      {/* Main */}
      <main style={{ flex: 1, paddingBottom: '80px' }}>
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
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '4px 12px',
              textDecoration: 'none',
            }}>
              <div style={{ position: 'relative' }}>
                <Icon size={22} color={active ? '#FF6B00' : '#ccc'} strokeWidth={active ? 2.5 : 1.8} />
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
              <span style={{ fontSize: '10px', fontWeight: active ? '700' : '400', color: active ? '#FF6B00' : '#ccc' }}>
                {label}
              </span>
              {active && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FF6B00' }} />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
