import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost, apiGet } from '../../utils/api';

// Açıklama: Admin panelinde yeni ürün ekleme ve resim yükleme işlemlerini yapan sayfa.
const AddProductPage = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Kategorileri backend'den çek
  useEffect(() => {
    apiGet('https://localhost:7098/api/Category')
      .then(setCategories)
      .catch(() => setError('Kategoriler yüklenemedi.'));
  }, []);

  // Form input değişikliği
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Resim seçildiğinde dosyayı state'e al
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Ürün ekleme işlemi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let imageUrl = '';
      // Eğer resim seçildiyse önce resmi yükle
      if (imageFile) {
        const imgData = new FormData();
        imgData.append('image', imageFile);
        imgData.append('productName', form.name); // Ürün adını da gönder
        const res = await apiPost('https://localhost:7098/api/Product/upload-image', imgData);
        imageUrl = res.imageUrl;
      }
      // Ürün bilgisini backend'e gönder
      await apiPost('https://localhost:7098/api/Product/add', {
        ...form,
        imageUrl: imageUrl
      });
      navigate('/admin/products');
    } catch (err) {
      setError('Ürün eklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-add-product-page">
      <h2>Yeni Ürün Ekle</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Ürün Adı</label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Açıklama</label>
          <textarea name="description" value={form.description} onChange={handleChange} required />
        </div>
        <div>
          <label>Fiyat</label>
          <input name="price" type="number" value={form.price} onChange={handleChange} required />
        </div>
        <div>
          <label>Stok</label>
          <input name="stock" type="number" value={form.stock} onChange={handleChange} required />
        </div>
        <div>
          <label>Kategori</label>
          <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
            <option value="">Seçiniz</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Ürün Görseli</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Ekleniyor...' : 'Ekle'}</button>
      </form>
    </div>
  );
};

export default AddProductPage;
