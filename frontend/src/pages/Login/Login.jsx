import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: '', email: '', password: '',
    first_name: '', last_name: ''
  });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      toast.error('Please fill all fields'); return;
    }
    setLoading(true);
    try {
      if (isRegister) {
        await register(form);
        toast.success('Account created! Welcome 🎉');
      } else {
        await login({ username: form.username, password: form.password });
        toast.success('Welcome back! 👋');
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '13px 16px', borderRadius: '12px',
    border: '1.5px solid var(--border)', fontSize: '15px',
    background: 'var(--muted)', marginBottom: '12px',
    transition: 'border 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
      padding: '24px',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🍴</div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary)' }}>MarocMiam</h1>
        <p style={{ color: 'var(--muted-fg)', fontSize: '14px', marginTop: '4px' }}>
          Food delivery across Morocco
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: '#fff', padding: '32px 28px', borderRadius: '20px',
        width: '100%', maxWidth: '400px', boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px' }}>
          {isRegister ? 'Create account' : 'Welcome back'}
        </h2>
        <p style={{ color: 'var(--muted-fg)', fontSize: '14px', marginBottom: '24px' }}>
          {isRegister ? 'Sign up to start ordering' : 'Login to your account'}
        </p>

        {isRegister && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <input style={{ ...inputStyle, flex: 1 }} placeholder="First name"
              value={form.first_name} onChange={e => update('first_name', e.target.value)} />
            <input style={{ ...inputStyle, flex: 1 }} placeholder="Last name"
              value={form.last_name} onChange={e => update('last_name', e.target.value)} />
          </div>
        )}

        <input style={inputStyle} placeholder="Username"
          value={form.username} onChange={e => update('username', e.target.value)} />

        {isRegister && (
          <input style={inputStyle} placeholder="Email address" type="email"
            value={form.email} onChange={e => update('email', e.target.value)} />
        )}

        {/* Password with show/hide */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <input
            style={{ ...inputStyle, marginBottom: 0, paddingRight: '48px' }}
            placeholder="Password" type={showPassword ? 'text' : 'password'}
            value={form.password} onChange={e => update('password', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          <button onClick={() => setShowPassword(!showPassword)} style={{
            position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', color: 'var(--muted-fg)',
          }}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', padding: '14px', borderRadius: '12px',
          background: loading ? 'var(--muted)' : 'var(--primary)',
          color: loading ? 'var(--muted-fg)' : '#fff',
          fontSize: '16px', fontWeight: '700', marginTop: '8px',
          boxShadow: loading ? 'none' : '0 4px 16px rgba(0,166,81,0.3)',
          transition: 'all 0.2s',
        }}>
          {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Login'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--muted-fg)' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => setIsRegister(!isRegister)} style={{
            background: 'none', color: 'var(--primary)', fontWeight: '700', marginLeft: '6px',
          }}>
            {isRegister ? 'Login' : 'Sign up'}
          </button>
        </p>
      </div>

      <Link to="/" style={{ marginTop: '20px', color: 'var(--muted-fg)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <ArrowLeft size={16} /> Back to home
      </Link>
    </div>
  );
}