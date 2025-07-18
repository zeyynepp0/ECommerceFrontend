import React from 'react';
import { FiStar, FiEdit2, FiTrash2 } from 'react-icons/fi';
import '../css/ReviewItem.css';

const ReviewItem = ({ review, darkMode, isOwn, onEdit, onDelete }) => {
  const isDeleted = review.comment === 'Bu yorum silinmiştir';
  return (
    <div className={`review-item ${darkMode ? 'dark' : ''} ${isDeleted ? 'deleted' : ''}`}>
      <div className="review-header">
        <div className="reviewer-info">
          <span className="reviewer-name">{review.userFullName || 'Anonim Kullanıcı'}</span>
          <span className="review-date">
            {new Date(review.createdAt).toLocaleDateString('tr-TR')}
          </span>
        </div>
        <div className="review-rating">
          {[...Array(5)].map((_, i) => (
            <FiStar
              key={i}
              fill={i < review.rating ? '#FFD700' : 'none'}
            />
          ))}
        </div>
        {isOwn && !isDeleted && (
          <div className="review-actions">
            <button onClick={() => onEdit(review)} title="Düzenle"><FiEdit2 /></button>
            <button onClick={() => onDelete(review)} title="Sil"><FiTrash2 /></button>
          </div>
        )}
      </div>
      <div className="review-content">
        <p>{isDeleted ? 'Bu yorum silinmiştir' : review.comment}</p>
        {review.lastModifiedBy && review.lastModifiedAt && !isDeleted && (
          <span className="review-modified-info">
            ({review.lastModifiedBy === 'admin' ? 'Admin' : 'Kullanıcı'} tarafından {new Date(review.lastModifiedAt).toLocaleDateString('tr-TR')} tarihinde değiştirildi)
          </span>
        )}
      </div>
    </div>
  );
};

export default ReviewItem;