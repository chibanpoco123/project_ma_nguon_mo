import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronDown, 
  faHeart,
  faTag,
  faTruck,
  faTicketAlt
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '../../css/cart.css';

interface CartItem {
  _id: string;
  quantity: number;
  product_id: {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    images: string[];
    category_id?: {
      _id: string;
      name: string;
    };
  } | null;
  product_variant_id?: {
    _id: string;
    name: string;
    size?: string;
    color?: string;
  } | null;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category_id?: {
    _id: string;
    name: string;
  };
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [showRelatedProducts, setShowRelatedProducts] = useState(false);
  const relatedProductsRef = useRef<HTMLDivElement>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [iconDenimCoins] = useState(0);

  const API_URL = 'http://localhost:3000/api';
  const token = localStorage.getItem('accessToken');

  // Check login status
  useEffect(() => {
    setIsLoggedIn(!!token);
  }, [token]);

  // Load cart items from API
  const loadCartItems = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${API_URL}/cart/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const validItems = response.data.filter(
        (item: CartItem) => item.product_id !== null
      );
      
      setCartItems(validItems);
      
      // Auto-select all items
      const allIds = new Set<string>(validItems.map((item: CartItem) => item._id));
      setSelectedItems(allIds);

      // Load related products if cart has items
      if (validItems.length > 0) {
        const categoryId = validItems[0].product_id?.category_id?._id;
        if (categoryId) {
          // Load related products
          try {
            const response = await axios.get(`${API_URL}/products?category_id=${categoryId}`);
            if (Array.isArray(response.data)) {
              const currentProductIds = new Set<string>(validItems.map((item: CartItem) => item.product_id?._id).filter(Boolean) as string[]);
              const related = response.data
                .filter((product: Product) => !currentProductIds.has(product._id))
                .slice(0, 8)
                .map((product: Product) => ({
                  _id: product._id,
                  name: product.name,
                  price: product.price,
                  originalPrice: product.originalPrice,
                  images: product.images || [],
                  category_id: product.category_id
                }));
              setRelatedProducts(related);
            }
          } catch (error) {
            console.error('Error loading related products:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }, [token, API_URL]);

  // Handle scroll to show related products
  useEffect(() => {
    const handleScroll = () => {
      if (relatedProductsRef.current) {
        const rect = relatedProductsRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight && cartItems.length > 0) {
          setShowRelatedProducts(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [cartItems.length]);

  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      const allIds = new Set(cartItems.map(item => item._id));
      setSelectedItems(allIds);
    }
  };

  // Remove item
  const removeItem = async (itemId: string) => {
    if (!token) return;
    
    try {
      await axios.delete(`${API_URL}/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadCartItems();
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Không thể xóa sản phẩm');
    }
  };

  // Update quantity
  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    if (!token) return;
    
    try {
      await axios.put(
        `${API_URL}/cart/${itemId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  // Apply coupon
  const applyCoupon = () => {
    const coupons: { [key: string]: number } = {
      'OCT100': 100000,
      'OCT200': 200000,
      'SAVE50': 50000
    };
    
    if (coupons[couponCode]) {
      setAppliedCoupon(couponCode);
      setCouponCode('');
      setShowCouponForm(false);
    } else {
      alert('Mã coupon không hợp lệ!');
    }
  };

  // Calculate totals
  const selectedCartItems = cartItems.filter(item => selectedItems.has(item._id));
  const subtotal = selectedCartItems.reduce(
    (sum, item) => sum + (item.product_id?.price || 0) * item.quantity, 
    0
  );
  const coupons: { [key: string]: number } = {
    'OCT100': 100000,
    'OCT200': 200000,
    'SAVE50': 50000
  };
  const discount = appliedCoupon ? coupons[appliedCoupon] : 0;
  const shipping = 0;
  const total = subtotal - discount + shipping;

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + '₫';
  };

  // Handle checkout
  const handleCheckout = () => {
    if (selectedCartItems.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm!');
      return;
    }
    
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để thanh toán!');
      navigate('/login');
      return;
    }
    
    navigate('/checkout');
  };

  // Get image URL
  const getImageUrl = (img: string | undefined) => {
    if (!img) return '/no-image.png';
    if (img.startsWith('http')) return img;
    return `http://localhost:3000/${img}`;
  };

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <Container>
          <div className="cart-header-empty">
            <h2>Giỏ hàng</h2>
          </div>
          
          <div className="empty-cart-container">
            <div className="empty-cart-content">
              <div className="empty-cart-icon">🛒</div>
              <h3>Giỏ hàng của bạn đang trống</h3>
              <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
              <Button 
                className="btn-continue-shopping"
                onClick={() => navigate('/')}
              >
                Tiếp tục mua sắm
              </Button>
            </div>
          </div>

          {/* Empty cart summary */}
          <div className="cart-summary-empty">
            <div className="summary-row">
            <div className="summary-label">
              <input 
                type="checkbox" 
                checked={false} 
                readOnly
                className="summary-checkbox"
                aria-label="Chọn tất cả sản phẩm"
              />
              <span>Chọn Tất Cả (0)</span>
            </div>
              <div className="summary-actions">
                <span className="action-link">Xóa</span>
                <span className="action-link">Lưu vào mục Đã thích</span>
              </div>
            </div>
            
            <div className="summary-total">
              <span>Tổng cộng (0 sản phẩm):</span>
              <span className="total-amount">0₫</span>
            </div>
            
            <Button 
              className="btn-buy-now-empty"
              disabled
            >
              Mua Hàng
            </Button>
          </div>

          {/* Voucher section for empty cart */}
          <div className="voucher-section-empty">
            <div className="voucher-item">
              <FontAwesomeIcon icon={faTicketAlt} className="voucher-icon" />
              <span>Icon Denim Voucher</span>
              <a href="#" className="voucher-link">Chọn hoặc nhập mã</a>
            </div>
            <div className="voucher-item">
              <FontAwesomeIcon icon={faTag} className="voucher-icon" />
              <span>Icon Denim Xu</span>
              <span className="voucher-disabled">Bạn chưa chọn sản phẩm</span>
              <span className="voucher-amount">-0₫</span>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // Cart with items
  return (
    <div className="cart-page">
      <Container>
        {/* Header */}
        <div className="cart-table-header">
          <div className="header-col product-col">
            <input 
              type="checkbox" 
              checked={selectedItems.size === cartItems.length && cartItems.length > 0}
              onChange={toggleSelectAll}
              className="header-checkbox"
              aria-label="Chọn tất cả sản phẩm"
            />
            <span>Sản Phẩm</span>
          </div>
          <div className="header-col">Đơn Giá</div>
          <div className="header-col">Số Lượng</div>
          <div className="header-col">Số Tiền</div>
          <div className="header-col">Thao Tác</div>
        </div>

        {/* Store and Products */}
        <div className="cart-store-section">
          <div className="store-header">
            <input 
              type="checkbox" 
              checked={cartItems.every(item => selectedItems.has(item._id))}
              onChange={() => {
                if (cartItems.every(item => selectedItems.has(item._id))) {
                  const newSelected = new Set(selectedItems);
                  cartItems.forEach(item => newSelected.delete(item._id));
                  setSelectedItems(newSelected);
                } else {
                  const newSelected = new Set(selectedItems);
                  cartItems.forEach(item => newSelected.add(item._id));
                  setSelectedItems(newSelected);
                }
              }}
              className="store-checkbox"
              aria-label="Chọn tất cả sản phẩm trong cửa hàng"
            />
            <span className="store-name">Icon Denim Official Store</span>
            <div className="store-promo">
              Mua Kèm Mua tối thiểu 400.000₫ để nhận quà <a href="#">Mua Thêm &gt;</a>
            </div>
          </div>

          {/* Cart Items */}
          {cartItems.map((item) => {
            if (!item.product_id) return null;
            
            const product = item.product_id;
            const variant = item.product_variant_id;
            const isSelected = selectedItems.has(item._id);
            const itemTotal = product.price * item.quantity;
            const originalPrice = product.originalPrice || product.price * 1.5;

            return (
              <div key={item._id} className="cart-item-row">
                <div className="item-col product-col">
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={() => toggleItemSelection(item._id)}
                    className="item-checkbox"
                    aria-label={`Chọn sản phẩm ${product.name}`}
                  />
                  <img 
                    src={getImageUrl(product.images?.[0])} 
                    alt={product.name}
                    className="item-image"
                  />
                  <div className="item-info">
                    <div className="item-name">{product.name}</div>
                    <div className="item-flash-sale">Flash Sale kết thúc lúc 00:00:00</div>
                    {variant && (
                      <div className="item-variant">
                        Phân Loại Hàng: {variant.name || variant.size || variant.color}
                      </div>
                    )}
                    <div className="item-price-info">
                      <span className="item-price-current">{formatPrice(product.price)}</span>
                      <span className="item-price-original">{formatPrice(originalPrice)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="item-col price-col">
                  <div className="price-display">
                    <span className="price-current">{formatPrice(product.price)}</span>
                    <span className="price-original">{formatPrice(originalPrice)}</span>
                  </div>
                </div>
                
                <div className="item-col quantity-col">
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <input 
                      type="number" 
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item._id, parseInt(e.target.value) || 1)}
                      min="1"
                      className="quantity-input"
                      aria-label={`Số lượng sản phẩm ${product.name}`}
                    />
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="item-col amount-col">
                  <span className="amount-price">{formatPrice(itemTotal)}</span>
                </div>
                
                <div className="item-col action-col">
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => removeItem(item._id)}
                  >
                    Xóa
                  </button>
                  <button className="action-btn similar-btn">
                    Tìm sản phẩm tương tự
                    <FontAwesomeIcon icon={faChevronDown} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Voucher and Shipping Info */}
        <div className="cart-benefits">
          <div className="benefit-item">
            <FontAwesomeIcon icon={faTag} className="benefit-icon" />
            <span>Voucher giảm đến 30k₫</span>
            <a href="#" className="benefit-link">Xem thêm voucher</a>
          </div>
          <div className="benefit-item">
            <FontAwesomeIcon icon={faTruck} className="benefit-icon" />
            <span>Giảm 500.000₫ phí vận chuyển đơn tối thiểu 0₫</span>
            <a href="#" className="benefit-link">Tìm hiểu thêm</a>
          </div>
        </div>

        {/* Summary Section */}
        <div className="cart-summary">
          <div className="summary-row">
            <div className="summary-label">
              <input 
                type="checkbox" 
                checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                onChange={toggleSelectAll}
                className="summary-checkbox"
                aria-label="Chọn tất cả sản phẩm"
              />
              <span>Chọn Tất Cả ({cartItems.length})</span>
            </div>
            <div className="summary-actions">
              <button 
                className="action-link"
                onClick={() => {
                  selectedCartItems.forEach(item => removeItem(item._id));
                }}
              >
                Xóa
              </button>
              <button className="action-link">
                <FontAwesomeIcon icon={faHeart} />
                Lưu vào mục Đã thích
              </button>
            </div>
          </div>

          {/* Icon Denim Voucher */}
          <div className="summary-voucher">
            <FontAwesomeIcon icon={faTicketAlt} className="voucher-icon" />
            <span>Icon Denim Voucher</span>
            {!showCouponForm ? (
              <a 
                href="#" 
                className="voucher-link"
                onClick={(e) => {
                  e.preventDefault();
                  setShowCouponForm(true);
                }}
              >
                Chọn hoặc nhập mã
              </a>
            ) : (
              <div className="coupon-input-group">
                <input 
                  type="text"
                  placeholder="Nhập mã voucher"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="coupon-input"
                />
                <button className="coupon-apply" onClick={applyCoupon}>Áp dụng</button>
                <button 
                  className="coupon-cancel"
                  onClick={() => setShowCouponForm(false)}
                >
                  Hủy
                </button>
              </div>
            )}
          </div>

          {/* Icon Denim Xu */}
          <div className="summary-voucher">
            <FontAwesomeIcon icon={faTag} className="voucher-icon" />
            <span>Icon Denim Xu</span>
            {selectedCartItems.length > 0 ? (
              <>
                <span className="voucher-info">Sử dụng {iconDenimCoins} xu</span>
                <span className="voucher-amount">-{formatPrice(iconDenimCoins * 1000)}</span>
              </>
            ) : (
              <>
                <span className="voucher-disabled">Bạn chưa chọn sản phẩm</span>
                <span className="voucher-amount">-0₫</span>
              </>
            )}
          </div>

          {/* Total */}
          <div className="summary-total">
            <span>Tổng cộng ({selectedCartItems.length} sản phẩm):</span>
            <span className="total-amount">{formatPrice(total)}</span>
          </div>

          {/* Buy Now Button */}
          <Button 
            className="btn-buy-now"
            onClick={handleCheckout}
            disabled={selectedCartItems.length === 0}
          >
            Mua Hàng
          </Button>
        </div>

        {/* Related Products Section */}
        {showRelatedProducts && relatedProducts.length > 0 && (
          <div ref={relatedProductsRef} className="related-products-section">
            <h3 className="related-products-title">Sản phẩm liên quan</h3>
            <div className="related-products-grid">
              {relatedProducts.map((product) => (
                <div 
                  key={product._id} 
                  className="related-product-card"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <img 
                    src={getImageUrl(product.images?.[0])} 
                    alt={product.name}
                    className="related-product-image"
                  />
                  <div className="related-product-info">
                    <div className="related-product-name">{product.name}</div>
                    <div className="related-product-price">
                      <span className="price-current">{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <span className="price-original">{formatPrice(product.originalPrice)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Cart;
