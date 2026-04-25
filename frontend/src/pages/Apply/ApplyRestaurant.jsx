import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { ArrowLeft, Store, MapPin, Phone, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CITIES = ['Al Hoceima', 'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Oujda', 'Tétouan', 'Nador'];
const CATEGORIES = ['Restaurant', 'Fast Food', 'Café', 'Barbecue', 'Supermarket', 'Pizzeria', 'Sandwicherie', 'Sushi', 'Burger'];

const BENEFITS = [
  { icon: '💰', title: '0 frais fixes', sub: 'Payez seulement sur les ventes' },
  { icon: '📈', title: '+40% de ventes', sub: 'En moyenne pour nos partenaires' },
  { icon: '📊', title: 'Dashboard live', sub: 'Gérez vos commandes en temps réel' },
  { icon: '🛵', title: 'Livraison assurée', sub: 'Par nos coursiers certifiés' },
];

export default function ApplyRestaurant() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    restaurant_name: '', restaurant_address: '',
    restaurant_category: 'Restaurant', phone: '', city: 'Al Hoceima',
  });

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit() {
    if (!form.restaurant_name || !form.phone || !form.restaurant_address) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    try {
      await API.post('/apply/restaurant/', form);
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
            🍽️
          </div>
          <div>
            <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '900', letterSpacing: '-0.02em' }}>Devenir partenaire</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '2px', fontWeight: '500' }}>
              Rejoignez MarocMiam et boostez vos ventes
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
            Informations du restaurant
          </h2>

          {[
            { key: 'restaurant_name', label: 'Nom du restaurant *', placeholder: 'Ex: Casa Bento, Rico BBQ...', type: 'text' },
            { key: 'phone',           label: 'Téléphone *',          placeholder: 'Ex: 0661234567',             type: 'tel' },
            { key: 'restaurant_address', label: 'Adresse *',         placeholder: 'Ex: 25 Av. Hassan II',       type: 'text' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
              <input className="input-field" type={f.type} placeholder={f.placeholder} value={form[f.key]}
                onChange={e => update(f.key, e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #E8E8E8', fontSize: '14px', background: '#F8F8F8', boxSizing: 'border-box', fontFamily: 'inherit', fontWeight: '500' }} />
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catégorie *</label>
              <select value={form.restaurant_category} onChange={e => update('restaurant_category', e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #E8E8E8', fontSize: '13px', background: '#F8F8F8', fontFamily: 'inherit', fontWeight: '500' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ville *</label>
              <select value={form.city} onChange={e => update('city', e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #E8E8E8', fontSize: '13px', background: '#F8F8F8', fontFamily: 'inherit', fontWeight: '500' }}>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading} style={{
            width: '100%', padding: '15px', borderRadius: '14px', border: 'none',
            background: loading ? '#FFB380' : 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
            color: '#fff', fontSize: '15px', fontWeight: '800',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 6px 20px rgba(255,107,0,0.35)',
            fontFamily: 'inherit', marginTop: '8px',
          }}>
            {loading ? 'Envoi en cours...' : '🍽️ Soumettre ma candidature →'}
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
