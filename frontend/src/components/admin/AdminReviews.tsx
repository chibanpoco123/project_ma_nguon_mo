import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminReviews.css';

interface Review {
  _id: string;
  product_id: {
    _id: string;
    name: string;
    images?: string[];
  };
  user_id: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  product_variant_id?: {
    color?: string;
    size?: string;
    variant_name?: string;
  };
  rating: number;
  comment: string;
  images: string[];
  videos: string[];
  likes: string[];
  is_hidden: boolean;
  created_at: string;
}

interface ReviewStatistics {
  totalReviews: number;
  hiddenReviews: number;
  visibleReviews: number;
  averageRating: number;
  starDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  reviewsWithMedia: number;
  reviewsWithoutMedia: number;
}

const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statistics, setStatistics] = useState<ReviewStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    rating: '',
    is_hidden: '',
    product_id: '',
    user_id: '',
    search: ''
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchReviews();
    fetchStatistics();
  }, [page, filters, sortBy, sortOrder]);

  const fetchReviews = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Bạn cần đăng nhập');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params: any = {
        page,
        limit,
        sortBy,
        sortOrder
      };

      if (filters.rating) params.rating = filters.rating;
      if (filters.is_hidden) params.is_hidden = filters.is_hidden;
      if (filters.product_id) params.product_id = filters.product_id;
      if (filters.user_id) params.user_id = filters.user_id;
      if (filters.search) params.search = filters.search;

      const res = await axios.get(
        'http://localhost:3000/api/reviews/admin/all',
        {
          headers: { Authorization: `Bearer ${token}` },
          params
        }
      );

      setReviews(res.data.reviews || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await axios.get(
        'http://localhost:3000/api/reviews/admin/statistics',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setStatistics(res.data);
    } catch (err: any) {
      console.error('Error fetching statistics:', err);
    }
  };

  const handleToggleVisibility = async (reviewId: string, currentStatus: boolean) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      await axios.put(
        `http://localhost:3000/api/reviews/admin/${reviewId}/visibility`,
        { is_hidden: !currentStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchReviews();
      fetchStatistics();
    } catch (err: any) {
      alert('Không thể cập nhật trạng thái đánh giá');
      console.error('Error toggling visibility:', err);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      await axios.delete(
        `http://localhost:3000/api/reviews/admin/${reviewId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert('Đã xóa đánh giá thành công');
      fetchReviews();
      fetchStatistics();
    } catch (err: any) {
      alert('Không thể xóa đánh giá');
      console.error('Error deleting review:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="admin-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'star-filled' : 'star-empty'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="admin-reviews">
      <h2>Quản lý Đánh giá Sản phẩm</h2>

      {/* Statistics */}
      {statistics && (
        <div className="review-statistics">
          <div className="stat-card">
            <div className="stat-label">Tổng đánh giá</div>
            <div className="stat-value">{statistics.totalReviews}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Đang hiển thị</div>
            <div className="stat-value">{statistics.visibleReviews}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Đã ẩn</div>
            <div className="stat-value">{statistics.hiddenReviews}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Điểm TB</div>
            <div className="stat-value">{statistics.averageRating.toFixed(1)}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-row">
          <input
            type="text"
            placeholder="Tìm kiếm theo nội dung..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="filter-input"
          />
          <select
            value={filters.rating}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
            className="filter-select"
          >
            <option value="">Tất cả sao</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
          <select
            value={filters.is_hidden}
            onChange={(e) => setFilters({ ...filters, is_hidden: e.target.value })}
            className="filter-select"
          >
            <option value="">Tất cả</option>
            <option value="false">Đang hiển thị</option>
            <option value="true">Đã ẩn</option>
          </select>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-');
              setSortBy(by);
              setSortOrder(order);
            }}
            className="filter-select"
          >
            <option value="created_at-desc">Mới nhất</option>
            <option value="created_at-asc">Cũ nhất</option>
            <option value="rating-desc">Sao cao → thấp</option>
            <option value="rating-asc">Sao thấp → cao</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {loading && <div className="loading">Đang tải...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && reviews.length === 0 && (
        <div className="no-reviews">Không có đánh giá nào</div>
      )}

      {!loading && reviews.length > 0 && (
        <>
          <div className="reviews-table">
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Người dùng</th>
                  <th>Đánh giá</th>
                  <th>Nội dung</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review._id} className={review.is_hidden ? 'hidden-review' : ''}>
                    <td>
                      <div className="product-info">
                        {review.product_id.images?.[0] && (
                          <img
                            src={review.product_id.images[0]}
                            alt={review.product_id.name}
                            className="product-thumb"
                          />
                        )}
                        <span>{review.product_id.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="user-info">
                        {review.user_id.avatar && (
                          <img
                            src={review.user_id.avatar}
                            alt={review.user_id.name}
                            className="user-avatar"
                          />
                        )}
                        <div>
                          <div>{review.user_id.name}</div>
                          <div className="user-email">{review.user_id.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {renderStars(review.rating)}
                      {review.product_variant_id && (
                        <div className="variant-info">
                          {review.product_variant_id.color && (
                            <span>Màu: {review.product_variant_id.color}</span>
                          )}
                          {review.product_variant_id.size && (
                            <span>Size: {review.product_variant_id.size}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="comment-cell">
                        {review.comment ? (
                          <p>{review.comment}</p>
                        ) : (
                          <span className="no-comment">Không có bình luận</span>
                        )}
                        {(review.images?.length > 0 || review.videos?.length > 0) && (
                          <span className="has-media">📷 Có media</span>
                        )}
                      </div>
                    </td>
                    <td>{formatDate(review.created_at)}</td>
                    <td>
                      <span className={`status-badge ${review.is_hidden ? 'hidden' : 'visible'}`}>
                        {review.is_hidden ? 'Đã ẩn' : 'Hiển thị'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-toggle"
                          onClick={() => handleToggleVisibility(review._id, review.is_hidden)}
                          title={review.is_hidden ? 'Hiện đánh giá' : 'Ẩn đánh giá'}
                        >
                          {review.is_hidden ? '👁️' : '🙈'}
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(review._id)}
                          title="Xóa đánh giá"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                « Trước
              </button>
              <span>Trang {page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Sau »
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminReviews;
