import React, { useEffect, useState } from 'react';
import { apiGet, apiDelete, apiPut, parseApiError } from '../../utils/api';
import ReviewForm from '../../components/ReviewForm';
// Açıklama: Admin panelinde ürün yorumlarını listeleyen ve yönetim işlemleri yapan sayfa.
const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [showEditFormId, setShowEditFormId] = useState(null);
  useEffect(() => {
    apiGet('https://localhost:7098/api/Review?includeDeleted=true')
      .then(setReviews)
      .catch(() => setError('Yorumlar yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);
  const handleDelete = async (review) => {
    if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    try {
      await apiDelete(`https://localhost:7098/api/Review/${review.id}?deletedBy=admin`);
      setReviews(reviews.map(r => r.id === review.id ? { ...r, comment: 'Bu yorum silinmiştir' } : r));
    } catch {
      setError('Yorum silinemedi.');
    }
  };
  const handleEdit = (review) => {
    setEditingReview(review);
    setShowEditFormId(review.id);
  };
  const handleEditSubmit = async (data) => {
    try {
      await apiPut(`https://localhost:7098/api/Review`, {
        id: data.reviewId,
        content: data.comment,
        rating: data.rating,
        lastModifiedBy: 'admin'
      });
      setReviews(reviews.map(r => r.id === data.reviewId ? { ...r, comment: data.comment, rating: data.rating, lastModifiedBy: 'admin', lastModifiedAt: new Date().toISOString() } : r));
      setShowEditFormId(null);
      setEditingReview(null);
    } catch (err) {
      setError('Yorum güncellenemedi: ' + parseApiError(err));
    }
  };
  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;
  return (
    <div className="admin-reviews-page">
      <h2>Yorumlar</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Kullanıcı</th>
            <th>Ürün</th>
            <th>Yorum</th>
            <th>Puan</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map(review => (
            <tr key={review.id} className={review.comment === 'Bu yorum silinmiştir' ? 'deleted' : ''}>
              <td>{review.id}</td>
              <td>{review.userFullName}</td>
              <td>{review.productName}</td>
              <td>
                {showEditFormId === review.id ? (
                  <ReviewForm
                    onSubmit={handleEditSubmit}
                    review={editingReview}
                  />
                ) : (
                  <>
                    {review.comment}
                    {review.lastModifiedBy && review.lastModifiedAt && review.comment !== 'Bu yorum silinmiştir' && (
                      <span className="review-modified-info">
                        <br/>
                        ({review.lastModifiedBy === 'admin' ? 'Admin' : 'Kullanıcı'} tarafından {new Date(review.lastModifiedAt).toLocaleDateString('tr-TR')} tarihinde değiştirildi)
                      </span>
                    )}
                  </>
                )}
              </td>
              <td>{review.rating}</td>
              <td>
                {review.comment !== 'Bu yorum silinmiştir' && (
                  <>
                    <button onClick={() => handleEdit(review)}>Düzenle</button>
                    <button onClick={() => handleDelete(review)}>Sil</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default ReviewsPage;
