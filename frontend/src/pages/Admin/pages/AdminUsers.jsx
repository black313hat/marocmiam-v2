import { useState, useEffect } from 'react';
import API from '../../../services/api';
import { RefreshCw, Trash2, KeyRound, UserPlus, X, Search, ChevronDown, Check, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ROLE_META = {
  superuser: { label: 'Admin', bg: 'rgba(0,166,81,0.1)', color: '#00A651', icon: '🛡️' },
  restaurant_owner: { label: 'Restaurant Owner', bg: '#fff3e8', color: '#FF6B00', icon: '🍽️' },
  courier: { label: 'Courier', bg: '#eff6ff', color: '#2563eb', icon: '🛵' },
  customer: { label: 'Customer', bg: '#f1f5f9', color: '#64748b', icon: '👤' },
};

function getUserRole(u) {
  if (u.is_superuser || u.is_staff) return 'superuser';
  if (u.profile_role === 'restaurant_owner') return 'restaurant_owner';
  if (u.profile_role === 'courier') return 'courier';
  return 'customer';
}

// ── Modal wrapper ──
function Modal({ onClose, children }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

// ── Assign Restaurant Modal ──
function AssignRestaurantModal({ user, onClose, onAssigned }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loadingRest, setLoadingRest] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState('existing');
  const [selectedId, setSelectedId] = useState('');
  const [newForm, setNewForm] = useState({ name: '', category: 'Restaurant', city: '', address: '' });

  useEffect(() => {
    API.get('/restaurants/').then(res => setRestaurants(res.data)).catch(() => toast.error('Failed to load restaurants')).finally(() => setLoadingRest(false));
  }, []);

  async function submit() {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('admin_token');
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const payload = mode === 'existing'
        ? { restaurant_id: selectedId }
        : { new_restaurant_name: newForm.name, category: newForm.category, city: newForm.city, address: newForm.address };
      const res = await API.post(`/admin/users/${user.id}/assign-restaurant/`, payload);
      toast.success(`"${res.data.restaurant.name}" assigned to ${user.username}`);
      onAssigned(user.id, res.data.restaurant);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to assign restaurant');
    }
    setSubmitting(false);
  }

  const canSubmit = !submitting && (mode === 'existing' ? !!selectedId : !!newForm.name);

  return (
    <Modal onClose={onClose}>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: '800' }}>Assign Restaurant</h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>to @{user.username}</p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}><X size={16} color="#64748b" /></button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
          {[{ k: 'existing', l: '🏪 Existing' }, { k: 'new', l: '➕ Create New' }].map(({ k, l }) => (
            <button key={k} onClick={() => setMode(k)} style={{
              flex: 1, padding: '9px', borderRadius: '10px', fontSize: '12px', fontWeight: '700',
              border: mode === k ? '2px solid #FF6B00' : '2px solid #e2e8f0',
              background: mode === k ? '#fff3e8' : '#fff',
              color: mode === k ? '#FF6B00' : '#94a3b8', cursor: 'pointer',
            }}>{l}</button>
          ))}
        </div>

        {mode === 'existing' ? (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Select Restaurant</label>
            {loadingRest ? <div style={{ height: '42px', background: '#f1f5f9', borderRadius: '10px' }} /> : (
              <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#fff' }}>
                <option value="">— Choose a restaurant —</option>
                {restaurants.map(r => <option key={r.id} value={r.id}>{r.name} · {r.city}</option>)}
              </select>
            )}
          </div>
        ) : (
          <div style={{ marginBottom: '16px' }}>
            {[
              { key: 'name', label: 'Restaurant Name', placeholder: 'e.g. Café Atlas' },
              { key: 'category', label: 'Category', placeholder: 'e.g. Café, Pizza, Burger' },
              { key: 'city', label: 'City', placeholder: 'e.g. Fès' },
              { key: 'address', label: 'Address', placeholder: 'Full address' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '5px', textTransform: 'uppercase' }}>{f.label}</label>
                <input value={newForm[f.key]} onChange={e => setNewForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
        )}

        <button onClick={submit} disabled={!canSubmit} style={{
          width: '100%', padding: '13px', borderRadius: '12px', background: '#FF6B00',
          color: '#fff', fontWeight: '800', fontSize: '14px', border: 'none',
          cursor: canSubmit ? 'pointer' : 'not-allowed', opacity: canSubmit ? 1 : 0.6,
        }}>
          {submitting ? 'Assigning...' : '🍽️ Assign Restaurant & Save'}
        </button>
      </div>
    </Modal>
  );
}

