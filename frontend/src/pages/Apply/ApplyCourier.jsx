import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CITIES = ['Al Hoceima', 'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Oujda', 'Tétouan', 'Nador'];
const VEHICLES = [
  { key: 'moto', label: 'Moto', icon: '🛵' },
  { key: 'bike', label: 'Vélo',  icon: '🚲' },
  { key: 'car',  label: 'Voiture', icon: '🚗' },
];

const BENEFITS = [
  { icon: '⏰', title: 'Horaires flexibles', sub: 'Vous choisissez quand livrer' },
  { icon: '💰', title: 'Paiement hebdo',     sub: 'Chaque semaine par virement' },
  { icon: '🎒', title: 'Équipement fourni',  sub: 'Sac thermique offert' },
  { icon: '📞', title: 'Support 24/7',       sub: 'Équipe toujours disponible' },
];

export default function ApplyCourier() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ phone: '', city: 'Al Hoceima', vehicle: 'moto', id_card: '' });

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit() {
    if (!form.phone || !form.id_card) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    try {
      await API.post('/apply/courier/', form);
      setSubmitted(true);
    } catch {
      toast.error('Échec de soumission. Réessayez.');
    }
    setLoading(false);
  }

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: '#F7F7F8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
        <CheckCircle size={40} color="#16a34a" />
      </div>
      <h2 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '10px', color: '#111', letterSpacing: '-0.02em' }}>Candidature envoyée!</h2>
      <p style={{ color: '#888', marginBottom: '28px', fontSize: '14px', lineHeight: 1.6, textAlign: 'center' }}>
        Votre candidature est en cours d'examen.<br />Nous vous notifierons sous 24h.
      </p>
      <button onClick={() => navigate('/')} style={{
        background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)', color: '#fff',
        padding: '14px 32px', borderRadius: '14px', fontWeight: '800',
        fontSize: '15px', border: 'none', cursor: 'pointer',
        boxShadow: '0 6px 20px rgba(255,107,0,0.35)', fontFamily: 'inherit',
      }}>
        Retour à l'accueil
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F7F7F8', paddingBottom: '40px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        .input-field:focus { border-color: #FF6B00 !important; outline: none; background: #fff !important; }
      `}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(145deg, #FF6B00, #FF9A3C)', padding: '20px 16px 32px', borderRadius: '0 0 32px 32px' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '20px', padding: '7px 14px', color: '#fff', fontSize: '13px', cursor: 'pointer', marginBottom: '20px', fontFamily: 'inherit', fontWeight: '600' }}>
          <ArrowLeft size={14} /> Retour
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
            🛵
          </div>
          <div>
            <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '900', letterSpacing: '-0.02em' }}>Devenir livreur</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '2px', fontWeight: '500' }}>
              Gagnez de l'argent en toute flexibilité
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {/* Benefits */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          {BENEFITS.map(b => (
            <div key={b.title} style={{ background: '#fff', borderRadius: '14px', padding: '14px', border: '1.5px solid #F0F0F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <p style={{ fontSize: '22px', marginBottom: '6px' }}>{b.icon}</p>
              <p style={{ fontSize: '13px', fontWeight: '800', color: '#111', marginBottom: '2px' }}>{b.title}</p>
              <p style={{ fontSize: '11px', color: '#AAA', fontWeight: '500' }}>{b.sub}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '20px', border: '1.5px solid #F0F0F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#111', marginBottom: '18px', letterSpacing: '-0.01em' }}>
            Vos informations
          </h2>

          {/* Vehicle selector */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type de véhicule *</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {VEHICLES.map(v => (
                <button key={v.key} onClick={() => update('vehicle', v.key)} style={{
                  flex: 1, padding: '12px 8px', borderRadius: '12px', border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
                  background: form.vehicle === v.key ? '#FFF3E8' : '#F5F5F5',
                  border: form.vehicle === v.key ? '2px solid #FF6B00' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}>
                  <p style={{ fontSize: '22px', marginBottom: '4px' }}>{v.icon}</p>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: form.vehicle === v.key ? '#FF6B00' : '#888' }}>{v.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ville *</label>
            <select value={form.city} onChange={e => update('city', e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #E8E8E8', fontSize: '14px', background: '#F8F8F8', fontFamily: 'inherit', fontWeight: '500' }}>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Téléphone *</label>
            <input className="input-field" type="tel" placeholder="Ex: 0661234567" value={form.phone}
              onChange={e => update('phone', e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #E8E8E8', fontSize: '14px', background: '#F8F8F8', boxSizing: 'border-box', fontFamily: 'inherit', fontWeight: '500' }} />
          </div>

          {/* ID Card */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>N° Carte d'identité *</label>
            <input className="input-field" placeholder="Ex: AB123456" value={form.id_card}
              onChange={e => update('id_card', e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #E8E8E8', fontSize: '14px', background: '#F8F8F8', boxSizing: 'border-box', fontFamily: 'inherit', fontWeight: '500' }} />
            <p style={{ fontSize: '11px', color: '#BBB', marginTop: '5px', fontWeight: '500' }}>Requis pour vérification d'identité</p>
          </div>

          <button onClick={handleSubmit} disabled={loading} style={{
            width: '100%', padding: '15px', borderRadius: '14px', border: 'none',
            background: loading ? '#FFB380' : 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
            color: '#fff', fontSize: '15px', fontWeight: '800',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 6px 20px rgba(255,107,0,0.35)',
            fontFamily: 'inherit',
          }}>
            {loading ? 'Envoi en cours...' : '🛵 Soumettre ma candidature →'}
          </button>

          {!user && (
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', marginTop: '14px' }}>
              Vous devez être connecté.{' '}
              <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#FF6B00', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit' }}>
                Se connecter
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
