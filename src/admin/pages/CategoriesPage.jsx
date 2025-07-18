import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet, apiDelete } from '../../utils/api';

// Açıklama: Admin panelinde kategorileri listeleyen, silen ve güncelleme/ekleme yönlendirmesi yapan sayfa.
const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Kategorileri backend'den çek
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await apiGet('https://localhost:7098/api/Category');
        setCategories(data);
      } catch (err) {
        setError('Kategoriler yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Kategori silme fonksiyonu
  const handleDelete = async (id) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    try {
      await apiDelete(`https://localhost:7098/api/Category/delete/${id}`);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      setError('Kategori silinemedi.');
    }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-categories-page">
      <h2>Kategoriler</h2>
      <Link to="/admin/categories/add" className="add-btn">Yeni Kategori Ekle</Link>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Görsel</th>
            <th>Ad</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(category => (
            <tr key={category.id}>
              <td>{category.id}</td>
              <td>
                {category.imageUrl && (
                  <img src={category.imageUrl} alt={category.name} style={{ width: 60, height: 60, objectFit: 'cover' }} />
                )}
              </td>
              <td>{category.name}</td>
              <td>
                <Link to={`/admin/categories/edit/${category.id}`}>Düzenle</Link>
                <button onClick={() => handleDelete(category.id)}>Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoriesPage; 