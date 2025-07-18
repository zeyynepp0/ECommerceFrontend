import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPut, apiPost } from '../../utils/api';

// Açıklama: Admin panelinde ürün güncelleme ve resim değiştirme işlemlerini yapan sayfa.
const EditProductPage = () => {
  const { id } = useParams(); // URL'den ürün ID'sini al
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
  const API_BASE = "https://localhost:7098";

  // Ürün ve kategorileri backend'den çek
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [product, cats] = await Promise.all([
          apiGet(`https://localhost:7098/api/Product/${id}`),
          apiGet('https://localhost:7098/api/Category')
        ]);
        setForm({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId: product.categoryId,
          imageUrl: product.imageUrl
        });
        setCategories(cats);
      } catch {
        setError('Veriler yüklenemedi.');
      }
    };
    fetchData();
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

  // Ürün güncelleme işlemi
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
        imgData.append('productName', form.name); // Ürün adını da gönder
        const res = await apiPost('https://localhost:7098/api/Product/upload-image', imgData);
        imageUrl = res.imageUrl;
      }
      // Ürün bilgisini backend'e gönder
      await apiPut(`https://localhost:7098/api/Product/update/${id}`, {
        ...form,
        imageUrl: imageUrl
      });
      navigate('/admin/products');
    } catch (err) {
      setError('Ürün güncellenemedi.');
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div>{error}</div>;

  return (
    <div className="admin-edit-product-page">
      <h2>Ürün Güncelle</h2>
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
          <label>Mevcut Görsel</label>
          {form.imageUrl && <img src={form.imageUrl.startsWith('http') ? form.imageUrl : API_BASE + form.imageUrl} alt="Ürün" style={{ width: 80, height: 80, objectFit: 'cover' }} />}
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

export default EditProductPage; 