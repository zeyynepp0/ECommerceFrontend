import React, { useEffect, useState } from 'react';
import { apiGet } from '../../utils/api';
// Açıklama: Admin panelinde gelir raporunu gösteren sayfa.
const RevenuePage = () => {
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    apiGet('https://localhost:7098/api/Admin/revenue?period=month')
      .then(setRevenue)
      .catch(() => setError('Gelir raporu yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;
  return (
    <div className="admin-revenue-page">
      <h2>Gelir Raporu</h2>
      {revenue && (
        <div>
          <p>Dönem: {revenue.period}</p>
          <p>Toplam Gelir: {revenue.totalRevenue} ₺</p>
        </div>
      )}
    </div>
  );
};
export default RevenuePage; 