import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import provincesData from '../../assets/vn_provinces_districts.json';
import '../../css/cart.css';

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  quantity: number;
  size?: string;
  cartItemId?: string; // ID của cart item từ database để update/delete
}

interface ApiCartItem {
  _id: string;
  product_id: {
    _id: string;
    name: string;
    price: number;
    discount?: number;
    images: string[];
  };
  product_variant_id?: {
    _id: string;
    size?: string;
    color?: string;
    price: number;
    discount_price?: number;
  } | null;
  quantity: number;
}

interface ProvinceData {
  province_id: string;
  province_name: string;
  districts: string[];
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Province and District states
  const [provinces, setProvinces] = useState<Array<{ province_id: string; province_name: string }>>([]);
  const [districts, setDistricts] = useState<Array<{ district_id: string; district_name: string }>>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [loadingProvinces, setLoadingProvinces] = useState(false);

  // Order information states
  const [fullName, setFullName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [deliveryNote, setDeliveryNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cod');

  // Delivery estimate states (separate from order info)
  const [estimateProvince, setEstimateProvince] = useState<string>('');
  const [estimateDistrict, setEstimateDistrict] = useState<string>('');

  // Check if user is logged in (check on mount, when location changes, and when window gains focus)
  useEffect(() => {
    const checkLoginStatus = () => {
      const accessToken = localStorage.getItem('accessToken');
      setIsLoggedIn(!!accessToken);
    };
    
    checkLoginStatus();
    
    // Check again when window gains focus (user might have logged in in another tab)
    window.addEventListener('focus', checkLoginStatus);
    
    // Listen for login event
    window.addEventListener('userLogin', checkLoginStatus);
    
    return () => {
      window.removeEventListener('focus', checkLoginStatus);
      window.removeEventListener('userLogin', checkLoginStatus);
    };
  }, [location]); // Re-check when location changes (e.g., returning from login page)

  // Fetch cart items from API
  useEffect(() => {
    const fetchCartItems = async () => {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        setLoading(false);
        // If not logged in, check localStorage for guest cart
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart) {
          try {
            const parsedCart = JSON.parse(guestCart);
            setCartItems(parsedCart);
          } catch (error) {
            console.error('Error parsing guest cart:', error);
          }
        }
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/api/cart', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        // Map API response to CartItem format
        const mappedItems: CartItem[] = response.data.map((item: ApiCartItem) => {
          const product = item.product_id;
          const variant = item.product_variant_id;
          
          // Use variant price if available, otherwise use product price
          const finalPrice = variant?.price || product.price || 0;
          // Use variant discount_price if available, otherwise calculate from product discount
          const discountedPrice = variant?.discount_price || 
            (product.discount ? product.price - (product.price * product.discount / 100) : finalPrice);
          
          return {
            id: product._id,
            cartItemId: item._id,
            name: product.name,
            image: product.images?.[0] || '',
            price: discountedPrice || finalPrice,
            originalPrice: finalPrice,
            quantity: item.quantity,
            size: variant?.size || undefined
          };
        });

        setCartItems(mappedItems);
      } catch (error: unknown) {
        console.error('Error fetching cart items:', error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          // Token invalid, clear it
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setIsLoggedIn(false);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();

    // Listen for cart update events
    const handleCartUpdate = () => {
      fetchCartItems();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [location, isLoggedIn]); // Re-fetch when location changes or login status changes

  // Load provinces from JSON file (primary source)
  useEffect(() => {
    const loadProvinces = () => {
      try {
        setLoadingProvinces(true);
        // Use local JSON file as primary source
        if (provincesData && Array.isArray(provincesData)) {
          const formattedProvinces = (provincesData as ProvinceData[]).map((p: ProvinceData) => ({
            province_id: p.province_id,
            province_name: p.province_name
          }));
          console.log('Provinces loaded from JSON:', formattedProvinces.length);
          setProvinces(formattedProvinces);
        } else {
          console.error('Invalid provinces data format');
          setProvinces([]);
        }
      } catch (error) {
        console.error('Error loading provinces from JSON:', error);
        // Fallback to API if JSON fails
        fetchProvincesFromAPI();
      } finally {
        setLoadingProvinces(false);
      }
    };

    const fetchProvincesFromAPI = async () => {
      try {
        const response = await axios.get('https://api.vnappmob.com/api/v2/province', {
          timeout: 10000,
          headers: {
            'Accept': 'application/json'
          }
        });
        const apiData = response.data.results || [];
        console.log('Provinces loaded from API:', apiData.length);
        setProvinces(apiData);
      } catch (error) {
        console.error('Error fetching provinces from API:', error);
        setProvinces([]);
      }
    };

    loadProvinces();
  }, []);

  // State for estimate districts
  const [estimateDistricts, setEstimateDistricts] = useState<Array<{ district_id: string; district_name: string }>>([]);

  // Load districts when province is selected (for order info)
  useEffect(() => {
    const loadDistricts = () => {
      if (!selectedProvince) {
        setDistricts([]);
        setSelectedDistrict('');
        return;
      }

      try {
        // Find province in JSON data
        const province = (provincesData as ProvinceData[]).find((p: ProvinceData) => p.province_id === selectedProvince);
        
        if (province && province.districts && Array.isArray(province.districts)) {
          // Map districts from JSON (array of names) to format with IDs
          const formattedDistricts = province.districts.map((districtName: string, index: number) => ({
            district_id: `${selectedProvince}_${index}`,
            district_name: districtName
          }));
          console.log('Districts loaded from JSON:', formattedDistricts.length);
          setDistricts(formattedDistricts);
          setSelectedDistrict(''); // Reset district when province changes
        } else {
          // Fallback to API if not found in JSON
          fetchDistrictsFromAPI();
        }
      } catch (error) {
        console.error('Error loading districts from JSON:', error);
        // Fallback to API
        fetchDistrictsFromAPI();
      }
    };

    const fetchDistrictsFromAPI = async () => {
      try {
        const response = await axios.get(`https://api.vnappmob.com/api/v2/province/district/${selectedProvince}`, {
          timeout: 10000
        });
        setDistricts(response.data.results || []);
        setSelectedDistrict('');
      } catch (error) {
        console.error('Error fetching districts from API:', error);
        try {
          const fallbackResponse = await axios.get(`https://api.vnappmob.com/api/province/district/${selectedProvince}`, {
            timeout: 10000
          });
          setDistricts(fallbackResponse.data.results || fallbackResponse.data || []);
          setSelectedDistrict('');
        } catch (fallbackError) {
          console.error('Error fetching districts from fallback API:', fallbackError);
          setDistricts([]);
        }
      }
    };

    loadDistricts();
  }, [selectedProvince]);

  // Load districts for delivery estimate
  useEffect(() => {
    if (!estimateProvince) {
      setEstimateDistricts([]);
      setEstimateDistrict('');
      return;
    }

    try {
      const province = (provincesData as ProvinceData[]).find((p: ProvinceData) => p.province_id === estimateProvince);
      
      if (province && province.districts && Array.isArray(province.districts)) {
        const formattedDistricts = province.districts.map((districtName: string, index: number) => ({
          district_id: `${estimateProvince}_${index}`,
          district_name: districtName
        }));
        setEstimateDistricts(formattedDistricts);
        setEstimateDistrict('');
      }
    } catch (error) {
      console.error('Error loading estimate districts:', error);
      setEstimateDistricts([]);
    }
  }, [estimateProvince]);


  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Coupons giả lập
  const coupons: { [key: string]: number } = {
    'OCT100': 100000,
    'OCT200': 200000,
    'SAVE50': 50000
  };

  const removeItem = async (cartItemId: string) => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      // Guest cart - remove from localStorage
      const guestCart = localStorage.getItem('guestCart');
      if (guestCart) {
        try {
          const parsedCart = JSON.parse(guestCart);
          const updatedCart = parsedCart.filter((item: CartItem) => item.cartItemId !== cartItemId);
          localStorage.setItem('guestCart', JSON.stringify(updatedCart));
          setCartItems(updatedCart);
        } catch (error) {
          console.error('Error updating guest cart:', error);
        }
      }
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/api/cart/${cartItemId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      // Remove from state
      setCartItems(cartItems.filter(item => item.cartItemId !== cartItemId));
    } catch (error: unknown) {
      console.error('Error removing cart item:', error);
      alert('Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng');
    }
  };

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(cartItemId);
      return;
    }

    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      // Guest cart - update in localStorage
      const guestCart = localStorage.getItem('guestCart');
      if (guestCart) {
        try {
          const parsedCart = JSON.parse(guestCart);
          const updatedCart = parsedCart.map((item: CartItem) =>
            item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
          );
          localStorage.setItem('guestCart', JSON.stringify(updatedCart));
          setCartItems(updatedCart);
        } catch (error) {
          console.error('Error updating guest cart:', error);
        }
      }
      return;
    }

    try {
      await axios.put(
        `http://localhost:3000/api/cart/${cartItemId}`,
        { quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      
      // Update in state
      setCartItems(
        cartItems.map(item =>
          item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error: unknown) {
      console.error('Error updating cart item:', error);
      alert('Có lỗi xảy ra khi cập nhật số lượng');
    }
  };

  const applyCoupon = () => {
    if (coupons[couponCode]) {
      setAppliedCoupon(couponCode);
      setCouponCode('');
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

  // Show loading state
  if (loading) {
    return (
      <div className="cart-page">
        <Container>
          <Row className="mt-5">
            <Col>
              <div className="text-center py-5">
                <p>Đang tải giỏ hàng...</p>
                <Button 
                  variant="outline-primary" 
                  className="mt-3"
                  onClick={() => navigate('/')}
                >
                  ← Về trang chủ
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  // Show empty cart message instead of redirecting immediately
  if (!loading && cartItems.length === 0) {
    return (
      <div className="cart-page">
        <Container>
          <Row className="mt-5">
            <Col>
              <div className="text-center py-5">
                <h3>Giỏ hàng của bạn đang trống</h3>
                <p className="text-muted mb-4">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm!</p>
                <Button 
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/')}
                >
                  ← Tiếp tục mua sắm
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Container>
        <Row className="mt-5">
          {/* Left Column - Order Information */}
          <Col lg={8}>
            {/* Order Information Section */}
            <div className="order-info-section mb-4 p-4">
              <h5 className="mb-4">Thông tin đơn hàng</h5>
              <Form>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label>Họ và tên <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập họ và tên"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="Nhập số điện thoại"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Địa chỉ <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập địa chỉ"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </Form.Group>
                <Row>
                  <Col md={4} className="mb-3">
                    <Form.Label>Tỉnh/Thành phố <span className="text-danger">*</span></Form.Label>
                    {loadingProvinces ? (
                      <Form.Control type="text" disabled value="Đang tải..." />
                    ) : provinces.length === 0 ? (
                      <Form.Control type="text" disabled value="Không thể tải dữ liệu" />
                    ) : (
                      <Form.Select
                        value={selectedProvince}
                        onChange={(e) => setSelectedProvince(e.target.value)}
                      >
                        <option value="">Chọn tỉnh/thành phố</option>
                        {provinces.map((province) => (
                          <option key={province.province_id} value={province.province_id}>
                            {province.province_name}
                          </option>
                        ))}
                      </Form.Select>
                    )}
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Label>Quận/Huyện <span className="text-danger">*</span></Form.Label>
                    {!selectedProvince ? (
                      <Form.Select disabled>
                        <option>Chọn Quận/huyện</option>
                      </Form.Select>
                    ) : districts.length === 0 ? (
                      <Form.Control type="text" disabled value="Đang tải..." />
                    ) : (
                      <Form.Select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                      >
                        <option value="">Chọn Quận/huyện</option>
                        {districts.map((district) => (
                          <option key={district.district_id} value={district.district_id}>
                            {district.district_name}
                          </option>
                        ))}
                      </Form.Select>
                    )}
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Label>Phường/Xã <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      disabled={!selectedDistrict}
                    >
                      <option value="">Chọn Phường/xã</option>
                    </Form.Select>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Ghi chú giao hàng</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ví dụ: giao hàng giờ hành chính"
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </div>

            {/* Delivery Estimate Section */}
            <div className="delivery-section mb-4 p-4">
              <h5 className="mb-4">📦 Ước tính thời gian giao hàng</h5>
              <Form>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label>Tỉnh/Thành phố</Form.Label>
                    {loadingProvinces ? (
                      <Form.Control type="text" disabled value="Đang tải..." />
                    ) : provinces.length === 0 ? (
                      <Form.Control type="text" disabled value="Không thể tải dữ liệu" />
                    ) : (
                      <Form.Select
                        value={estimateProvince}
                        onChange={(e) => setEstimateProvince(e.target.value)}
                      >
                        <option value="">Tỉnh/thành phố</option>
                        {provinces.map((province) => (
                          <option key={province.province_id} value={province.province_id}>
                            {province.province_name}
                          </option>
                        ))}
                      </Form.Select>
                    )}
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Quận/Huyện</Form.Label>
                    {!estimateProvince ? (
                      <Form.Select disabled>
                        <option>Quận/huyện</option>
                      </Form.Select>
                    ) : estimateDistricts.length === 0 ? (
                      <Form.Control type="text" disabled value="Đang tải..." />
                    ) : (
                      <Form.Select
                        value={estimateDistrict}
                        onChange={(e) => setEstimateDistrict(e.target.value)}
                      >
                        <option value="">Quận/huyện</option>
                        {estimateDistricts.map((district) => (
                          <option key={district.district_id} value={district.district_id}>
                            {district.district_name}
                          </option>
                        ))}
                      </Form.Select>
                    )}
                  </Col>
                </Row>
              </Form>
            </div>

            {/* Payment Methods */}
            <div className="payment-section p-4">
              <h5 className="mb-4">💳 Hình thức thanh toán</h5>
              <div className="payment-methods">
                <Form.Check
                  type="radio"
                  id="cod"
                  label={
                    <div>
                      <strong>COD (Thanh toán khi giao hàng (COD))</strong>
                      <div className="payment-description">
                        <p className="mb-1">Khách hàng được kiểm tra hàng trước khi nhận hàng.</p>
                        <p className="mb-0">Freeship đơn từ 399K</p>
                      </div>
                    </div>
                  }
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mb-3 payment-option"
                />
                <Form.Check
                  type="radio"
                  id="vnpay"
                  label="VNPAY (Ví điện tử VNPAY)"
                  name="payment"
                  value="vnpay"
                  checked={paymentMethod === 'vnpay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mb-3 payment-option"
                />
                <Form.Check
                  type="radio"
                  id="momo"
                  label="Thanh toán MoMo"
                  name="payment"
                  value="momo"
                  checked={paymentMethod === 'momo'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mb-3 payment-option"
                />
              </div>
            </div>
          </Col>

          {/* Right Column - Cart Summary */}
          <Col lg={4}>
            <div className="cart-header mb-4">
              <h2>🛒 Giỏ hàng</h2>
              <a href="/products" className="sxp-link">Sản phẩm</a>
            </div>

            <div className="cart-items">
              <hr className="mb-3" />
              {cartItems.map(item => (
                <div key={item.id} className="cart-item mb-4">
                  <Row className="align-items-start">
                    <Col xs="auto">
                      <img src={item.image} alt={item.name} className="cart-item-image" />
                    </Col>
                    <Col>
                      <h6 className="mb-1">{item.name}</h6>
                      <div className="mb-2">
                        <span className="badge bg-light text-dark me-2">Đổi ý 15 ngày</span>
                        {item.size && <small className="text-muted">ID: {item.size}</small>}
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <Form.Group className="quantity-group d-inline-flex">
                            <Button
                              variant="light"
                              size="sm"
                              onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity - 1)}
                            >
                              −
                            </Button>
                            <Form.Control
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.cartItemId || item.id, parseInt(e.target.value) || 1)}
                              min="1"
                              className="quantity-input"
                            />
                            <Button
                              variant="light"
                              size="sm"
                              onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </Form.Group>
                        </div>
                        <div className="text-end">
                          <div className="price">{formatPrice(item.price * item.quantity)}</div>
                          <Button
                            variant="link"
                            className="remove-btn p-0 text-muted"
                            onClick={() => removeItem(item.cartItemId || item.id)}
                            style={{ fontSize: '12px' }}
                          >
                            <FontAwesomeIcon icon={faTimes} /> Xóa
                          </Button>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>

            {/* Offers Section */}
            <Card className="order-summary sticky-top mb-4">
              <Card.Body>
                <h5 className="mb-3">Ưu Đãi Dành Cho Bạn</h5>

                {/* Coupon Input */}
                <div className="coupon-section mb-3">
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="text"
                      placeholder="Nhập mã giảm giá"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      size="sm"
                    />
                  </Form.Group>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-100"
                    onClick={applyCoupon}
                  >
                    Áp dụng Voucher
                  </Button>
                </div>

                {/* Voucher Carousel */}
                <div className="voucher-carousel mb-3">
                  <div className="voucher-scroll">
                    <div className="voucher-item">
                      <div className="voucher-code">OCT100</div>
                      <div className="voucher-desc">Giảm 100k đơn từ 199k</div>
                      <div className="voucher-expiry">HSD: 31/10/2025</div>
                    </div>
                    <div className="voucher-item">
                      <div className="voucher-code">OCT20</div>
                      <div className="voucher-desc">Giảm 20k đơn từ 299k</div>
                      <div className="voucher-expiry">HSD: 3/10/2005</div>
                    </div>
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
                    <span className="free">Miễn phí</span>
                  </div>
                  <div className="price-row">
                    <span>Voucher giảm giá:</span>
                    <span>{appliedCoupon ? `-${formatPrice(discount)}` : '0₫'}</span>
                  </div>
                  <div className="price-row">
                    <span>Voucher giảm giá đặc biệt:</span>
                    <span>0₫</span>
                  </div>
                  <div className="price-row">
                    <span>Chương trình khách hàng thân thiết:</span>
                    <span>0₫</span>
                  </div>
                  <hr />
                  <div className="total-row">
                    <span>Tổng:</span>
                    <span className="total-amount">{formatPrice(total)}</span>
                  </div>
                  <div className="text-center mt-2">
                    <small className="text-muted">Đã giảm: {appliedCoupon ? formatPrice(discount) : '0₫'}</small>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Checkout Button */}
            <Button 
              variant="primary" 
              size="lg" 
              className="w-100 checkout-button"
              onClick={handleCheckout}
            >
              <span className="checkout-price">{formatPrice(total)}</span>
              <span className="checkout-text">Thanh toán</span>
            </Button>
            {!isLoggedIn && (
              <p className="text-center text-muted mt-2 small">
                Vui lòng đăng nhập để tiếp tục thanh toán
              </p>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Cart;