// ── Add User Modal ──
function AddUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'customer' });
  const [loading, setLoading] = useState(false);
  const res = await API.post('/admin/users/create/', payload);
  const newUser = res.data.user;
  console.log('Created user:', newUser);
  console.log('Form role:', form.role);
  if (['courier', 'restaurant_owner'].includes(form.role)) {
    const roleRes = await API.patch(`/admin/users/${newUser.id}/profile-role/`, { role: form.role });
    console.log('Role set:', roleRes.data);
    newUser.profile_role = form.role;
  }
  async function submit() {
    if (!form.username || !form.password) return toast.error('Username and password required');
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const payload = { username: form.username, email: form.email, password: form.password, role: form.role === 'superuser' ? 'staff' : 'customer' };
      const res = await API.post('/admin/users/create/', payload);
      const newUser = res.data.user;
      if (['courier', 'restaurant_owner'].includes(form.role)) {
        await API.patch(`/admin/users/${newUser.id}/profile-role/`, { role: form.role });
        newUser.profile_role = form.role;
      }
      toast.success(`User "${newUser.username}" created!`);
      onClose();  // close first
      setTimeout(() => onCreated(newUser), 50);  // then trigger parent with small delay
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create user');
    }
    setLoading(false);
  }

  return (
    <Modal onClose={onClose}>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '800' }}>Add New User</h2>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}><X size={16} color="#64748b" /></button>
        </div>
        {[
          { key: 'username', label: 'Username', type: 'text', placeholder: 'e.g. john_doe' },
          { key: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
          { key: 'password', label: 'Password', type: 'password', placeholder: 'Min. 6 characters' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>{f.label}</label>
            <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        ))}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Role</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {Object.entries(ROLE_META).map(([key, meta]) => (
              <button key={key} onClick={() => setForm(p => ({ ...p, role: key }))} style={{
                padding: '10px 8px', borderRadius: '10px', cursor: 'pointer',
                border: form.role === key ? `2px solid ${meta.color}` : '2px solid #e2e8f0',
                background: form.role === key ? meta.bg : '#fff',
                fontSize: '12px', fontWeight: '700', color: form.role === key ? meta.color : '#94a3b8',
                transition: 'all 0.15s', textAlign: 'center',
              }}>
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>{meta.icon}</div>
                {meta.label}
                {key === 'restaurant_owner' && <div style={{ fontSize: '10px', marginTop: '2px', opacity: 0.7 }}>assign restaurant next</div>}
              </button>
            ))}
          </div>
        </div>
        <button onClick={submit} disabled={loading} style={{
          width: '100%', padding: '13px', borderRadius: '12px', background: '#00A651',
          color: '#fff', fontWeight: '800', fontSize: '14px', border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
        }}>
          {loading ? 'Creating...' : form.role === 'restaurant_owner' ? '✓ Create & Assign Restaurant' : '✓ Create User'}
        </button>
      </div>
    </Modal>
  );
}

// ── Reset Password Modal ──
function ResetPasswordModal({ user, onClose }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (password.length < 6) return toast.error('Min. 6 characters');
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await API.post(`/admin/users/${user.id}/reset-password/`, { password });
      toast.success(`Password reset for "${user.username}"`);
      onClose();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    setLoading(false);
  }

  return (
    <Modal onClose={onClose}>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: '800' }}>Reset Password</h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>for @{user.username}</p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}><X size={16} color="#64748b" /></button>
        </div>
        {[{ label: 'New Password', val: password, set: setPassword }, { label: 'Confirm', val: confirm, set: setConfirm }].map(f => (
          <div key={f.label} style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>{f.label}</label>
            <input type="password" placeholder="Min. 6 characters" value={f.val} onChange={e => f.set(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        ))}
        <button onClick={submit} disabled={loading} style={{
          width: '100%', padding: '13px', borderRadius: '12px', background: '#f59e0b',
          color: '#fff', fontWeight: '800', fontSize: '14px', border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '6px',
        }}>
          {loading ? 'Resetting...' : '🔑 Reset Password'}
        </button>
      </div>
    </Modal>
  );
}

