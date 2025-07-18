import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import UsersPage from '../pages/UsersPage';
import ReviewsPage from '../pages/ReviewsPage';
import ProductsPage from '../pages/ProductsPage';
import AddProductPage from '../pages/AddProductPage';
import EditProductPage from '../pages/EditProductPage';
import CategoriesPage from '../pages/CategoriesPage';
import AddCategoryPage from '../pages/AddCategoryPage';
import EditCategoryPage from '../pages/EditCategoryPage';
import OrdersPage from '../pages/OrdersPage';
import RevenuePage from '../pages/RevenuePage';
import UserActivityPage from '../pages/UserActivityPage';
import AdminLayout from '../components/AdminLayout';

// Açıklama: Admin paneli için nested route yapısı. Tüm admin sayfaları ortak layout ile sarmalanır.
const AdminRoutes = () => {
  const role = localStorage.getItem('role');
  if (role !== 'Admin') {
    return <Navigate to="/" replace />;
  }
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/add" element={<AddProductPage />} />
        <Route path="products/edit/:id" element={<EditProductPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="categories/add" element={<AddCategoryPage />} />
        <Route path="categories/edit/:id" element={<EditCategoryPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="revenue" element={<RevenuePage />} />
        <Route path="user-activity" element={<UserActivityPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};
export default AdminRoutes;
