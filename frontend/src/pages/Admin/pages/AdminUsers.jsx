import { useState, useEffect } from 'react';
import API from '../../../services/api';
import { RefreshCw, Shield, User } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await API.get('/users/');
      setUsers(res.data);
    } catch { toast.error('Failed to load users'); }
    setLoading(false);
  }

  const filtered = users.filter(u =>
    search ? u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <input
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: '10px',
            border: '1px solid #e2e8f0', fontSize: '13px', background: '#fff',
          }}
        />
        <button onClick={load} style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>
          <RefreshCw size={14} color="#64748b" />
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['User', 'Email', 'Role', 'Joined'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}><td colSpan={4} style={{ padding: '12px 16px' }}>
                  <div style={{ height: '20px', background: '#f1f5f9', borderRadius: '6px' }} />
                </td></tr>
              ))
            ) : filtered.map((u, i) => (
              <motion.tr
                key={u.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                style={{ borderTop: '1px solid #f1f5f9' }}
              >
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: u.is_staff ? 'rgba(0,166,81,0.1)' : '#f1f5f9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '800', fontSize: '14px',
                      color: u.is_staff ? '#00A651' : '#64748b',
                    }}>
                      {u.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '700' }}>{u.username}</p>
                      <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {u.first_name} {u.last_name}
                      </p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>{u.email || '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
                    background: u.is_superuser ? 'rgba(0,166,81,0.1)' : u.is_staff ? '#dbeafe' : '#f1f5f9',
                    color: u.is_superuser ? '#00A651' : u.is_staff ? '#2563eb' : '#64748b',
                  }}>
                    {u.is_superuser ? <><Shield size={10} /> Super Admin</> : u.is_staff ? <><Shield size={10} /> Admin</> : <><User size={10} /> Customer</>}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '12px', color: '#94a3b8' }}>
                  {u.date_joined ? new Date(u.date_joined).toLocaleDateString('fr-MA') : '—'}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No users found</p>
        )}
      </div>
    </div>
  );
}