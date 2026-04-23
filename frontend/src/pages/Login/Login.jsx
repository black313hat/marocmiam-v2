import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, ArrowLeft, User, Lock, Mail, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', first_name: '', last_name: '' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.username || !form.password) { toast.error('Please fill all fields'); return; }
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

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: '#FAFAFA', fontFamily: "'Plus Jakarta Sans', sans-serif",
      maxWidth: '480px', margin: '0 auto',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .input-field:focus { border-color: #FF6B00 !important; outline: none; background: #fff !important; }
        .submit-btn:active { transform: scale(0.98); }
        .tab-btn { transition: all 0.2s; }
      `}</style>

      {/* Top illustration area */}
      <div style={{
        background: 'linear-gradient(145deg, #FF6B00 0%, #FF9A3C 100%)',
        padding: '48px 24px 40px',
        borderRadius: '0 0 40px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
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
            {isRegister ? 'Rejoignez MarocMiam aujourd\'hui' : 'Commandez vos plats préférés'}
          </p>
        </div>
      </div>

      {/* Form area */}
      <div style={{ flex: 1, padding: '28px 20px 32px', animation: 'fadeIn 0.4s ease 0.1s both' }}>

        {/* Toggle tabs */}
        <div style={{
          display: 'flex', background: '#F0F0F0', borderRadius: '14px',
          padding: '4px', marginBottom: '28px',
        }}>
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

        {/* Register fields */}
        {isRegister && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '0' }}>
            <Field icon={<User size={16} color="#999" />} placeholder="Prénom" value={form.first_name} onChange={v => update('first_name', v)} />
            <Field icon={<User size={16} color="#999" />} placeholder="Nom" value={form.last_name} onChange={v => update('last_name', v)} />
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
          <input
            className="input-field"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mot de passe"
            value={form.password}
            onChange={e => update('password', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{
              width: '100%', padding: '14px 48px 14px 40px', borderRadius: '14px',
              border: '1.5px solid #E8E8E8', fontSize: '14px', fontWeight: '500',
              background: '#F8F8F8', boxSizing: 'border-box', fontFamily: 'inherit',
            }}
          />
          <button onClick={() => setShowPassword(!showPassword)} style={{
            position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
          }}>
            {showPassword ? <EyeOff size={18} color="#999" /> : <Eye size={18} color="#999" />}
          </button>
        </div>

        {/* Submit */}
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '15px', borderRadius: '16px',
            background: loading ? '#FFB380' : 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
            color: '#fff', fontSize: '15px', fontWeight: '800',
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 6px 20px rgba(255,107,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontFamily: 'inherit', letterSpacing: '-0.01em',
          }}
        >
          {loading ? (
            <span>Chargement...</span>
          ) : (
            <>
              {isRegister ? 'Créer mon compte' : 'Se connecter'}
              <ChevronRight size={18} />
            </>
          )}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#EBEBEB' }} />
          <span style={{ fontSize: '12px', color: '#BBB', fontWeight: '600' }}>OU</span>
          <div style={{ flex: 1, height: '1px', background: '#EBEBEB' }} />
        </div>

        {/* Switch mode */}
        <p style={{ textAlign: 'center', fontSize: '14px', color: '#888' }}>
          {isRegister ? 'Déjà un compte ?' : 'Pas encore de compte ?'}
          <button onClick={() => setIsRegister(!isRegister)} style={{
            background: 'none', border: 'none', color: '#FF6B00', fontWeight: '800',
            marginLeft: '6px', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit',
          }}>
            {isRegister ? 'Se connecter' : "S'inscrire"}
          </button>
        </p>

        {/* Footer */}
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
      <input
        className="input-field"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '14px 14px 14px 40px', borderRadius: '14px',
          border: '1.5px solid #E8E8E8', fontSize: '14px', fontWeight: '500',
          background: '#F8F8F8', boxSizing: 'border-box',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      />
    </div>
  );
}