// ── Delete Modal ──
function DeleteModal({ user, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  async function confirm() {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await API.delete(`/admin/users/${user.id}/delete/`);
      toast.success(`"${user.username}" deleted`);
      onDeleted(user.id);
      onClose();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    setLoading(false);
  }
  return (
    <Modal onClose={onClose}>
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Trash2 size={24} color="#dc2626" />
        </div>
        <h2 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '8px' }}>Delete User</h2>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px', lineHeight: 1.5 }}>
          Delete <strong>@{user.username}</strong>? This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
          <button onClick={confirm} disabled={loading} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Role Dropdown ──
function RoleDropdown({ user, onRoleChange, onNeedRestaurant }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [btnRef, setBtnRef] = useState(null);
  const current = getUserRole(user);
  const meta = ROLE_META[current];

  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [open]);

  const getDropdownStyle = () => {
    if (!btnRef) return {};
    const rect = btnRef.getBoundingClientRect();
    const above = window.innerHeight - rect.bottom < 220;
    return {
      position: 'fixed',
      left: rect.left,
      ...(above ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
      background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 9999, minWidth: '200px', overflow: 'hidden',
    };
  };

  async function changeRole(newRole) {
    setOpen(false);
    if (newRole === current) return;

    // Restaurant owner needs restaurant assignment
    if (newRole === 'restaurant_owner') {
      onNeedRestaurant(user);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      if (newRole === 'superuser') {
        await API.patch(`/admin/users/${user.id}/role/`, { role: 'staff' });
      } else {
        if (current === 'superuser') await API.patch(`/admin/users/${user.id}/role/`, { role: 'customer' });
        await API.patch(`/admin/users/${user.id}/profile-role/`, { role: newRole });
      }
      toast.success(`Role → ${ROLE_META[newRole].label}`);
      onRoleChange(user.id, newRole);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
    setLoading(false);
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button ref={setBtnRef} onClick={e => { e.stopPropagation(); setOpen(!open); }} disabled={loading} style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '700',
        padding: '4px 10px', borderRadius: '20px', background: meta.bg, color: meta.color,
        border: 'none', cursor: 'pointer', opacity: loading ? 0.6 : 1,
      }}>
        {meta.icon} {meta.label} <ChevronDown size={10} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            onClick={e => e.stopPropagation()} style={getDropdownStyle()}>
            {Object.entries(ROLE_META).map(([key, m]) => (
              <button key={key} onClick={() => changeRole(key)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '11px 14px', border: 'none', borderBottom: '1px solid #f5f5f5',
                background: current === key ? m.bg : 'transparent',
                color: current === key ? m.color : '#374151',
                fontSize: '12px', fontWeight: '600', cursor: 'pointer', textAlign: 'left',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{m.icon}</span>
                  <span>
                    {m.label}
                    {key === 'restaurant_owner' && <span style={{ display: 'block', fontSize: '10px', color: '#FF6B00', opacity: 0.8 }}>assigns restaurant →</span>}
                  </span>
                </span>
                {current === key && <Check size={12} color={m.color} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main ──
export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [modal, setModal] = useState(null); // { type, user? }

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await API.get('/admin/users/');
      setUsers(res.data);
    } catch {
      try { const res = await API.get('/users/'); setUsers(res.data); }
      catch { toast.error('Failed to load users'); }
    }
    setLoading(false);
  }

  function handleRoleChange(userId, newRole) {
    setUsers(prev => prev.map(u => u.id !== userId ? u : {
      ...u,
      is_staff: newRole === 'superuser',
      is_superuser: newRole === 'superuser',
      profile_role: ['restaurant_owner', 'courier', 'customer'].includes(newRole) ? newRole : u.profile_role,
    }));
  }

  function handleRestaurantAssigned(userId, restaurant) {
    setUsers(prev => prev.map(u => u.id !== userId ? u : {
      ...u, profile_role: 'restaurant_owner', restaurant_name: restaurant.name,
    }));
  }

  const counts = {
    all: users.length,
    superuser: users.filter(u => u.is_staff || u.is_superuser).length,
    restaurant_owner: users.filter(u => !u.is_staff && u.profile_role === 'restaurant_owner').length,
    courier: users.filter(u => !u.is_staff && u.profile_role === 'courier').length,
    customer: users.filter(u => !u.is_staff && (!u.profile_role || u.profile_role === 'customer')).length,
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || u.username.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filterRole === 'all' || getUserRole(u) === filterRole);
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800' }}>Users</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>{users.length} registered users</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={load} style={{ padding: '9px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>
            <RefreshCw size={15} color="#64748b" />
          </button>
          <button onClick={() => setModal({ type: 'add' })} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', border: 'none', background: '#00A651', color: '#fff', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
            <UserPlus size={15} /> Add User
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'superuser', label: '🛡️ Admin' },
          { key: 'restaurant_owner', label: '🍽️ Owner' },
          { key: 'courier', label: '🛵 Courier' },
          { key: 'customer', label: '👤 Customer' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilterRole(key)} style={{
            padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
            border: filterRole === key ? 'none' : '1px solid #e2e8f0',
            background: filterRole === key ? '#09090b' : '#fff',
            color: filterRole === key ? '#fff' : '#64748b', cursor: 'pointer',
          }}>
            {label} ({counts[key] ?? 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input placeholder="Search by username or email..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', background: '#fff', boxSizing: 'border-box', outline: 'none' }} />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'visible' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderRadius: '16px 16px 0 0' }}>
              {['User', 'Email / Restaurant', 'Role', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(5)].map((_, i) => (
              <tr key={i}><td colSpan={5} style={{ padding: '12px 16px' }}><div style={{ height: '20px', background: '#f1f5f9', borderRadius: '6px' }} /></td></tr>
            )) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No users found</td></tr>
            ) : filtered.map((u, i) => {
              const role = getUserRole(u);
              const meta = ROLE_META[role];
              return (
                <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '15px', color: meta.color }}>
                        {u.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: '700', color: '#09090b' }}>{u.username}</p>
                        {(u.first_name || u.last_name) && <p style={{ fontSize: '11px', color: '#94a3b8' }}>{u.first_name} {u.last_name}</p>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>
                    {role === 'restaurant_owner' && u.restaurant_name ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#FF6B00', fontWeight: '600' }}>
                        <Store size={12} /> {u.restaurant_name}
                      </span>
                    ) : u.email || '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <RoleDropdown
                      user={u}
                      onRoleChange={handleRoleChange}
                      onNeedRestaurant={u => setModal({ type: 'assign_restaurant', user: u })}
                    />
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {u.date_joined ? new Date(u.date_joined).toLocaleDateString('fr-MA') : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {role === 'restaurant_owner' && (
                        <button onClick={() => setModal({ type: 'assign_restaurant', user: u })} title="Change Restaurant"
                          style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff3e8', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Store size={14} color="#FF6B00" />
                        </button>
                      )}
                      <button onClick={() => setModal({ type: 'reset', user: u })} title="Reset Password"
                        style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef9c3', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <KeyRound size={14} color="#ca8a04" />
                      </button>
                      {!u.is_superuser && (
                        <button onClick={() => setModal({ type: 'delete', user: u })} title="Delete"
                          style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fee2e2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={14} color="#dc2626" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {modal?.type === 'add' && (
          <AddUserModal onClose={() => setModal(null)} onCreated={u => {
            setUsers(p => [u, ...p]);
            if (u._pendingRestaurant) setModal({ type: 'assign_restaurant', user: u });
          }} />
        )}
        {modal?.type === 'reset' && <ResetPasswordModal user={modal.user} onClose={() => setModal(null)} />}
        {modal?.type === 'delete' && <DeleteModal user={modal.user} onClose={() => setModal(null)} onDeleted={id => setUsers(p => p.filter(u => u.id !== id))} />}
        {modal?.type === 'assign_restaurant' && <AssignRestaurantModal user={modal.user} onClose={() => setModal(null)} onAssigned={handleRestaurantAssigned} />}
      </AnimatePresence>
    </div>
  );
}
