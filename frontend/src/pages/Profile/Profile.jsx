import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLang } from '../../context/LanguageContext';
import { User, LogOut, ShoppingBag, Store, Bike, Shield, ChevronRight, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { t } = useLang();
  const navigate = useNavigate();

  if (!user) return (
    <div style={{ padding: '40px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>👤</div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>{t('not_logged_in')}</h2>
      <p style={{ color: 'var(--muted-fg)', marginBottom: '24px', fontSize: '14px' }}>
        {t('not_logged_in_sub')}
      </p>
      <button onClick={() => navigate('/login')} style={{
        background: 'var(--primary)', color: '#fff', padding: '12px 32px',
        borderRadius: '12px', fontWeight: '700', fontSize: '15px',
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

  const menuItems = [
    { icon: ShoppingBag, label: t('my_orders'), sub: t('my_orders_sub'), path: '/orders', color: '#3b82f6' },
    { icon: Store, label: t('restaurant_dashboard'), sub: t('restaurant_dashboard_sub'), path: '/restaurant-owner', color: '#8b5cf6' },
    { icon: Bike, label: t('courier_dashboard'), sub: t('courier_dashboard_sub'), path: '/courier-app', color: '#06b6d4' },
    ...(user.is_staff ? [{ icon: Shield, label: t('admin_panel'), sub: t('admin_panel_sub'), path: '/admin-panel', color: '#f59e0b' }] : []),
  ];

  return (
    <div style={{ padding: '0 0 32px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
        padding: '32px 20px 28px', color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '28px',
            border: '3px solid rgba(255,255,255,0.4)',
          }}>
            {user.first_name ? user.first_name[0].toUpperCase() : user.username[0].toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800' }}>
              {user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.username}
            </h2>
            <p style={{ opacity: 0.85, fontSize: '13px', marginTop: '2px' }}>@{user.username}</p>
            {user.email && <p style={{ opacity: 0.75, fontSize: '12px', marginTop: '1px' }}>{user.email}</p>}
            {user.is_staff && (
              <span style={{
                marginTop: '6px', display: 'inline-block',
                background: 'rgba(255,255,255,0.25)', fontSize: '10px',
                fontWeight: '700', padding: '2px 10px', borderRadius: '20px',
                letterSpacing: '0.05em',
              }}>
                ADMIN
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '12px', padding: '16px',
      }}>
        {[
          { label: t('cart_items'), value: itemCount, icon: '🛒' },
          { label: t('account'), value: user.is_staff ? t('admin') : t('customer'), icon: '👤' },
        ].map((s, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: '14px', padding: '16px',
            border: '1px solid var(--border)', textAlign: 'center',
            boxShadow: 'var(--shadow)',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '4px' }}>{s.icon}</div>
            <p style={{ fontSize: '18px', fontWeight: '800' }}>{s.value}</p>
            <p style={{ fontSize: '12px', color: 'var(--muted-fg)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.map(({ icon: Icon, label, sub, path, color }, i) => (
          <Link key={i} to={path} style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            background: '#fff', borderRadius: '14px', padding: '14px 16px',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
            textDecoration: 'none',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: `${color}15`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={18} color={color} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--foreground)' }}>{label}</p>
              <p style={{ fontSize: '12px', color: 'var(--muted-fg)', marginTop: '1px' }}>{sub}</p>
            </div>
            <ChevronRight size={16} color="var(--muted-fg)" />
          </Link>
        ))}

        {/* Logout */}
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          background: '#fff', borderRadius: '14px', padding: '14px 16px',
          border: '1px solid #fee2e2', width: '100%', marginTop: '8px',
          boxShadow: 'var(--shadow)',
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: '#fee2e2', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <LogOut size={18} color="#dc2626" />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#dc2626' }}>{t('logout')}</p>
            <p style={{ fontSize: '12px', color: 'var(--muted-fg)', marginTop: '1px' }}>{t('logout_sub')}</p>
          </div>
          <ChevronRight size={16} color="#dc2626" />
        </button>
      </div>

      {/* Version */}
      <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '11px', color: 'var(--muted-fg)' }}>
        MarocMiam v1.0 · Made in Morocco 🇲🇦
      </p>
    </div>
  );
}
