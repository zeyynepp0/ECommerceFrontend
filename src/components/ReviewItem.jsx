import React from 'react';
import { FiStar } from 'react-icons/fi';
import '../css/ReviewItem.css';

const ReviewItem = ({ review, darkMode }) => {
  return (
    <div className={`review-item ${darkMode ? 'dark' : ''}`}>
      <div className="review-header">
        <div className="reviewer-info">
          <span className="reviewer-name">{review.name || 'Anonim Kullanıcı'}</span>
          <span className="review-date">
            {new Date(review.date).toLocaleDateString('tr-TR')}
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
      </div>
      <div className="review-content">
        <p>{review.comment}</p>
      </div>
    </div>
  );
};

export default ReviewItem;