import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReviewForm.css';

interface ReviewFormProps {
  productId: string;
  productVariantId?: string;
  onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, productVariantId, onReviewSubmitted }) => {
  const [canReview, setCanReview] = useState(false);
  const [checking, setChecking] = useState(true);
  const [canReviewMessage, setCanReviewMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kiểm tra user có thể đánh giá không
  useEffect(() => {
    const checkCanReview = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setCanReview(false);
        setCanReviewMessage('Bạn cần đăng nhập để đánh giá sản phẩm');
        setChecking(false);
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:3000/api/reviews/${productId}/can-review`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setCanReview(res.data.canReview);
        setCanReviewMessage(res.data.message);
      } catch (err: any) {
        console.error('Error checking can review:', err);
        setCanReview(false);
        if (err.response?.status === 401) {
          setCanReviewMessage('Bạn cần đăng nhập để đánh giá sản phẩm');
        } else {
          setCanReviewMessage('Không thể kiểm tra quyền đánh giá');
        }
      } finally {
        setChecking(false);
      }
    };

    if (productId) {
      checkCanReview();
    }
  }, [productId]);

  // Submit đánh giá
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Bạn cần đăng nhập để đánh giá');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await axios.post(
        'http://localhost:3000/api/reviews',
        {
          product_id: productId,
          product_variant_id: productVariantId || null,
          rating,
          comment: comment.trim(),
          images,
          videos: []
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Reset form
      setRating(0);
      setComment('');
      setImages([]);
      setError(null);

      // Thông báo và refresh danh sách đánh giá
      alert('Đánh giá thành công!');
      onReviewSubmitted();
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Render sao rating
  const renderStarRating = () => {
    return (
      <div className="star-rating-input">
        <label>Đánh giá của bạn *</label>
        <div className="stars-container">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              ★
            </span>
          ))}
        </div>
        {rating > 0 && (
          <span className="rating-text">
            {rating === 1 && 'Rất không hài lòng'}
            {rating === 2 && 'Không hài lòng'}
            {rating === 3 && 'Bình thường'}
            {rating === 4 && 'Hài lòng'}
            {rating === 5 && 'Rất hài lòng'}
          </span>
        )}
      </div>
    );
  };

  if (checking) {
    return (
      <div className="review-form-container">
        <div className="loading">Đang kiểm tra...</div>
      </div>
    );
  }

  if (!canReview) {
    return (
      <div className="review-form-container">
        <div className="cannot-review-message">
          <h3>Viết đánh giá</h3>
          <p>{canReviewMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-form-container">
      <h3 className="review-form-title">Viết đánh giá của bạn</h3>
      
      <form onSubmit={handleSubmit} className="review-form">
        {renderStarRating()}

        <div className="form-group">
          <label htmlFor="comment">Nhận xét của bạn</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            rows={5}
            maxLength={1000}
          />
          <span className="char-count">{comment.length}/1000</span>
        </div>

        {/* Note: Image upload sẽ được thêm sau nếu cần */}
        {/* <div className="form-group">
          <label>Hình ảnh đính kèm (tùy chọn)</label>
          <input type="file" accept="image/*" multiple />
        </div> */}

        {error && <div className="error-message">{error}</div>}

        <button 
          type="submit" 
          className="submit-review-btn"
          disabled={submitting || rating === 0}
        >
          {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
