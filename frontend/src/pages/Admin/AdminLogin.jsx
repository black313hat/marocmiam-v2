import { useState } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleLogin() {
    if (!form.username || !form.password) { toast.error('Fill all fields'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Invalid credentials');
        setLoading(false);
        return;
      }

      const user = data.user;
      if (!user.is_staff && !user.is_superuser) {
        toast.error('Access denied — Admin only');
        setLoading(false);
        return;
      }

      localStorage.setItem('admin_token', data.access);
      localStorage.setItem('admin_user', JSON.stringify(user));
      toast.success('Welcome Admin 👋');
      onLogin(user);
    } catch {
      toast.error('Connection error');
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #00A651 0%, #007a3d 100%)',
      padding: '24px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '24px', padding: '40px 32px',
        width: '100%', maxWidth: '400px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🍴</div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#00A651' }}>MarocMiam</h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Admin Dashboard</p>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ position: 'relative' }}>
            <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              placeholder="Username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              style={{
                width: '100%', padding: '13px 14px 13px 42px',
                borderRadius: '12px', border: '1.5px solid #e2e8f0',
                fontSize: '14px', background: '#f8fafc',
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              placeholder="Password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{
                width: '100%', padding: '13px 42px 13px 42px',
                borderRadius: '12px', border: '1.5px solid #e2e8f0',
                fontSize: '14px', background: '#f8fafc',
              }}
            />
            <button
              onClick={() => setShowPass(!showPass)}
              style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {showPass ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
            </button>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              padding: '14px', borderRadius: '12px', border: 'none',
              background: loading ? '#94a3b8' : '#00A651', color: '#fff',
              fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(0,166,81,0.3)',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
