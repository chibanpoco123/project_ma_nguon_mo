import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import '../../css/cart.css';

interface CartItem {
  id: number;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  quantity: number;
  size?: string;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Check if user is logged in (check on mount, when location changes, and when window gains focus)
  useEffect(() => {
    const checkLoginStatus = () => {
      const accessToken = localStorage.getItem('accessToken');
      setIsLoggedIn(!!accessToken);
    };
    
    checkLoginStatus();
    
    // Check again when window gains focus (user might have logged in in another tab)
    window.addEventListener('focus', checkLoginStatus);
    
    return () => {
      window.removeEventListener('focus', checkLoginStatus);
    };
  }, [location]); // Re-check when location changes (e.g., returning from login page)

  // Redirect to home if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/');
    }
  }, [cartItems.length, navigate]);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [showCouponForm, setShowCouponForm] = useState(false);

  // Coupons giả lập
  const coupons: { [key: string]: number } = {
    'OCT100': 100000,
    'OCT200': 200000,
    'SAVE50': 50000
  };

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    setCartItems(
      cartItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const applyCoupon = () => {
    if (coupons[couponCode]) {
      setAppliedCoupon(couponCode);
      setCouponCode('');
      setShowCouponForm(false);
    } else {
      alert('Mã coupon không hợp lệ!');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = appliedCoupon ? coupons[appliedCoupon] : 0;
  const shipping = 0; // Free shipping
  const total = subtotal - discount + shipping;

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  // Handle checkout - redirect to login if not logged in
  const handleCheckout = () => {
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để thanh toán!');
      navigate('/login');
      return;
    }
    // TODO: Implement checkout logic here
    alert('Chức năng thanh toán đang được phát triển!');
  };

  // Don't render if cart is empty (will redirect)
  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="cart-page">
      <Container>
        <Row className="mt-5">
          <Col lg={8}>
            <div className="cart-header mb-4">
              <h2>🛒 Giỏ hàng</h2>
              <a href="#" className="sxp-link">Sắp xếp</a>
            </div>

            <div className="cart-items">
              {cartItems.map(item => (
                <Card key={item.id} className="cart-item mb-3">
                  <Card.Body>
                    <Row className="align-items-center">
                      <Col xs="auto">
                        <img src={item.image} alt={item.name} className="cart-item-image" />
                      </Col>
                      <Col>
                        <h6 className="mb-2">{item.name}</h6>
                        {item.size && <small className="text-muted">Size: {item.size}</small>}
                        <div className="mt-2">
                          <span className="price">{formatPrice(item.price)}</span>
                          <span className="original-price ms-2">{formatPrice(item.originalPrice)}</span>
                        </div>
                      </Col>
                      <Col xs="auto">
                        <Form.Group className="quantity-group">
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            −
                          </Button>
                          <Form.Control
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            min="1"
                            className="quantity-input"
                          />
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </Form.Group>
                      </Col>
                      <Col xs="auto">
                        <Button
                          variant="light"
                          className="remove-btn"
                          onClick={() => removeItem(item.id)}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </div>

            {/* Delivery Info */}
            <div className="delivery-section mt-4 p-3">
              <h5>📦 Ước tính thời gian giao hàng</h5>
              <Form className="mt-3">
                <Form.Group className="mb-3">
                  <Form.Label>Tỉnh/Thành phố</Form.Label>
                  <Form.Select>
                    <option>Chọn Quận/Huyện</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Quận/Huyện</Form.Label>
                  <Form.Select>
                    <option>Chọn Phường/Xã</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            </div>

            {/* Payment Methods */}
            <div className="payment-section mt-4 p-3">
              <h5>💳 Hình thức thanh toán</h5>
              <div className="payment-methods mt-3">
                <Form.Check
                  type="radio"
                  id="cod"
                  label="COD - Thanh toán khi giao hàng (CCCD)"
                  name="payment"
                  defaultChecked
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  id="online"
                  label="Online - Thanh toán trực tuyến"
                  name="payment"
                  className="mb-2"
                />
              </div>
            </div>
          </Col>

          {/* Order Summary */}
          <Col lg={4}>
            <Card className="order-summary sticky-top">
              <Card.Body>
                <h5 className="mb-3">Ưu Đãi Dành Cho Bạn</h5>

                {/* Coupon Section */}
                <div className="coupon-section mb-3">
                  {!showCouponForm ? (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="w-100"
                      onClick={() => setShowCouponForm(true)}
                    >
                      Bạn muốn chọn sản phẩm khác?
                    </Button>
                  ) : (
                    <Form className="coupon-form">
                      <Form.Group>
                        <Form.Control
                          type="text"
                          placeholder="Nhập mã Coupon"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          size="sm"
                        />
                      </Form.Group>
                      <div className="d-flex gap-2 mt-2">
                        <Button variant="primary" size="sm" className="flex-grow-1" onClick={applyCoupon}>
                          Áp dụng
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => setShowCouponForm(false)}>
                          Hủy
                        </Button>
                      </div>
                    </Form>
                  )}
                </div>

                {/* Discount Codes */}
                <div className="discount-codes mb-3">
                  <div className="discount-badge">
                    <strong>OCT100</strong>
                    <small>Giảm 100.000đ</small>
                  </div>
                  <div className="discount-badge">
                    <strong>OCT200</strong>
                    <small>Giảm 200.000đ</small>
                  </div>
                </div>

                <hr />

                {/* Price Details */}
                <div className="price-details">
                  <div className="price-row">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="price-row">
                    <span>Phí vận chuyển:</span>
                    <span className="free">0đ</span>
                  </div>
                  {appliedCoupon && (
                    <div className="price-row text-success">
                      <span>Voucher giảm giá:</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="price-row">
                      <span>Chương trình khách hàng thân thiết:</span>
                      <span>0đ</span>
                    </div>
                  )}
                  <hr />
                  <div className="total-row">
                    <span>Tổng:</span>
                    <span className="total-amount">{formatPrice(total)}</span>
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-100 mt-3"
                  onClick={handleCheckout}
                >
                  {isLoggedIn ? 'Thanh toán' : 'Đăng nhập để thanh toán'}
                </Button>
                {!isLoggedIn && (
                  <p className="text-center text-muted mt-2 small">
                    Vui lòng đăng nhập để tiếp tục thanh toán
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Cart;
