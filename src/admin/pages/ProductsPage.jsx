import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet, apiDelete } from '../../utils/api';

// Açıklama: Admin panelinde ürünleri listeleyen, silen ve güncelleme/ekleme yönlendirmesi yapan sayfa.
const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Ürünleri backend'den çek
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await apiGet('https://localhost:7098/api/Product');
        setProducts(data);
      } catch (err) {
        setError('Ürünler yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Ürün silme fonksiyonu
  const handleDelete = async (id) => {
    if (!window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    try {
      await apiDelete(`https://localhost:7098/api/Product/delete/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      setError('Ürün silinemedi.');
    }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-products-page">
      <h2>Ürünler</h2>
      <Link to="/admin/products/add" className="add-btn">Yeni Ürün Ekle</Link>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Görsel</th>
            <th>Ad</th>
            <th>Kategori</th>
            <th>Fiyat</th>
            <th>Stok</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.name} style={{ width: 60, height: 60, objectFit: 'cover' }} />
                )}
              </td>
              <td>{product.name}</td>
              <td>{product.categoryName}</td>
              <td>{product.price} ₺</td>
              <td>{product.stock}</td>
              <td>
                <Link to={`/admin/products/edit/${product.id}`}>Düzenle</Link>
                <button onClick={() => handleDelete(product.id)}>Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsPage; 