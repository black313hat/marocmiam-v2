import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const SECTIONS = [
  {
    key: 'customer',
    emoji: '🍽️',
    bg: 'linear-gradient(135deg, #FF6B35, #e55a2b)',
    title: 'Commander',
    sub: 'Explorez des centaines de restaurants et recevez vos plats en moins de 45 min',
    cta: 'Commander maintenant',
    href: '/restaurants',
    stats: ['500+ restaurants', '< 45 min', 'Cash & Carte'],
  },
  {
    key: 'restaurant',
    emoji: '🏪',
    bg: 'linear-gradient(135deg, #00A651, #007a3d)',
    title: 'Devenir partenaire restaurant',
    sub: 'Augmentez vos ventes et touchez des milliers de clients dans votre ville',
    cta: 'Rejoindre en tant que restaurant',
    href: '/restaurant-dashboard',
    stats: ['0 frais fixes', '+40% ventes', 'Dashboard live'],
  },
  {
    key: 'courier',
    emoji: '🛵',
    bg: 'linear-gradient(135deg, #FFC107, #FF9800)',
    title: 'Devenir livreur',
    sub: "Gagnez de l'argent en livrant quand vous voulez, où vous voulez",
    cta: 'Rejoindre en tant que livreur',
    href: '/courier-dashboard',
    stats: ['Horaires libres', 'Paiement hebdo', 'Équipement offert'],
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [address, setAddress] = useState('');
  const [locating, setLocating] = useState(false);

  function handleLocate() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
          );
          const data = await res.json();
          const parts = [data.address?.road, data.address?.city || data.address?.town].filter(Boolean);
          setAddress(parts.join(', ') || '');
        } catch {}
        setLocating(false);
      },
      () => setLocating(false)
    );
  }

  function handleSectionClick(s) {
    if (s.key === 'customer') {
      navigate('/restaurants');
    } else {
      if (!user) {
        navigate('/login');
      } else {
        navigate(s.href);
      }
    }
  }

  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* Hero header */}
      <div style={{ padding: '20px 16px 24px' }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '28px', fontWeight: '800', lineHeight: 1.2, marginBottom: '8px' }}
        >
          Commandez ce que<br />vous aimez 🍴
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}
        >
          Livraison rapide partout au Maroc
        </motion.p>

        {/* Address input */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', gap: '8px' }}
        >
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
            background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '16px', padding: '0 16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <MapPin size={16} color="#00A651" style={{ flexShrink: 0 }} />
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Saisissez votre adresse..."
              style={{
                flex: 1, height: '48px', background: 'transparent',
                fontSize: '14px', color: '#09090b',
              }}
            />
            <button
              onClick={handleLocate}
              style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
            >
              {locating
                ? <Loader2 size={16} color="#00A651" />
                : <span style={{ fontSize: '18px' }}>📍</span>
              }
            </button>
          </div>
          <button
            onClick={() => navigate('/restaurants')}
            style={{
              height: '48px', width: '48px', borderRadius: '16px', flexShrink: 0,
              background: '#00A651', display: 'flex', alignItems: 'center',
              justifyContent: 'center', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,166,81,0.3)',
            }}
          >
            <ArrowRight size={20} color="#fff" />
          </button>
        </motion.div>
      </div>

      {/* 3 Cards */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {SECTIONS.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1 }}
          >
            <div
              onClick={() => handleSectionClick(s)}
              style={{
                background: s.bg, borderRadius: '24px', padding: '20px',
                overflow: 'hidden', position: 'relative', cursor: 'pointer',
              }}
            >
              {/* Background emoji */}
              <div style={{
                position: 'absolute', right: '-8px', bottom: '-8px',
                fontSize: '80px', opacity: 0.2, userSelect: 'none', pointerEvents: 'none',
              }}>
                {s.emoji}
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  display: 'flex', alignItems: 'start',
                  justifyContent: 'space-between', marginBottom: '12px',
                }}>
                  <span style={{ fontSize: '32px' }}>{s.emoji}</span>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ArrowRight size={16} color="#fff" />
                  </div>
                </div>

                <h2 style={{
                  color: '#fff', fontWeight: '800',
                  fontSize: '18px', lineHeight: 1.2, marginBottom: '6px',
                }}>
                  {s.title}
                </h2>
                <p style={{
                  color: 'rgba(255,255,255,0.8)', fontSize: '12px',
                  lineHeight: 1.5, marginBottom: '14px',
                }}>
                  {s.sub}
                </p>

                {/* Stats pills */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {s.stats.map(stat => (
                    <span key={stat} style={{
                      background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
                      color: '#fff', fontSize: '10px', fontWeight: '600',
                      padding: '4px 10px', borderRadius: '20px',
                    }}>
                      {stat}
                    </span>
                  ))}
                </div>

                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: '#fff', borderRadius: '20px', padding: '8px 16px',
                }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#09090b' }}>
                    {s.cta}
                  </span>
                  <ArrowRight size={14} color="#09090b" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '28px 16px 8px' }}>
        <p style={{ fontSize: '11px', color: '#94a3b8' }}>
          © 2026 MarocMiam · Maroc · Made with ❤️
        </p>
      </div>

    </div>
  );
}