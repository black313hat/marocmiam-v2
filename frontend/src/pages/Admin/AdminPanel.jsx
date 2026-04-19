import { useState } from 'react';
import { LayoutGrid, Store, Bike, ShoppingBag, Users, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import AdminDashboard from './pages/AdminDashboard';
import AdminRestaurants from './pages/AdminRestaurants';
import AdminCouriers from './pages/AdminCouriers';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutGrid, color: '#00A651' },
  { key: 'restaurants', label: 'Restaurants', icon: Store, color: '#3b82f6' },
  { key: 'couriers', label: 'Couriers', icon: Bike, color: '#8b5cf6' },
  { key: 'orders', label: 'Orders', icon: ShoppingBag, color: '#f59e0b' },
  { key: 'users', label: 'Users', icon: Users, color: '#ec4899' },
];

export default function AdminPanel({ user, onLogout }) {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const pages = {
    dashboard: <AdminDashboard />,
    restaurants: <AdminRestaurants />,
    couriers: <AdminCouriers />,
    orders: <AdminOrders />,
    users: <AdminUsers />,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9', fontFamily: 'Inter, sans-serif' }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '240px' : '0px',
        minHeight: '100vh', background: '#fff',
        borderRight: '1px solid #e2e8f0',
        transition: 'width 0.3s ease',
        overflow: 'hidden', flexShrink: 0,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🍴</span>
            <div>
              <p style={{ fontSize: '16px', fontWeight: '800', color: '#00A651', lineHeight: 1 }}>MarocMiam</p>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div style={{ padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: '#00A651', color: '#fff', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontWeight: '800', fontSize: '16px', marginBottom: '8px',
          }}>
            {user.username[0].toUpperCase()}
          </div>
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#09090b' }}>{user.username}</p>
          <p style={{ fontSize: '11px', color: '#94a3b8' }}>
            {user.is_superuser ? 'Super Admin' : 'Admin'}
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px' }}>
          {NAV.map(({ key, label, icon: Icon, color }) => {
            const active = page === key;
            return (
              <button
                key={key}
                onClick={() => setPage(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  width: '100%', padding: '11px 12px', borderRadius: '12px',
                  marginBottom: '4px', border: 'none', cursor: 'pointer',
                  background: active ? `${color}15` : 'transparent',
                  transition: 'all 0.15s',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '10px',
                  background: active ? color : '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={16} color={active ? '#fff' : '#64748b'} />
                </div>
                <span style={{
                  fontSize: '13px', fontWeight: active ? '700' : '500',
                  color: active ? color : '#64748b', whiteSpace: 'nowrap',
                }}>
                  {label}
                </span>
                {active && <ChevronRight size={14} color={color} style={{ marginLeft: 'auto' }} />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px' }}>
          <button
            onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: '100%', padding: '11px 12px', borderRadius: '12px',
              border: 'none', cursor: 'pointer', background: '#fee2e2',
              color: '#dc2626', fontWeight: '600', fontSize: '13px',
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <header style={{
          height: '56px', background: '#fff', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            {sidebarOpen ? <X size={20} color="#64748b" /> : <Menu size={20} color="#64748b" />}
          </button>
          <h1 style={{ fontSize: '16px', fontWeight: '700', color: '#09090b' }}>
            {NAV.find(n => n.key === page)?.label}
          </h1>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            
              href="/"
              target="_blank"
              style={{
                fontSize: '12px', fontWeight: '600', color: '#00A651',
                background: 'rgba(0,166,81,0.1)', padding: '6px 12px',
                borderRadius: '8px', textDecoration: 'none',
              }}
            >
              View App ↗
            </a>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {pages[page]}
        </main>
      </div>
    </div>
  );
}