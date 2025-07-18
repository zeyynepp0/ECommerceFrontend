import React, { useState, useEffect } from 'react';
import { FiStar, FiSend } from 'react-icons/fi';
import '../css/ReviewForm.css';

const ReviewForm = ({ onSubmit, darkMode, review }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setComment(review.comment);
      setName(review.userFullName || '');
    }
  }, [review]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      rating,
      comment,
      name,
      reviewId: review ? review.id : undefined,
      isUpdate: !!review
    });
    setComment('');
    setName('');
    setRating(5);
  };

  return (
    <form 
      className={`review-form ${darkMode ? 'dark' : ''}`}
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label>Adınız (Opsiyonel)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="İsim"
          disabled={!!review}
        />
      </div>
      <div className="form-group">
        <label>Değerlendirme</label>
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <FiStar
              key={star}
              fill={star <= rating ? '#FFD700' : 'none'}
              onClick={() => setRating(star)}
              className="star-icon"
            />
          ))}
        </div>
      </div>
      <div className="form-group">
        <label>Yorumunuz</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ürün hakkındaki düşünceleriniz..."
          required
          rows="4"
        />
      </div>
      <button type="submit" className="submit-review">
        <FiSend /> {review ? 'Güncelle' : 'Gönder'}
      </button>
    </form>
  );
};

export default ReviewForm;