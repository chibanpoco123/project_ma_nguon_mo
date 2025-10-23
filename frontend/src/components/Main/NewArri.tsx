// src/components/NewArrivals.tsx

import { Container, Row, Col, Button } from 'react-bootstrap';
import ProductCard from '../ProductCard';

// 1. Import ảnh banner mới
import newArrivalsBanner from '../../assets/new-arrivals-banner.jpg'; // <-- Thay bằng ảnh banner "HÀNG MỚI" của bạn

// 2. Cập nhật lại danh sách sản phẩm cho đúng
// (Tôi sẽ dùng 8 sản phẩm mẫu)
import product1 from '../../assets/product-tshirt.jpg';
import product2 from '../../assets/product-short.jpg';
import product3 from '../../assets/product-shirt.jpg';
import product4 from '../../assets/product-hat.jpg';
import product5 from '../../assets/product-boxer.jpg';
import product6 from '../../assets/product-polo1.jpg'; // Thêm ảnh mới
import product7 from '../../assets/product-polo2.jpg'; // Thêm ảnh mới
import product8 from '../../assets/product-tanktop.jpg'; // Thêm ảnh mới


const products = [
  { tag: 'HÀNG MỚI', imageUrl: product1, title: 'Áo Thun Nam Họa Tiết...', price: '299,000₫' },
  { tag: 'HÀNG MỚI', imageUrl: product2, title: 'Quần Short Nam Tactical...', price: '349,000₫' },
  { tag: 'HÀNG MỚI', imageUrl: product3, title: 'Áo Sơ Mi Tay Dài Nam...', price: '349,000₫' },
  { tag: 'HÀNG MỚI', imageUrl: product4, title: 'Nón Lưỡi Trai Nam...', price: '249,000₫' },
  { tag: 'HÀNG MỚI', imageUrl: product5, title: 'Quần Boxer Nam...', price: '100,000₫' },
  { tag: 'HÀNG MỚI', imageUrl: product6, title: 'Áo Polo Nam Họa Tiết...', price: '399,000₫' },
  { tag: 'HÀNG MỚI', imageUrl: product7, title: 'Áo Polo Nam Braided...', price: '399,000₫' },
  { tag: 'HÀNG MỚI', imageUrl: product8, title: 'Áo Tank Top Nam...', price: '279,000₫' },
];

function NewArri() {
  return (
    // 3. Xóa "dark-section" và trả về Container như ban đầu
    <Container as="section" className="py-3">
      <div className="product-filter-nav">
        <a href="#" className="active">Hàng mới</a>
        <a href="#">Bán chạy</a>
        <a href="#">Đồ Thu Đông</a>
      </div>
      <Row>
        {/* 4. Cột bên trái cho Banner quảng cáo */}
        <Col lg={3} md={4} className="d-none d-md-block">
          <div className="new-arrivals-promo">
            <img src={newArrivalsBanner} alt="Hàng Mới" className="img-fluid" />
            <div className="promo-content">
              <h3>HÀNG MỚI</h3>
              <Button variant="light" size="sm">XEM NGAY</Button>
            </div>
          </div>
        </Col>

        {/* 5. Cột bên phải cho lưới sản phẩm */}
        <Col lg={9} md={8}>
          <Row xs={2} md={3} lg={4} className="g-3"> {/* Chia 4 cột sản phẩm */}
            {products.map((product, index) => (
              <Col key={index}>
                <ProductCard {...product} />
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* 6. Trả nút về "outline-dark" cho nền trắng */}
      <div className="text-center mt-4">
        <Button variant="outline-dark">Xem tất cả</Button>
      </div>
    </Container>
  );
}

export default NewArri;