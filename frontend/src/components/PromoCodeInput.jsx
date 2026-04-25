import { useState } from 'react';
import API from '../services/api';
import { Tag, Check, X, Loader } from 'lucide-react';

export default function PromoCodeInput({ onApply, total }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(null); // { code, discount, type }
  const [error, setError] = useState('');

  async function applyCode() {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/promo/apply/', { code: code.trim().toUpperCase(), total });
      setApplied(res.data);
      onApply(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Code invalide');
      setApplied(null);
    }
    setLoading(false);
  }

  function removeCode() {
    setApplied(null);
    setCode('');
    setError('');
    onApply(null);
  }

  if (applied) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#dcfce7', borderRadius: '12px', padding: '12px 14px', border: '1.5px solid #a7f3d0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} color="#16a34a" />
          <div>
            <p style={{ fontSize: '13px', fontWeight: '800', color: '#16a34a' }}>Code "{applied.code}" appliqué!</p>
            <p style={{ fontSize: '11px', color: '#16a34a', opacity: 0.8 }}>
              -{applied.discount_amount} MAD ({applied.discount}% de réduction)
            </p>
          </div>
        </div>
        <button onClick={removeCode} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={16} color="#16a34a" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: '#F8F8F8', borderRadius: '12px', padding: '11px 14px', border: error ? '1.5px solid #fecaca' : '1.5px solid #E8E8E8' }}>
          <Tag size={15} color="#BBB" />
          <input
            placeholder="Code promo"
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && applyCode()}
            style={{ flex: 1, fontSize: '14px', fontWeight: '700', background: 'none', border: 'none', outline: 'none', fontFamily: 'inherit', letterSpacing: '0.05em' }}
          />
        </div>
        <button onClick={applyCode} disabled={loading || !code.trim()} style={{
          padding: '11px 18px', borderRadius: '12px', border: 'none',
          background: code.trim() ? 'linear-gradient(135deg, #FF6B00, #FF9A3C)' : '#F0F0F0',
          color: code.trim() ? '#fff' : '#BBB',
          fontSize: '13px', fontWeight: '800', cursor: code.trim() ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit',
          boxShadow: code.trim() ? '0 4px 12px rgba(255,107,0,0.3)' : 'none',
        }}>
          {loading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Appliquer'}
        </button>
      </div>
      {error && <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '6px', fontWeight: '600' }}>❌ {error}</p>}
    </div>
  );
}
