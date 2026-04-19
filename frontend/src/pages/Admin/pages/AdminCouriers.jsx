import { useState, useEffect } from 'react';
import API from '../../../services/api';
import { RefreshCw, CheckCircle, XCircle, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminCouriers() {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await API.get('/couriers/');
      setCouriers(res.data);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  }

  async function toggle(id, current) {
    try {
      const token = localStorage.getItem('admin_token');
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await API.patch(`/couriers/${id}/`, { is_available: !current });
      setCouriers(prev => prev.map(c => c.id === id ? { ...c, is_available: !current } : c));
      toast.success('Updated');
    } catch { toast.error('Failed'); }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <p style={{ fontSize: '13px', color: '#64748b' }}>{couriers.length} couriers registered</p>
        <button onClick={load} style={{ padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>
          <RefreshCw size={14} color="#64748b" />
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Courier', 'Phone', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i}><td colSpan={4} style={{ padding: '12px 16px' }}>
                  <div style={{ height: '20px', background: '#f1f5f9', borderRadius: '6px' }} />
                </td></tr>
              ))
            ) : couriers.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                No couriers yet
              </td></tr>
            ) : couriers.map((c, i) => (
              <motion.tr
                key={c.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                style={{ borderTop: '1px solid #f1f5f9' }}
              >
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: '#f3e8ff', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '18px',
                    }}>🛵</div>
                    <p style={{ fontSize: '13px', fontWeight: '700' }}>{c.username}</p>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>
                  {c.phone ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} />{c.phone}</span> : '—'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
                    background: c.is_available ? '#dcfce7' : '#f1f5f9',
                    color: c.is_available ? '#16a34a' : '#64748b',
                  }}>
                    {c.is_available ? 'Available' : 'Offline'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => toggle(c.id, c.is_available)} style={{
                    width: '32px', height: '32px', borderRadius: '50%', border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: c.is_available ? '#fee2e2' : '#dcfce7',
                  }}>
                    {c.is_available
                      ? <XCircle size={16} color="#dc2626" />
                      : <CheckCircle size={16} color="#16a34a" />
                    }
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}