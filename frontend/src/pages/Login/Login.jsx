import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, ArrowLeft, User, Lock, Mail, ChevronRight } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function Login() {
  const [isRegister, setIsRegister]       = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const [form, setForm]                   = useState({ username: '', email: '', password: '', first_name: '', last_name: '' });
  const [loading, setLoading]             = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, register } = useAuth();

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.username || !form.password) { toast.error('Veuillez remplir tous les champs'); return; }
    setLoading(true);
    try {
      if (isRegister) {
        await register(form);
        toast.success('Compte créé! Bienvenue 🎉');
      } else {
        await login({ username: form.username, password: form.password });
        toast.success('Bon retour! 👋');
      }
      window.location.href = '/';
    } catch (err) {
      toast.error(err.response?.data?.error || 'Une erreur est survenue');
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setGoogleLoading(true);
    try {
      // Get user info from Google
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const userInfo = await userInfoRes.json();

      // Send to Django backend
      const res = await API.post('/auth/google/', {
        email:      userInfo.email,
        first_name: userInfo.given_name  || '',
        last_name:  userInfo.family_name || '',
        google_id:  userInfo.sub,
        picture:    userInfo.picture     || '',
      });

      // Store JWT tokens
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      API.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;

      toast.success(
        res.data.created
          ? `Bienvenue ${res.data.user.first_name || res.data.user.username}! 🎉`
          : `Bon retour ${res.data.user.first_name || res.data.user.username}! 👋`
      );

      // Full reload to update AuthContext state
      window.location.href = '/';
    } catch (err) {
      console.error('Google login error:', err);
      toast.error('Connexion Google échouée. Réessayez.');
    }
    setGoogleLoading(false);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Connexion Google échouée'),
  });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: '#FAFAFA', fontFamily: "'Plus Jakarta Sans', sans-serif",
      maxWidth: '480px', margin: '0 auto',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes spin    { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        .input-field:focus { border-color: #FF6B00 !important; outline: none; background: #fff !important; }
        .submit-btn:active { transform: scale(0.98); }
        .tab-btn           { transition: all 0.2s; }
        .google-btn:hover  { box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important; transform: translateY(-1px); }
        .google-btn:active { transform: scale(0.98); }
      `}</style>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(145deg, #FF6B00 0%, #FF9A3C 100%)',
        padding: '48px 24px 40px', borderRadius: '0 0 40px 40px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: '600', textDecoration: 'none', marginBottom: '24px' }}>
          <ArrowLeft size={16} /> Accueil
        </Link>

        <div style={{ animation: 'slideUp 0.5s ease' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍽️</div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', marginBottom: '6px' }}>
            {isRegister ? 'Créer un compte' : 'Bon retour !'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '500' }}>
            {isRegister ? "Rejoignez MarocMiam aujourd'hui" : 'Commandez vos plats préférés'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, padding: '28px 20px 32px', animation: 'fadeIn 0.4s ease 0.1s both' }}>

        {/* Google Button */}
        <button className="google-btn" onClick={() => googleLogin()} disabled={googleLoading} style={{
          width: '100%', padding: '13px 20px', borderRadius: '14px',
          border: '1.5px solid #E8E8E8', background: googleLoading ? '#F5F5F5' : '#fff',
          cursor: googleLoading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          fontSize: '14px', fontWeight: '700', color: '#333',
          fontFamily: 'inherit', transition: 'all 0.2s',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '20px',
        }}>
          {googleLoading ? (
            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {googleLoading ? 'Connexion...' : 'Continuer avec Google'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', background: '#EBEBEB' }} />
          <span style={{ fontSize: '12px', color: '#BBB', fontWeight: '700', letterSpacing: '0.05em' }}>OU</span>
          <div style={{ flex: 1, height: '1px', background: '#EBEBEB' }} />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#F0F0F0', borderRadius: '14px', padding: '4px', marginBottom: '24px' }}>
          {[{ k: false, l: 'Connexion' }, { k: true, l: 'Inscription' }].map(({ k, l }) => (
            <button key={String(k)} className="tab-btn" onClick={() => setIsRegister(k)} style={{
              flex: 1, padding: '11px', borderRadius: '11px', fontSize: '14px', fontWeight: '700',
              border: 'none', cursor: 'pointer',
              background: isRegister === k ? '#fff' : 'transparent',
              color: isRegister === k ? '#FF6B00' : '#888',
              boxShadow: isRegister === k ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              fontFamily: 'inherit',
            }}>{l}</button>
          ))}
        </div>

        {/* Register extra fields */}
        {isRegister && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Field icon={<User size={16} color="#999" />} placeholder="Prénom"   value={form.first_name} onChange={v => update('first_name', v)} />
            <Field icon={<User size={16} color="#999" />} placeholder="Nom"      value={form.last_name}  onChange={v => update('last_name', v)} />
          </div>
        )}

        <Field icon={<User size={16} color="#999" />} placeholder="Nom d'utilisateur" value={form.username} onChange={v => update('username', v)} />

        {isRegister && (
          <Field icon={<Mail size={16} color="#999" />} placeholder="Email" type="email" value={form.email} onChange={v => update('email', v)} />
        )}

        {/* Password */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
            <Lock size={16} color="#999" />
          </div>
          <input className="input-field" type={showPassword ? 'text' : 'password'}
            placeholder="Mot de passe" value={form.password}
            onChange={e => update('password', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{ width: '100%', padding: '14px 48px 14px 40px', borderRadius: '14px', border: '1.5px solid #E8E8E8', fontSize: '14px', fontWeight: '500', background: '#F8F8F8', boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
          <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            {showPassword ? <EyeOff size={18} color="#999" /> : <Eye size={18} color="#999" />}
          </button>
        </div>

        {/* Submit */}
        <button className="submit-btn" onClick={handleSubmit} disabled={loading} style={{
          width: '100%', padding: '15px', borderRadius: '16px',
          background: loading ? '#FFB380' : 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
          color: '#fff', fontSize: '15px', fontWeight: '800',
          border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: loading ? 'none' : '0 6px 20px rgba(255,107,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          fontFamily: 'inherit', letterSpacing: '-0.01em',
        }}>
          {loading ? 'Chargement...' : (
            <>{isRegister ? 'Créer mon compte' : 'Se connecter'}<ChevronRight size={18} /></>
          )}
        </button>

        {/* Switch */}
        <p style={{ textAlign: 'center', fontSize: '14px', color: '#888', marginTop: '20px' }}>
          {isRegister ? 'Déjà un compte ?' : 'Pas encore de compte ?'}
          <button onClick={() => setIsRegister(!isRegister)} style={{ background: 'none', border: 'none', color: '#FF6B00', fontWeight: '800', marginLeft: '6px', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}>
            {isRegister ? 'Se connecter' : "S'inscrire"}
          </button>
        </p>

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '11px', color: '#CCC', fontWeight: '500' }}>
          MarocMiam · Livraison partout au Maroc 🇲🇦
        </p>
      </div>
    </div>
  );
}

function Field({ icon, placeholder, value, onChange, type = 'text' }) {
  return (
    <div style={{ position: 'relative', marginBottom: '12px', flex: 1 }}>
      <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
        {icon}
      </div>
      <input className="input-field" type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: '14px', border: '1.5px solid #E8E8E8', fontSize: '14px', fontWeight: '500', background: '#F8F8F8', boxSizing: 'border-box', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      />
    </div>
  );
}
