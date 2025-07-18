import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { apiGet } from '../../utils/api';
import 'chart.js/auto';
import { Link } from 'react-router-dom';
// Açıklama: Admin paneli ana sayfası, özet bilgiler ve hızlı erişim linkleri içerir.
const DashboardPage = () => {
  // Özet veriler ve grafik için state
  const [summary, setSummary] = useState({ users: 0, products: 0, orders: 0, revenue: 0, categories: 0, reviews: 0, totalRevenue: 0 });
  const [graphData, setGraphData] = useState(null);
  useEffect(() => {
    // Özet verileri backend'den çek (örnek endpointler, backend'e göre uyarlanabilir)
    apiGet('https://localhost:7098/api/Admin/dashboard')
      .then(data => {
        setSummary({
          users: data.totalUsers,
          products: data.totalProducts,
          orders: data.totalOrders,
          revenue: data.totalRevenue,
          categories: data.totalCategories,
          reviews: data.totalReviews,
          totalRevenue: data.totalRevenue
        });
        setGraphData({
          labels: data.revenueGraph.labels,
          datasets: [
            {
              label: 'Aylık Gelir',
              data: data.revenueGraph.values,
              backgroundColor: '#eebbc3',
            },
          ],
        });
      })
      .catch(() => {});
  }, []);
  return (
    <div className="admin-dashboard-page">
      <h2>Admin Dashboard</h2>
      <div className="dashboard-summary-boxes">
        <div className="dashboard-summary-box">Kullanıcılar<br /><b>{summary.users}</b></div>
        <div className="dashboard-summary-box">Ürünler<br /><b>{summary.products}</b></div>
        <div className="dashboard-summary-box">Kategoriler<br /><b>{summary.categories}</b></div>
        <div className="dashboard-summary-box">Siparişler<br /><b>{summary.orders}</b></div>
        <div className="dashboard-summary-box">Yorumlar<br /><b>{summary.reviews}</b></div>
        <div className="dashboard-summary-box">Toplam Gelir<br /><b>{summary.totalRevenue} ₺</b></div>
      </div>
      <div className="dashboard-graph-area">
        <h4>Aylık Gelir Grafiği</h4>
        {graphData ? <Bar data={graphData} /> : <div>Grafik yükleniyor...</div>}
      </div>
 
    </div>
  );
};
export default DashboardPage;
