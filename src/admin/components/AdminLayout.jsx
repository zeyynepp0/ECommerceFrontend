import React from 'react';
import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';
import '../../admin/css/AdminLayout.css'; // Ortak admin layout CSS'i

// Açıklama: Tüm admin sayfalarında kullanılacak ortak layout. Sidebar ve içerik alanı içerir.
const AdminLayout = () => (
  <div className="admin-layout">
    <AdminSidebar />
    <main className="admin-main-content">
      <Outlet /> {/* Nested route'lar burada render edilir */}
    </main>
  </div>
);
export default AdminLayout; 