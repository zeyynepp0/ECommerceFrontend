import React, { useEffect, useState } from 'react';
import { apiGet } from '../../utils/api';
// Açıklama: Admin panelinde kullanıcı aktivitelerini gösteren sayfa.
const UserActivityPage = () => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    apiGet('https://localhost:7098/api/Admin/user-activity')
      .then(setActivity)
      .catch(() => setError('Aktiviteler yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;
  return (
    <div className="admin-user-activity-page">
      <h2>Kullanıcı Aktiviteleri</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Ad Soyad</th>
            <th>E-posta</th>
            <th>Son Sipariş</th>
            <th>Son Yorum</th>
            <th>Toplam Sipariş</th>
            <th>Toplam Yorum</th>
          </tr>
        </thead>
        <tbody>
          {activity.map((item, i) => (
            <tr key={i}>
              <td>{item.fullName}</td>
              <td>{item.email}</td>
              <td>{item.lastOrderDate ? new Date(item.lastOrderDate).toLocaleString() : 'Yok'}</td>
              <td>{item.lastReviewDate ? new Date(item.lastReviewDate).toLocaleString() : 'Yok'}</td>
              <td>{item.totalOrders}</td>
              <td>{item.totalReviews}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default UserActivityPage; 