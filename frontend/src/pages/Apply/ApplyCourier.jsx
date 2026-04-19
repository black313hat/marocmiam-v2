import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { Bike, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const CITIES = ['Al Hoceima', 'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir'];
const VEHICLES = [
  { key: 'moto', label: '🛵 Moto / Scooter' },
  { key: 'bike', label: '🚲 Vélo' },
  { key: 'car', label: '🚗 Voiture' },
];

export default function ApplyCourier() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    phone: '',
    city: 'Al Hoceima',
    vehicle: 'moto',
    id_card: '',
  });

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit() {
    if (!form.phone || !form.id_card) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    try {
      await API.post('/apply/courier/', form);
      setSubmitted(true);
      toast.success('Application submitted! 🎉');
    } catch {
      toast.error('Failed to submit. Please try again.');
    }
    setLoading(false);
  }

  if (submitted) return (
    <div style={{ padding: '40px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: '72px', marginBottom: '16px' }}>🛵</div>
      <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>Application Submitted!</h2>
      <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px', lineHeight: 1.6 }}>
        Your courier application is under review.<br />
        We'll notify you once approved — usually within 24 hours.
      </p>
      <button onClick={() => navigate('/')} style={{
        background: '#FFC107', color: '#09090b', padding: '14px 32px',
        borderRadius: '12px', fontWeight: '700', fontSize: '15px', border: 'none', cursor: 'pointer',
      }}>
        Back to Home
      </button>
    </div>
  );

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #FFC107, #FF9800)', padding: '20px 16px 28px' }}>
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '20px',
          padding: '6px 14px', color: '#fff', fontSize: '13px', cursor: 'pointer', marginBottom: '16px',
        }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '40px' }}>🛵</span>
          <div>
            <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '800' }}>
              Devenir livreur
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', marginTop: '2px' }}>
              Gagnez de l'argent en toute flexibilité
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {/* Benefits */}
        <div style={{
          background: 'rgba(255,193,7,0.08)', borderRadius: '14px',
          padding: '16px', marginBottom: '24px', border: '1px solid rgba(255,193,7,0.2)',
        }}>
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#ca8a04', marginBottom: '10px' }}>
            ✅ Avantages livreur MarocMiam
          </p>
          {['Horaires 100% flexibles — vous choisissez quand livrer', 'Paiement hebdomadaire', 'Équipement fourni (sac thermique)', 'Support 24/7'].map(b => (
            <p key={b} style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>• {b}</p>
          ))}
        </div>

        {/* Vehicle selector */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '8px' }}>
            TYPE DE VÉHICULE *
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {VEHICLES.map(v => (
              <button
                key={v.key}
                onClick={() => update('vehicle', v.key)}
                style={{
                  flex: 1, padding: '12px 8px', borderRadius: '12px', border: 'none',
                  cursor: 'pointer', fontSize: '12px', fontWeight: '600', textAlign: 'center',
                  background: form.vehicle === v.key ? '#FFC107' : '#f1f5f9',
                  color: form.vehicle === v.key ? '#09090b' : '#64748b',
                  boxShadow: form.vehicle === v.key ? '0 4px 12px rgba(255,193,7,0.3)' : 'none',
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>
              VILLE *
            </label>
            <select
              value={form.city}
              onChange={e => update('city', e.target.value)}
              style={{
                width: '100%', padding: '13px 16px', borderRadius: '12px',
                border: '1.5px solid #e2e8f0', fontSize: '14px', background: '#f8fafc',
              }}
            >
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>
              TÉLÉPHONE *
            </label>
            <input
              placeholder="Ex: 0661234567"
              value={form.phone}
              onChange={e => update('phone', e.target.value)}
              type="tel"
              style={{
                width: '100%', padding: '13px 16px', borderRadius: '12px',
                border: '1.5px solid #e2e8f0', fontSize: '14px', background: '#f8fafc',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>
              N° CARTE D'IDENTITÉ *
            </label>
            <input
              placeholder="Ex: AB123456"
              value={form.id_card}
              onChange={e => update('id_card', e.target.value)}
              style={{
                width: '100%', padding: '13px 16px', borderRadius: '12px',
                border: '1.5px solid #e2e8f0', fontSize: '14px', background: '#f8fafc',
              }}
            />
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
              Requis pour vérification d'identité
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
              background: loading ? '#94a3b8' : '#FFC107', color: '#09090b',
              fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(255,193,7,0.3)', marginTop: '8px',
            }}
          >
            {loading ? 'Envoi en cours...' : 'Soumettre ma candidature →'}
          </button>

          {!user && (
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
              Vous devez être connecté.{' '}
              <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#00A651', fontWeight: '700', cursor: 'pointer' }}>
                Se connecter
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}