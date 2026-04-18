import { useState, useEffect } from 'react';
import API from '../../services/api';
import { Bike, MapPin, CheckCircle, XCircle, RefreshCw, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminCouriers() {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await API.get('/couriers/');
      setCouriers(res.data);
    } catch { toast.error('Failed to load couriers'); }
    setLoading(false);
  }

  async function toggleAvailable(id, current) {
    try {
      await API.patch(`/couriers/${id}/`, { is_available: !current });
      setCouriers(prev => prev.map(c => c.id === id ? { ...c, is_available: !current } : c));
      toast.success('Updated');
    } catch { toast.error('Failed to update'); }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800' }}>Couriers</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted-fg)', marginTop: '2px' }}>{couriers.length} registered couriers</p>
        </div>
        <button onClick={load} style={{ background: 'var(--muted)', padding: '8px', borderRadius: '10px', color: 'var(--muted-fg)' }}>
          <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: '80px', background: 'var(--muted)', borderRadius: 'var(--radius)' }} />)}
        </div>
      ) : couriers.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px', background: 'var(--card)',
          borderRadius: 'var(--radius)', border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛵</div>
          <p style={{ fontWeight: '700', marginBottom: '6px' }}>No couriers yet</p>
          <p style={{ fontSize: '13px', color: 'var(--muted-fg)' }}>Add couriers from the Django admin panel</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {couriers.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                background: 'var(--card)', borderRadius: 'var(--radius)',
                border: '1px solid var(--border)', padding: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: '#f0fdf4', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '20px',
                }}>
                  🛵
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '700' }}>{c.username}</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '3px' }}>
                    {c.phone && (
                      <span style={{ fontSize: '11px', color: 'var(--muted-fg)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Phone size={10} /> {c.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
                  background: c.is_available ? '#dcfce7' : '#f1f5f9',
                  color: c.is_available ? '#16a34a' : '#64748b',
                }}>
                  {c.is_available ? 'Available' : 'Offline'}
                </span>
                <button
                  onClick={() => toggleAvailable(c.id, c.is_available)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: c.is_available ? '#fee2e2' : '#dcfce7',
                  }}
                >
                  {c.is_available
                    ? <XCircle size={16} color="#dc2626" />
                    : <CheckCircle size={16} color="#16a34a" />
                  }
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}