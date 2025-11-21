// src/components/ShortsSection.tsx
import { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../ProductCard'; // Tái sử dụng component ProductCard
import axios from 'axios';

// --- Dữ liệu mẫu cho khu vực Quần Short ---
// 1. Import ảnh banner "QUẦN SHORT"
import shortsPromoBanner from '../../assets/quanshort-promo-banner.jpg'; // <-- Thay bằng ảnh của bạn

// 2. Import ảnh các sản phẩm quần short (fallback nếu không có dữ liệu từ API)
import short1 from '../../assets/short-tactical.jpg';
import short2 from '../../assets/short-jean-dark.jpg';
import short3 from '../../assets/short-orgnis-loose.jpg';
import short4 from '../../assets/short-denim-hoa.jpg';

interface Product {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  images: string[];
  category_id?: {
    _id: string;
    name: string;
  };
}

const fallbackShorts = [
  { tag: 'HÀNG MỚI', imageUrl: short1, title: 'Quần Short Nam Tactical...', price: '349,000₫' },
  { tag: 'HÀNG MỚI', imageUrl: short2, title: 'Quần Short Jean Nam Dark...', price: '350,000₫' },
  { tag: 'HÀNG MỚI', imageUrl: short3, title: 'Quần Short Nam Orgnis Loose...', price: '419,000₫' },
  { tag: 'HÀNG MỚI', imageUrl: short4, title: 'Quần Short Nam Denim Hoa...', price: '349,000₫' },
];

function Quanshort() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch tất cả sản phẩm
        const response = await axios.get('http://localhost:3000/api/products');
        const allProducts = response.data;
        
        // Lọc sản phẩm có category là "Quần Short" hoặc tên chứa "Short"
        const shortsProducts = allProducts.filter((product: Product) => {
          const categoryName = product.category_id?.name?.toLowerCase() || '';
          const productName = product.name?.toLowerCase() || '';
          return categoryName.includes('short') || productName.includes('short');
        });
        
        if (shortsProducts.length > 0) {
          setProducts(shortsProducts.slice(0, 8)); // Lấy tối đa 8 sản phẩm
          setUseFallback(false);
        } else {
          // Nếu không có sản phẩm từ API, sử dụng dữ liệu mẫu
          setUseFallback(true);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Nếu lỗi, sử dụng dữ liệu mẫu
        setUseFallback(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const formatPrice = (price: number, discount?: number): number => {
    if (discount) {
      return price - (price * discount / 100);
    }
    return price;
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <Container as="section" className="py-3">
      {/* Thanh điều hướng lọc sản phẩm */}
      <div className="category-nav">
        <a href="#" className="active">Quần Short</a>
        <a href="#">Quần Jean</a>
        <a href="#">Quần Tây</a>
        {/* Liên kết đến trang admin */}
        <a href="/admin" onClick={(e) => { e.preventDefault(); handleAdminClick(); }} style={{ marginLeft: 'auto', fontSize: '0.9rem', color: '#007bff' }}>
          Quản trị
        </a>
      </div>

      <Row>
        {/* Cột bên trái cho Banner quảng cáo */}
        <Col lg={3} className="d-none d-lg-block">
          <div className="category-promo-banner">
            <img src={shortsPromoBanner} alt="Quần Short Mới" className="img-fluid" />
            <div className="promo-content">
              <h2>QUẦN SHORT</h2>
              <Button variant="light" size="sm">XEM NGAY</Button>
              {/* Nút liên kết admin trong banner */}
              <Button 
                variant="outline-light" 
                size="sm" 
                className="mt-2"
                onClick={handleAdminClick}
                style={{ fontSize: '0.75rem' }}
              >
                Quản trị
              </Button>
            </div>
          </div>
        </Col>

        {/* Cột bên phải cho lưới sản phẩm */}
        <Col lg={9}>
          <div className="product-carousel-wrapper">
            {loading ? (
              <div className="text-center py-4">
                <p>Đang tải sản phẩm...</p>
              </div>
            ) : useFallback ? (
              // Hiển thị dữ liệu mẫu nếu không có dữ liệu từ API
              <Row xs={2} md={3} lg={4} className="g-3">
                {fallbackShorts.map((product, index) => (
                  <Col key={index}>
                    <ProductCard 
                      {...product} 
                      showAddToCart={false} // Không hiển thị nút thêm vào giỏ vì không có productId
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              // Hiển thị sản phẩm từ API
              <Row xs={2} md={3} lg={4} className="g-3">
                {products.map((product) => (
                  <Col key={product._id}>
                    <ProductCard
                      tag="HÀNG MỚI"
                      imageUrl={product.images?.[0] || ''}
                      title={product.name}
                      price={formatPrice(product.price || 0, product.discount)}
                      productId={product._id}
                      showAddToCart={true}
                    />
                  </Col>
                ))}
              </Row>
            )}
            {/* Nút điều hướng carousel (chỉ mang tính giao diện) */}
            <Button variant="light" className="carousel-nav-btn next-btn">›</Button>
          </div>
        </Col>
      </Row>

      {/* Nút "Xem tất cả" */}
      <div className="text-center mt-4">
        <Button variant="outline-dark">Xem tất cả</Button>
      </div>
    </Container>
  );
}

export default Quanshort;