import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../../utils/api';

// Açıklama: Admin panelinde yeni kategori ekleme ve resim yükleme işlemlerini yapan sayfa.
const AddCategoryPage = () => {
  const [form, setForm] = useState({
    name: '',
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  // Kategori ekleme işlemi
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
        imgData.append('categoryName', form.name); // Kategori adını da gönder
        const res = await apiPost('https://localhost:7098/api/Category/upload-image', imgData);
        imageUrl = res.imageUrl;
      }
      // Kategori bilgisini backend'e gönder
      await apiPost('https://localhost:7098/api/Category/add', {
        ...form,
        imageUrl: imageUrl
      });
      navigate('/admin/categories');
    } catch (err) {
      setError('Kategori eklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-add-category-page">
      <h2>Yeni Kategori Ekle</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Kategori Adı</label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Kategori Görseli</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Ekleniyor...' : 'Ekle'}</button>
      </form>
    </div>
  );
};

export default AddCategoryPage; 