import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import '../../assets/css/Outlet.css';
import Header from '../Header';
import Footer from '../Footer';

interface Product {
  id: number;
  name: string;
  originalPrice: number;
  discountPrice: number;
  image: string;
  discount: number;
}

const OutletPage: React.FC = () => {
  const products: Product[] = [
    {
      id: 1,
      name: 'Áo Denim Classic',
      originalPrice: 599000,
      discountPrice: 299000,
      image: 'https://via.placeholder.com/300x400?text=Ao+Denim+1',
      discount: 50
    },
    {
      id: 2,
      name: 'Quần Jeans Blue',
      originalPrice: 799000,
      discountPrice: 399000,
      image: 'https://via.placeholder.com/300x400?text=Quan+Jeans+1',
      discount: 50
    },
    {
      id: 3,
      name: 'Áo Khoác Denim',
      originalPrice: 899000,
      discountPrice: 449000,
      image: 'https://via.placeholder.com/300x400?text=Ao+Khoac+1',
      discount: 50
    },
    {
      id: 4,
      name: 'Quần Chinos',
      originalPrice: 699000,
      discountPrice: 349000,
      image: 'https://via.placeholder.com/300x400?text=Quan+Chinos+1',
      discount: 50
    },
    {
      id: 5,
      name: 'Áo Polo Premium',
      originalPrice: 499000,
      discountPrice: 249000,
      image: 'https://via.placeholder.com/300x400?text=Ao+Polo+1',
      discount: 50
    },
    {
      id: 6,
      name: 'Quần Short',
      originalPrice: 399000,
      discountPrice: 199000,
      image: 'https://via.placeholder.com/300x400?text=Quan+Short+1',
      discount: 50
    }
  ];

  return (
    <div className="d-flex flex-column min-vh-100">

      <Header />
      {/* Hero Section */}
      <div className="outlet-hero">
        <Container>
          <div className="text-center py-5">
            <h1 className="display-4 fw-bold text-danger">-50% OUTLET</h1>
            <p className="lead text-muted">Giảm giá lên đến 50% cho các sản phẩm được chọn</p>
          </div>
        </Container>
      </div>

      {/* Products Section */}
      <Container className="py-5">
        <Row className="g-4">
          {products.map((product) => (
            <Col key={product.id} md={6} lg={4} className="outlet-product-col">
              <Card className="outlet-product-card h-100">
                <div className="product-image-wrapper">
                  <Card.Img 
                    variant="top" 
                    src={product.image} 
                    alt={product.name}
                    className="outlet-product-image"
                  />
                  <div className="discount-badge">-{product.discount}%</div>
                </div>
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="product-name">{product.name}</Card.Title>
                  
                  <div className="price-section mb-3">
                    <span className="original-price">
                      {product.originalPrice.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="discount-price fw-bold">
                      {product.discountPrice.toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  <Button 
                    variant="danger" 
                    className="mt-auto outlet-add-btn"
                  >
                    Thêm vào giỏ
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Info Section */}
      <div className="outlet-info-section py-5 bg-light">
        <Container>
          <Row className="text-center">
            <Col md={4} className="mb-3">
              <h5>🚚 Miễn phí vận chuyển</h5>
              <p className="text-muted">Cho đơn hàng trên 500.000đ</p>
            </Col>
            <Col md={4} className="mb-3">
              <h5>✅ Hàng chính hãng</h5>
              <p className="text-muted">Bảo hành 100% chính hãng</p>
            </Col>
            <Col md={4} className="mb-3">
              <h5>💳 Thanh toán linh hoạt</h5>
              <p className="text-muted">Hỗ trợ nhiều phương thức thanh toán</p>
            </Col>
          </Row>
        </Container>
      </div>
      <Footer />
    </div>
  );
};

export default OutletPage;