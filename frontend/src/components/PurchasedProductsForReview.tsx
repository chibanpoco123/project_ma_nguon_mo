import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './PurchasedProductsForReview.css';

interface PurchasedProduct {
  product_id: string;
  product: {
    _id: string;
    name: string;
    images?: string[];
    price: number;
  };
  order_id: string;
  order_number: string;
  purchased_date: string;
  quantity: number;
}

const PurchasedProductsForReview: React.FC = () => {
  const [products, setProducts] = useState<PurchasedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPurchasedProducts();
  }, []);

  const fetchPurchasedProducts = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Bạn cần đăng nhập để xem sản phẩm đã mua');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching purchased products...');
      
      const res = await axios.get(
        'http://localhost:3000/api/reviews/purchased/for-review',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('✅ Response received:', res.data);
      setProducts(res.data.products || []);
      setError(null);
      
      if (res.data.message) {
        console.log('ℹ️ Message:', res.data.message);
      }
    } catch (err: any) {
      console.error('❌ Error fetching purchased products:', err);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error status:', err.response?.status);
      console.error('❌ Error data:', err.response?.data);
      console.error('❌ Request URL:', 'http://localhost:3000/api/reviews/purchased/for-review');
      
      if (err.response?.status === 401) {
        setError('Bạn cần đăng nhập để xem sản phẩm đã mua');
      } else if (err.response?.status === 404) {
        setError(`Không tìm thấy API endpoint. Vui lòng kiểm tra backend server có đang chạy không.`);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(`Không thể tải danh sách sản phẩm đã mua: ${err.message || 'Lỗi không xác định'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Chưa rõ ngày';
    }
  };

  const handleReviewProduct = (productId: string) => {
    navigate(`/product/${productId}`, { state: { showReviewTab: true } });
  };

  if (loading) {
    return (
      <div className="purchased-products-container">
        <div className="loading">Đang tải danh sách sản phẩm...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="purchased-products-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="purchased-products-container">
      <div className="section-header">
        <h2>Sản phẩm đã mua - Chờ đánh giá</h2>
        <p className="section-description">
          Các sản phẩm bạn đã thanh toán nhưng chưa đánh giá
        </p>
      </div>

      {products.length === 0 ? (
        <div className="no-products">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
            <h3 style={{ marginBottom: '10px', color: '#333' }}>
              Chưa có sản phẩm nào cần đánh giá
            </h3>
            <p style={{ color: '#666', marginBottom: '10px' }}>
              Bạn chưa có sản phẩm nào cần đánh giá.
            </p>
            <p style={{ color: '#999', fontSize: '14px' }}>
              Khi bạn mua và thanh toán sản phẩm, sản phẩm sẽ xuất hiện ở đây để bạn có thể đánh giá.
            </p>
          </div>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((item) => (
            <div key={`${item.product_id}-${item.order_id}`} className="product-card">
              <div className="product-image-container">
                <img
                  src={item.product.images?.[0] || '/no-image.png'}
                  alt={item.product.name}
                  className="product-image"
                />
              </div>
              
              <div className="product-info">
                <h3 className="product-name">{item.product.name}</h3>
                <div className="product-details">
                  <div className="detail-item">
                    <span className="detail-label">Đơn hàng:</span>
                    <span className="detail-value">{item.order_number}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Số lượng:</span>
                    <span className="detail-value">{item.quantity}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày mua:</span>
                    <span className="detail-value">{formatDate(item.purchased_date)}</span>
                  </div>
                  <div className="detail-item price">
                    <span className="detail-label">Giá:</span>
                    <span className="detail-value">
                      {item.product.price.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
                
                <button
                  className="review-btn"
                  onClick={() => handleReviewProduct(item.product_id)}
                >
                  Đánh giá ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchasedProductsForReview;
