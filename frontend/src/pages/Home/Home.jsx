import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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

  return (
    <div style={{ padding: '16px', paddingBottom: '80px' }}>
      {SECTIONS.map((s, i) => (
        <motion.div
          key={s.key}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          style={{ marginBottom: '12px' }}
        >
          <div
            onClick={() => navigate(s.href)}
            style={{
              background: s.bg,
              borderRadius: '24px',
              padding: '20px',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            {/* Background emoji */}
            <div style={{
              position: 'absolute', right: '-8px', bottom: '-8px',
              fontSize: '80px', opacity: 0.2, userSelect: 'none',
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
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(4px)',
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
  );
}