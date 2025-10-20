// src/components/TShirtSection.tsx
import { Container, Row, Col, Button } from 'react-bootstrap';
import ProductCard from '../ProductCard'; // Dùng lại component ProductCard đã có

// --- Dữ liệu mẫu ---
// 1. Import ảnh banner "ÁO THUN"
import tShirtPromoBanner from '../../assets/aothun-promo-banner.jpg'; // <-- Thay bằng ảnh của bạn

// 2. Import ảnh các sản phẩm áo thun
import product1 from '../../assets/product-tshirt-icdn.jpg';
import product2 from '../../assets/product-tshirt-hk.jpg';
import product3 from '../../assets/product-tshirt-blue.jpg';
import product4 from '../../assets/product-tshirt-in.jpg';

const tshirts = [
  { tag: 'HÀNG MỚI', imageUrl: product1, title: 'Áo Thun Nam Họa Tiết...', price: '299,000₫' },
  { tag: 'HÀNG MỚI', imageUrl: product2, title: 'Áo Thun Nam Họa Tiết ICDN...', price: '329,000₫' },
  { tag: 'HÀNG MỚI', imageUrl: product3, title: 'Áo Thun Nam Họa Tiết Blue...', price: '349,000₫' },
  { tag: 'HÀNG MỚI', imageUrl: product4, title: 'Áo Thun Nam Họa Tiết In...', price: '299,000₫' },
];

function NewArrihai() {
  return (
    <Container as="section" className="py-3">
      {/* Thanh điều hướng lọc sản phẩm */}
      <div className="category-nav">
        <a href="#" className="active">Áo Thun</a>
        <a href="#">Áo Sơmi</a>
        <a href="#">Áo Polo</a>
      </div>

      <Row>
        {/* Cột bên trái cho Banner quảng cáo */}
        <Col lg={3} className="d-none d-lg-block">
          <div className="category-promo-banner">
            <img src={tShirtPromoBanner} alt="Áo Thun Mới" className="img-fluid" />
            <div className="promo-content">
              <h2>ÁO THUN</h2>
              <Button variant="light" size="sm">XEM NGAY</Button>
            </div>
          </div>
        </Col>

        {/* Cột bên phải cho lưới sản phẩm */}
        <Col lg={9}>
          <div className="product-carousel-wrapper">
            <Row xs={2} md={3} lg={4} className="g-3">
              {tshirts.map((product, index) => (
                <Col key={index}>
                  <ProductCard {...product} />
                </Col>
              ))}
            </Row>
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

export default NewArrihai;