import React from 'react';
import { NavLink } from 'react-router-dom';
// Açıklama: Admin paneli için ortak sidebar/menu componenti.
const AdminSidebar = () => (
  <aside className="admin-sidebar">
    <nav>
      <ul>
        <li><NavLink to="/admin" end>Dashboard</NavLink></li>
        <li><NavLink to="/admin/users">Kullanıcılar</NavLink></li>
        <li><NavLink to="/admin/products">Ürünler</NavLink></li>
        <li><NavLink to="/admin/categories">Kategoriler</NavLink></li>
        <li><NavLink to="/admin/orders">Siparişler</NavLink></li>
        <li><NavLink to="/admin/reviews">Yorumlar</NavLink></li>
        <li><NavLink to="/admin/revenue">Gelir Raporu</NavLink></li>
        <li><NavLink to="/admin/user-activity">Kullanıcı Aktiviteleri</NavLink></li>
      </ul>
    </nav>
  </aside>
);
export default AdminSidebar; 