import { useState, useEffect } from 'react';
import API from '../../../services/api';
import { RefreshCw, CheckCircle, XCircle, Store, Bike } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [role, setRole] = useState('all');
  const [updating, setUpdating] = useState(null);

  useEffect(() => { load(); }, [filter, role]);

  async function load() {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const params = new URLSearchParams({ status: filter });
      if (role !== 'all') params.append('role', role);
      const res = await API.get(`/admin/applications/?${params}`);
      setApplications(res.data);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  }

  async function updateStatus(id, status) {
    setUpdating(id);
    try {
      const token = localStorage.getItem('admin_token');
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await API.patch(`/admin/applications/${id}/`, { status });
      toast.success(`Application ${status} ✅`);
      load();
    } catch { toast.error('Failed'); }
    setUpdating(null);
  }

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '7px 16px', borderRadius: '10px', fontSize: '12px',
            fontWeight: '600', border: 'none', cursor: 'pointer',
            background: filter === s ? '#09090b' : '#fff',
            color: filter === s ? '#fff' : '#64748b',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}>
            {s === 'pending' ? '⏳ Pending' : s === 'approved' ? '✅ Approved' : '❌ Rejected'}
          </button>
        ))}
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          {['all', 'restaurant_owner', 'courier'].map(r => (
            <button key={r} onClick={() => setRole(r)} style={{
              padding: '7px 14px', borderRadius: '10px', fontSize: '12px',
              fontWeight: '600', border: '1px solid #e2e8f0', cursor: 'pointer',
              background: role === r ? '#00A651' : '#fff',
              color: role === r ? '#fff' : '#64748b',
            }}>
              {r === 'all' ? 'All' : r === 'restaurant_owner' ? '🏪 Restaurants' : '🛵 Couriers'}
            </button>
          ))}
        </div>
        <button onClick={load} style={{ padding: '7px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>
          <RefreshCw size={14} color="#64748b" />
        </button>
      </div>

      {/* Applications */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: '100px', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0' }} />)}
        </div>
      ) : applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
          <p style={{ fontWeight: '600' }}>No {filter} applications</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {applications.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: '#fff', borderRadius: '14px',
                border: '1px solid #e2e8f0', padding: '16px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: app.role === 'restaurant_owner' ? 'rgba(0,166,81,0.1)' : 'rgba(255,193,7,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                  }}>
                    {app.role === 'restaurant_owner' ? '🏪' : '🛵'}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '700' }}>
                      {app.role === 'restaurant_owner' ? app.restaurant_name : `Courier — ${app.username}`}
                    </p>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {app.username} · {app.city} · {app.phone}
                    </p>
                    {app.role === 'restaurant_owner' && (
                      <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        {app.restaurant_category} · {app.restaurant_address}
                      </p>
                    )}
                    {app.role === 'courier' && (
                      <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        Vehicle: {app.vehicle} · ID: {app.id_card}
                      </p>
                    )}
                  </div>
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
                  background: app.status === 'pending' ? '#fef9c3' : app.status === 'approved' ? '#dcfce7' : '#fee2e2',
                  color: app.status === 'pending' ? '#ca8a04' : app.status === 'approved' ? '#16a34a' : '#dc2626',
                }}>
                  {app.status}
                </span>
              </div>

              {app.status === 'pending' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => updateStatus(app.id, 'approved')}
                    disabled={updating === app.id}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                      background: '#dcfce7', color: '#16a34a', fontWeight: '700',
                      fontSize: '13px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}
                  >
                    <CheckCircle size={15} /> Approve
                  </button>
                  <button
                    onClick={() => updateStatus(app.id, 'rejected')}
                    disabled={updating === app.id}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                      background: '#fee2e2', color: '#dc2626', fontWeight: '700',
                      fontSize: '13px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}
                  >
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              )}
              {app.status === 'approved' && (
                <button
                  onClick={() => updateStatus(app.id, 'rejected')}
                  style={{
                    width: '100%', padding: '8px', borderRadius: '10px', border: 'none',
                    background: '#f1f5f9', color: '#64748b', fontSize: '12px',
                    fontWeight: '600', cursor: 'pointer',
                  }}
                >
                  Revoke Approval
                </button>
              )}
              {app.status === 'rejected' && (
                <button
                  onClick={() => updateStatus(app.id, 'approved')}
                  style={{
                    width: '100%', padding: '8px', borderRadius: '10px', border: 'none',
                    background: '#dcfce7', color: '#16a34a', fontSize: '12px',
                    fontWeight: '600', cursor: 'pointer',
                  }}
                >
                  Re-approve
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}