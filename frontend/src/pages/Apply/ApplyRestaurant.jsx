import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { Store, MapPin, Phone, ArrowLeft, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const CITIES = ['Al Hoceima', 'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir'];
const CATEGORIES = ['Restaurant', 'Fast Food', 'Café', 'Barbecue', 'Supermarket', 'Pizzeria', 'Sandwicherie'];

export default function ApplyRestaurant() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    restaurant_name: '',
    restaurant_address: '',
    restaurant_category: 'Restaurant',
    phone: '',
    city: 'Al Hoceima',
  });

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit() {
    if (!form.restaurant_name || !form.phone || !form.restaurant_address) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    try {
      await API.post('/apply/restaurant/', form);
      setSubmitted(true);
      toast.success('Application submitted! 🎉');
    } catch {
      toast.error('Failed to submit. Please try again.');
    }
    setLoading(false);
  }

  if (submitted) return (
    <div style={{ padding: '40px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: '72px', marginBottom: '16px' }}>🎉</div>
      <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>Application Submitted!</h2>
      <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px', lineHeight: 1.6 }}>
        Your restaurant application is under review.<br />
        We'll notify you once approved — usually within 24 hours.
      </p>
      <button onClick={() => navigate('/')} style={{
        background: '#00A651', color: '#fff', padding: '14px 32px',
        borderRadius: '12px', fontWeight: '700', fontSize: '15px', border: 'none', cursor: 'pointer',
      }}>
        Back to Home
      </button>
    </div>
  );

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #00A651, #007a3d)', padding: '20px 16px 28px' }}>
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '20px',
          padding: '6px 14px', color: '#fff', fontSize: '13px', cursor: 'pointer', marginBottom: '16px',
        }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '40px' }}>🏪</span>
          <div>
            <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '800' }}>
              Devenir partenaire
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '2px' }}>
              Rejoignez MarocMiam et boostez vos ventes
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {/* Benefits */}
        <div style={{
          background: 'rgba(0,166,81,0.06)', borderRadius: '14px',
          padding: '16px', marginBottom: '24px', border: '1px solid rgba(0,166,81,0.15)',
        }}>
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#00A651', marginBottom: '10px' }}>
            ✅ Pourquoi rejoindre MarocMiam?
          </p>
          {['0 frais fixes — payez seulement sur les ventes', '+40% de ventes en moyenne', 'Dashboard live pour gérer vos commandes', 'Livraison assurée par nos coursiers'].map(b => (
            <p key={b} style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>• {b}</p>
          ))}
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>
              NOM DU RESTAURANT *
            </label>
            <input
              placeholder="Ex: Casa Bento, Rico BBQ..."
              value={form.restaurant_name}
              onChange={e => update('restaurant_name', e.target.value)}
              style={{
                width: '100%', padding: '13px 16px', borderRadius: '12px',
                border: '1.5px solid #e2e8f0', fontSize: '14px', background: '#f8fafc',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '6px' }}>
              CATÉGORIE *
            </label>
            <select
              value={form.restaurant_category}
              onChange={e => update('restaurant_category', e.target.value)}
              style={{
                width: '100%', padding: '13px 16px', borderRadius: '12px',
                border: '1.5px solid #e2e8f0', fontSize: '14px', background: '#f8fafc',
              }}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

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
              ADRESSE *
            </label>
            <input
              placeholder="Ex: 25 Av. Hassan II, Al Hoceima"
              value={form.restaurant_address}
              onChange={e => update('restaurant_address', e.target.value)}
              style={{
                width: '100%', padding: '13px 16px', borderRadius: '12px',
                border: '1.5px solid #e2e8f0', fontSize: '14px', background: '#f8fafc',
              }}
            />
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

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
              background: loading ? '#94a3b8' : '#00A651', color: '#fff',
              fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(0,166,81,0.3)', marginTop: '8px',
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