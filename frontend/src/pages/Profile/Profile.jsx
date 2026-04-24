import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLang } from '../../context/LanguageContext';
import { ShoppingBag, Store, Bike, Shield, ChevronRight, LogOut, Settings, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { t } = useLang();
  const navigate = useNavigate();

  if (!user) return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#FAFAFA', padding: '32px 24px', fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>
      <div style={{ fontSize: '72px', marginBottom: '20px' }}>👤</div>
      <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px', color: '#111', letterSpacing: '-0.02em' }}>
        {t('not_logged_in')}
      </h2>
      <p style={{ color: '#999', marginBottom: '28px', fontSize: '14px', textAlign: 'center', lineHeight: 1.5 }}>
        {t('not_logged_in_sub')}
      </p>
      <button onClick={() => navigate('/login')} style={{
        background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
        color: '#fff', padding: '14px 36px', borderRadius: '16px',
        fontWeight: '800', fontSize: '15px', border: 'none', cursor: 'pointer',
        boxShadow: '0 6px 20px rgba(255,107,0,0.35)', fontFamily: 'inherit',
      }}>
        {t('login_register')}
      </button>
    </div>
  );

  const handleLogout = () => {
    logout();
    toast.success(t('logged_out'));
    navigate('/');
  };

  const initials = user.first_name
    ? `${user.first_name[0]}${user.last_name?.[0] || ''}`.toUpperCase()
    : user.username[0].toUpperCase();

  const displayName = user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : user.username;

  const profileRole = user.profile_role || 'customer';

  const menuItems = [
    { icon: ShoppingBag, label: t('my_orders'), sub: t('my_orders_sub'), path: '/orders', color: '#FF6B00', bg: '#FFF3E8' },
    ...(profileRole === 'restaurant_owner' ? [{ icon: Store, label: t('restaurant_dashboard'), sub: t('restaurant_dashboard_sub'), path: '/restaurant-owner', color: '#8B5CF6', bg: '#F5F3FF' }] : []),
    ...(profileRole === 'courier' ? [{ icon: Bike, label: t('courier_dashboard'), sub: t('courier_dashboard_sub'), path: '/courier-app', color: '#06B6D4', bg: '#ECFEFF' }] : []),
    ...(user.is_staff ? [{ icon: Shield, label: t('admin_panel'), sub: t('admin_panel_sub'), path: '/admin-panel', color: '#00A651', bg: 'rgba(0,166,81,0.08)' }] : []),
  ];
  return (
    <div style={{
      minHeight: '100vh', background: '#F7F7F8', paddingBottom: '90px',
      fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: '480px', margin: '0 auto',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .menu-item:active { transform: scale(0.98); }
      `}</style>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(145deg, #FF6B00 0%, #FF9A3C 100%)',
        padding: '48px 20px 32px',
        borderRadius: '0 0 36px 36px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: 20, width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', animation: 'slideUp 0.4s ease' }}>
          {/* Avatar */}
          <div style={{
            width: '70px', height: '70px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', fontWeight: '900', color: '#fff',
            border: '3px solid rgba(255,255,255,0.4)',
            flexShrink: 0, letterSpacing: '-0.02em',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          }}>
            {initials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', letterSpacing: '-0.02em', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayName}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', fontWeight: '600' }}>@{user.username}</p>
            {user.email && (
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px', marginTop: '2px' }}>{user.email}</p>
            )}
            {user.is_staff && (
              <span style={{
                marginTop: '6px', display: 'inline-block',
                background: 'rgba(255,255,255,0.2)', fontSize: '9px',
                fontWeight: '800', padding: '3px 10px', borderRadius: '20px',
                letterSpacing: '0.08em', color: '#fff',
              }}>
                ✦ ADMIN
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ padding: '16px', animation: 'slideUp 0.4s ease 0.05s both' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { label: 'Panier', value: itemCount, icon: '🛒', color: '#FF6B00' },
            { label: 'Compte', value: user.is_staff ? 'Admin' : 'Client', icon: '👤', color: '#00A651' },
          ].map((s, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: '16px', padding: '16px',
              border: '1.5px solid #F0F0F0', textAlign: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: '26px', marginBottom: '6px' }}>{s.icon}</div>
              <p style={{ fontSize: '17px', fontWeight: '900', color: s.color, letterSpacing: '-0.02em' }}>{s.value}</p>
              <p style={{ fontSize: '11px', color: '#AAA', fontWeight: '600', marginTop: '2px' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px', animation: 'slideUp 0.4s ease 0.1s both' }}>
        <p style={{ fontSize: '11px', fontWeight: '800', color: '#BBB', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px', paddingLeft: '4px' }}>
          Navigation
        </p>

        {menuItems.map(({ icon: Icon, label, sub, path, color, bg }, i) => (
          <Link key={i} to={path} className="menu-item" style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            background: '#fff', borderRadius: '16px', padding: '14px 16px',
            border: '1.5px solid #F0F0F0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            textDecoration: 'none', transition: 'all 0.15s',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '13px',
              background: bg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={20} color={color} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#111', letterSpacing: '-0.01em' }}>{label}</p>
              <p style={{ fontSize: '12px', color: '#AAA', marginTop: '1px', fontWeight: '500' }}>{sub}</p>
            </div>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ChevronRight size={14} color="#BBB" />
            </div>
          </Link>
        ))}

        {/* Logout */}
        <div style={{ marginTop: '8px' }}>
          <p style={{ fontSize: '11px', fontWeight: '800', color: '#BBB', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '4px' }}>
            Compte
          </p>
          <button onClick={handleLogout} className="menu-item" style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            background: '#fff', borderRadius: '16px', padding: '14px 16px',
            border: '1.5px solid #FEE2E2', width: '100%',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '13px',
              background: '#FEF2F2', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <LogOut size={20} color="#EF4444" />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#EF4444', letterSpacing: '-0.01em' }}>{t('logout')}</p>
              <p style={{ fontSize: '12px', color: '#AAA', marginTop: '1px', fontWeight: '500' }}>{t('logout_sub')}</p>
            </div>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ChevronRight size={14} color="#EF4444" />
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '11px', color: '#CCC', fontWeight: '500' }}>
        MarocMiam v1.0 · Made in Morocco 🇲🇦
      </p>
    </div>
  );
}
