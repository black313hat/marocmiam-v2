import { useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';

export default function AdminApp() {
  const [adminUser, setAdminUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_user') || 'null'); } catch { return null; }
  });

  if (!adminUser) return <AdminLogin onLogin={setAdminUser} />;
  return <AdminPanel user={adminUser} onLogout={() => {
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
    setAdminUser(null);
  }} />;
}