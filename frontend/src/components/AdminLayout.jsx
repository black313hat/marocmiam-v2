import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, Building2, Bike, ShoppingBag, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { path: '/admin/restaurants', label: 'Restaurants', icon: Building2 },
  { path: '/admin/couriers', label: 'Couriers', icon: Bike },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column' }}>
      {/* Top nav */}
      <nav style={{
        background: 'var(--card)', borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: 'var(--shadow)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/" style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>
            🍴 MarocMiam
          </Link>
          <span style={{
            fontSize: '10px', fontWeight: '700', padding: '2px 8px',
            borderRadius: '20px', background: 'var(--primary-light)', color: 'var(--primary)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            Admin
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--muted-fg)', fontWeight: '500' }}>{user?.username}</span>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', color: 'var(--muted-fg)', background: 'none',
          }}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{
          width: '220px', background: 'var(--card)', borderRight: '1px solid var(--border)',
          minHeight: 'calc(100vh - 56px)', padding: '16px 12px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link key={path} to={path} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: '500',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--muted-fg)',
                  transition: 'all 0.15s',
                }}>
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  {label}
                  {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
                </Link>
              );
            })}
          </div>

          <div style={{
            marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border)', marginLeft: '-12px',
            marginRight: '-12px', padding: '16px 12px 0',
          }}>
            <Link to="/" style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px', fontSize: '13px',
              fontWeight: '500', color: 'var(--muted-fg)',
            }}>
              ← Back to App
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto', maxHeight: 'calc(100vh - 56px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}