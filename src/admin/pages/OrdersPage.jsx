import React, { useEffect, useState } from 'react';
import { apiGet, apiPut } from '../../utils/api';
// Açıklama: Admin panelinde siparişleri listeleyen ve yönetim işlemleri yapan sayfa.
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    apiGet('https://localhost:7098/api/Order')
      .then(setOrders)
      .catch(() => setError('Siparişler yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);
  // Sipariş durumu güncelleme fonksiyonu
  const handleStatusChange = async (id, status) => {
    try {
      await apiPut(`https://localhost:7098/api/Order/update-status/${id}`, { status });
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    } catch {
      setError('Durum güncellenemedi.');
    }
  };
  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;
  return (
    <div className="admin-orders-page">
      <h2>Siparişler</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Kullanıcı</th>
            <th>Tarih</th>
            <th>Tutar</th>
            <th>Durum</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.userFullName}</td>
              <td>{order.orderDate}</td>
              <td>{order.totalAmount} ₺</td>
              <td>
                <select value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)}>
                  <option value="Pending">Beklemede</option>
                  <option value="Shipped">Kargolandı</option>
                  <option value="Delivered">Teslim Edildi</option>
                  <option value="Cancelled">İptal</option>
                </select>
              </td>
              <td>
                {/* Silme veya detay işlemleri eklenebilir */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default OrdersPage; 