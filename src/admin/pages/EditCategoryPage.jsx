import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPut, apiPost } from '../../utils/api';

// Açıklama: Admin panelinde kategori güncelleme ve resim değiştirme işlemlerini yapan sayfa.
const EditCategoryPage = () => {
  const { id } = useParams(); // URL'den kategori ID'sini al
  const [form, setForm] = useState({
    name: '',
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_BASE = "https://localhost:7098";

  // Kategori bilgisini backend'den çek
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const category = await apiGet(`https://localhost:7098/api/Category/${id}`);
        setForm({
          name: category.name,
          imageUrl: category.imageUrl
        });
      } catch {
        setError('Kategori yüklenemedi.');
      }
    };
    fetchCategory();
  }, [id]);

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

  // Kategori güncelleme işlemi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let imageUrl = form.imageUrl;
      // Eğer yeni resim seçildiyse önce resmi yükle
      if (imageFile) {
        const imgData = new FormData();
        imgData.append('image', imageFile);
        imgData.append('categoryName', form.name); // Kategori adını da gönder
        const res = await apiPost('https://localhost:7098/api/Category/upload-image', imgData);
        imageUrl = res.imageUrl;
      }
      // Kategori bilgisini backend'e gönder
      await apiPut(`https://localhost:7098/api/Category/update/${id}`, {
        ...form,
        imageUrl: imageUrl
      });
      navigate('/admin/categories');
    } catch (err) {
      setError('Kategori güncellenemedi.');
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div>{error}</div>;

  return (
    <div className="admin-edit-category-page">
      <h2>Kategori Güncelle</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Kategori Adı</label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Mevcut Görsel</label>
          {form.imageUrl && <img src={form.imageUrl.startsWith('http') ? form.imageUrl : API_BASE + form.imageUrl} alt="Kategori" style={{ width: 80, height: 80, objectFit: 'cover' }} />}
        </div>
        <div>
          <label>Yeni Görsel (değiştirmek için)</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Güncelleniyor...' : 'Güncelle'}</button>
      </form>
    </div>
  );
};

export default EditCategoryPage; 