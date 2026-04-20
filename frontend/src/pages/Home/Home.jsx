import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SECTIONS = [
  {
    key: 'customer',
    emoji: '🍽️',
    bg: '#FF6B00',
    title: 'Commander maintenant',
    sub: 'Des centaines de restaurants livrés en moins de 45 min',
    cta: 'Voir les restaurants',
    href: '/restaurants',
    stats: ['500+ restaurants', '< 45 min', 'Cash & Carte'],
    illustration: '🛵',
  },
  {
    key: 'restaurant',
    emoji: '🏪',
    bg: '#1a1a1a',
    title: 'Devenir partenaire',
    sub: 'Augmentez vos ventes avec MarocMiam',
    cta: 'Rejoindre',
    href: '/apply/restaurant',
    stats: ['0 frais fixes', '+40% ventes', 'Dashboard live'],
    illustration: '🏪',
  },
  {
    key: 'courier',
    emoji: '🛵',
    bg: '#FFC107',
    title: 'Devenir livreur',
    sub: "Gagnez de l'argent en livrant quand vous voulez",
    cta: 'Postuler',
    href: '/apply/courier',
    stats: ['Horaires libres', 'Paiement hebdo', 'Équipement offert'],
    illustration: '💰',
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingBottom: '80px' }}>

      {/* Hero banner */}
      <div style={{
        background: '#FF6B00',
        padding: '24px 20px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: '-30px', top: '-30px',
          width: '160px', height: '160px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: '20px', bottom: '-40px',
          width: '100px', height: '100px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', marginBottom: '6px' }}>
            Livraison rapide 🇲🇦
          </p>
          <h1 style={{
            color: '#fff', fontSize: '28px', fontWeight: '900',
            lineHeight: 1.15, marginBottom: '16px', letterSpacing: '-0.5px',
          }}>
            Délicieux repas<br />livrés chez vous
          </h1>
          <button
            onClick={() => navigate('/restaurants')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#fff', color: '#FF6B00',
              padding: '12px 20px', borderRadius: '25px',
              fontWeight: '800', fontSize: '14px', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)', border: 'none',
            }}
          >
            Commander maintenant <ArrowRight size={16} />
          </button>
        </motion.div>

        <div style={{
          position: 'absolute', right: '16px', bottom: '16px',
          fontSize: '80px', opacity: 0.25, pointerEvents: 'none',
        }}>
          🛵
        </div>
      </div>

      {/* Quick stats */}
      <div style={{
        display: 'flex', background: '#fff',
        borderBottom: '1px solid #f0f0f0',
      }}>
        {[
          { value: '500+', label: 'Restaurants' },
          { value: '45 min', label: 'Livraison' },
          { value: '24/7', label: 'Disponible' },
        ].map((s, i) => (
          <div key={s.label} style={{
            flex: 1, textAlign: 'center', padding: '14px 8px',
            borderRight: i < 2 ? '1px solid #f0f0f0' : 'none',
          }}>
            <p style={{ fontSize: '18px', fontWeight: '900', color: '#FF6B00' }}>{s.value}</p>
            <p style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Section cards */}
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>
          Que souhaitez-vous?
        </h2>

        {SECTIONS.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => navigate(s.href)}
            style={{
              background: s.bg, borderRadius: '20px',
              padding: '20px', cursor: 'pointer',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', right: '-10px', bottom: '-10px',
              fontSize: '90px', opacity: 0.15, pointerEvents: 'none',
            }}>
              {s.illustration}
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', marginBottom: '12px',
              }}>
                {s.emoji}
              </div>

              <h3 style={{
                color: '#fff', fontSize: '18px', fontWeight: '800',
                marginBottom: '6px', lineHeight: 1.2,
              }}>
                {s.title}
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.7)', fontSize: '12px',
                lineHeight: 1.5, marginBottom: '14px',
              }}>
                {s.sub}
              </p>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {s.stats.map(stat => (
                  <span key={stat} style={{
                    background: 'rgba(255,255,255,0.18)',
                    color: '#fff', fontSize: '10px', fontWeight: '600',
                    padding: '4px 10px', borderRadius: '20px',
                  }}>
                    {stat}
                  </span>
                ))}
              </div>

              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#fff', borderRadius: '25px', padding: '10px 18px',
              }}>
                <span style={{
                  fontSize: '13px', fontWeight: '800',
                  color: s.bg === '#FFC107' ? '#FF6B00' : s.bg,
                }}>
                  {s.cta}
                </span>
                <ArrowRight size={14} color={s.bg === '#FFC107' ? '#FF6B00' : s.bg} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ textAlign: 'center', padding: '16px' }}>
        <p style={{ fontSize: '11px', color: '#ccc' }}>© 2026 MarocMiam · Maroc 🇲🇦</p>
      </div>
    </div>
  );
}