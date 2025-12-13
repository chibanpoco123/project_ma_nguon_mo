import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewForm from './ReviewForm';
import './ProductReviews.css';

interface Review {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  images: string[];
  videos: string[];
  product_variant_id?: {
    color?: string;
    size?: string;
    variant_name?: string;
  };
  likes: string[];
  created_at: string;
}

interface ReviewStatistics {
  averageRating: number;
  totalReviews: number;
  starDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [statistics, setStatistics] = useState<ReviewStatistics | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filterStar, setFilterStar] = useState<number | null>(null);
  const [filterHasComment, setFilterHasComment] = useState(false);
  const [filterHasMedia, setFilterHasMedia] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [componentError, setComponentError] = useState<string | null>(null);

  // Lấy thống kê đánh giá
  const fetchStatistics = async () => {
    try {
      console.log('📊 [ProductReviews] Fetching statistics for productId:', productId);
      const res = await axios.get(`http://localhost:3000/api/reviews/${productId}/statistics`);
      console.log('✅ [ProductReviews] Statistics response:', res.data);
      setStatistics(res.data);
    } catch (err: any) {
      console.error('❌ [ProductReviews] Lỗi lấy thống kê:', err);
      // Nếu lỗi 404, có thể chưa có đánh giá nào, không cần hiển thị lỗi
      if (err.response?.status === 404) {
        setStatistics({ averageRating: 0, totalReviews: 0, starDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
      } else {
        // Set default statistics để component vẫn render được
        setStatistics({ averageRating: 0, totalReviews: 0, starDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
      }
    }
  };

  // Lấy danh sách đánh giá
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (filterStar) params.star = filterStar;
      if (filterHasComment) params.hasComment = 'true';
      if (filterHasMedia) params.hasMedia = 'true';

      console.log('📝 [ProductReviews] Fetching reviews for productId:', productId, 'with params:', params);
      const res = await axios.get(`http://localhost:3000/api/reviews/${productId}`, { params });
      console.log('✅ [ProductReviews] Reviews response:', res.data);
      
      // Xử lý response có thể là array hoặc object với message
      if (Array.isArray(res.data)) {
        setReviews(res.data);
      } else if (res.data.reviews && Array.isArray(res.data.reviews)) {
        setReviews(res.data.reviews);
      } else if (res.data.message) {
        // Nếu có message như "Chưa có đánh giá", set reviews rỗng
        setReviews([]);
      } else {
        setReviews([]);
      }
    } catch (err: any) {
      console.error('Lỗi lấy đánh giá:', err);
      // Nếu lỗi 404 hoặc chưa có đánh giá, không hiển thị error
      if (err.response?.status === 404 || err.response?.status === 400) {
        setReviews([]);
      } else {
        setError('Không thể tải đánh giá. Vui lòng thử lại.');
        setReviews([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!productId) {
      setComponentError('Không tìm thấy mã sản phẩm');
      setLoading(false);
      return;
    }

    console.log('🔄 [ProductReviews] useEffect triggered for productId:', productId);
    
    try {
      fetchStatistics();
      fetchReviews();
    } catch (err) {
      console.error('❌ [ProductReviews] Error in useEffect:', err);
      setError('Đã xảy ra lỗi khi tải dữ liệu');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, filterStar, filterHasComment, filterHasMedia]);

  // Like/Unlike đánh giá
  const handleLike = async (reviewId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('Bạn cần đăng nhập để thích đánh giá');
      return;
    }

    try {
      await axios.post(
        `http://localhost:3000/api/reviews/${reviewId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      // Refresh reviews để cập nhật số lượt like
      fetchReviews();
      fetchStatistics();
    } catch (err: any) {
      console.error('Lỗi like đánh giá:', err);
      alert('Không thể thích đánh giá');
    }
  };

  // Format ngày tháng
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Chưa rõ ngày';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Chưa rõ ngày';
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Chưa rõ ngày';
    }
  };

  // Render sao
  const renderStars = (rating: number) => {
    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'star-filled' : 'star-empty'}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const token = localStorage.getItem('accessToken');
  let currentUserId = null;
  
  // Safely parse JWT token
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentUserId = payload.id || payload._id || null;
    }
  } catch (e) {
    console.error('Error parsing token:', e);
    currentUserId = null;
  }

  // Early return nếu không có productId
  if (!productId) {
    return (
      <div className="product-reviews">
        <h2 className="reviews-title">Đánh giá sản phẩm</h2>
        <div className="error">Không tìm thấy mã sản phẩm</div>
      </div>
    );
  }

  // Nếu có lỗi component, hiển thị thông báo
  if (componentError) {
    return (
      <div className="product-reviews">
        <h2 className="reviews-title">Đánh giá sản phẩm</h2>
        <div className="error">{componentError}</div>
      </div>
    );
  }

  // Handler để refresh reviews sau khi submit
  const handleReviewSubmitted = () => {
    try {
      fetchStatistics();
      fetchReviews();
    } catch (err) {
      console.error('Error refreshing reviews:', err);
    }
  };

  return (
    <div className="product-reviews">
      <h2 className="reviews-title">Đánh giá sản phẩm</h2>

      {/* Form đánh giá */}
      <ReviewForm 
        productId={productId} 
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* Thống kê và điểm trung bình */}
      {statistics && statistics.totalReviews !== undefined && (
        <div className="reviews-statistics">
          <div className="avg-rating-box">
            <div className="avg-rating-number">
              {(statistics.averageRating || 0).toFixed(1)}
            </div>
            <div className="avg-rating-stars">
              {renderStars(Math.round(statistics.averageRating || 0))}
            </div>
            <div className="avg-rating-text">
              {statistics.totalReviews || 0} đánh giá
            </div>
          </div>

          <div className="star-distribution">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = statistics.starDistribution?.[star as keyof typeof statistics.starDistribution] || 0;
              const percentage = (statistics.totalReviews || 0) > 0
                ? (count / statistics.totalReviews) * 100
                : 0;
              
              return (
                <div key={star} className="star-distribution-item">
                  <span className="star-label">{star} sao</span>
                  <div className="star-progress-bar">
                    <div
                      className="star-progress-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="star-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bộ lọc */}
      <div className="reviews-filters">
        <button
          className={`filter-btn ${filterStar === null && !filterHasComment && !filterHasMedia ? 'active' : ''}`}
          onClick={() => {
            setFilterStar(null);
            setFilterHasComment(false);
            setFilterHasMedia(false);
          }}
        >
          Tất cả
        </button>
        
        {[5, 4, 3, 2, 1].map((star) => (
          <button
            key={star}
            className={`filter-btn ${filterStar === star ? 'active' : ''}`}
            onClick={() => {
              setFilterStar(star);
              setFilterHasComment(false);
              setFilterHasMedia(false);
            }}
          >
            {star} sao
          </button>
        ))}

        <button
          className={`filter-btn ${filterHasComment ? 'active' : ''}`}
          onClick={() => {
            setFilterHasComment(!filterHasComment);
            setFilterStar(null);
            setFilterHasMedia(false);
          }}
        >
          Có bình luận
        </button>

        <button
          className={`filter-btn ${filterHasMedia ? 'active' : ''}`}
          onClick={() => {
            setFilterHasMedia(!filterHasMedia);
            setFilterStar(null);
            setFilterHasComment(false);
          }}
        >
          Có hình ảnh/video
        </button>
      </div>

      {/* Danh sách đánh giá */}
      <div className="reviews-list">
        {loading && <div className="loading">Đang tải đánh giá...</div>}
        
        {error && <div className="error">{error}</div>}

        {!loading && !error && reviews.length === 0 && (
          <div className="no-reviews">
            <p>Chưa có đánh giá nào cho sản phẩm này.</p>
            <p>Hãy là người đầu tiên đánh giá sản phẩm này!</p>
          </div>
        )}

        {!loading && !error && reviews.length > 0 && reviews.map((review) => {
          // Kiểm tra user đã like chưa (so sánh string)
          const isLiked = token && currentUserId && review.likes && Array.isArray(review.likes) && review.likes.some(
            (likeId: any) => {
              const likeIdStr = likeId?.toString ? likeId.toString() : String(likeId);
              const userIdStr = currentUserId?.toString ? currentUserId.toString() : String(currentUserId);
              return likeIdStr === userIdStr;
            }
          );
          
          return (
            <div key={review._id} className="review-item">
              {/* Header: User info + Rating + Date */}
              <div className="review-header">
                <div className="review-user">
                  <div className="review-avatar">
                    {review.user_id?.avatar ? (
                      <img src={review.user_id.avatar} alt={review.user_id?.name || 'User'} />
                    ) : (
                      <div className="avatar-placeholder">
                        {(review.user_id?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="review-user-info">
                    <div className="review-username">{review.user_id?.name || 'Người dùng'}</div>
                    <div className="review-date">{formatDate(review.created_at)}</div>
                  </div>
                </div>
                <div className="review-rating-date">
                  {renderStars(review.rating || 0)}
                </div>
              </div>

              {/* Product variant (color, size) */}
              {review.product_variant_id && (
                <div className="review-variant">
                  {review.product_variant_id.color && (
                    <span className="variant-tag">
                      Màu: {review.product_variant_id.color}
                    </span>
                  )}
                  {review.product_variant_id.size && (
                    <span className="variant-tag">
                      Size: {review.product_variant_id.size}
                    </span>
                  )}
                </div>
              )}

              {/* Comment */}
              {review.comment && (
                <div className="review-comment">{review.comment}</div>
              )}

              {/* Images */}
              {review.images && review.images.length > 0 && (
                <div className="review-images">
                  {review.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Review ${idx + 1}`}
                      className="review-image"
                      onClick={() => {
                        // Có thể mở lightbox ở đây
                        window.open(img, '_blank');
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Videos */}
              {review.videos && review.videos.length > 0 && (
                <div className="review-videos">
                  {review.videos.map((video, idx) => (
                    <video
                      key={idx}
                      src={video}
                      controls
                      className="review-video"
                    />
                  ))}
                </div>
              )}

              {/* Like button */}
              <div className="review-footer">
                <button
                  className={`like-btn ${isLiked ? 'liked' : ''}`}
                  onClick={() => handleLike(review._id)}
                  disabled={!token}
                >
                  {isLiked ? '❤️' : '🤍'} Thích ({review.likes?.length || 0})
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductReviews;
