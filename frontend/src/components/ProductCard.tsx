// src/components/ProductCard.tsx
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag, faCheck } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  tag?: string;
  imageUrl: string;
  title: string;
  price: string | number;
  productId?: string; // ID của sản phẩm từ database
  productVariantId?: string; // ID của variant (nếu có)
  showAddToCart?: boolean; // Cho phép hiển thị nút thêm vào giỏ
}

function ProductCard({ 
  tag, 
  imageUrl, 
  title, 
  price, 
  productId,
  productVariantId,
  showAddToCart = true 
}: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();

  const formatPrice = (price: string | number): string => {
    if (typeof price === 'number') {
      return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    }
    return price;
  };

  const handleAddToCart = async () => {
    // Nếu không có productId, không thể thêm vào giỏ
    if (!productId) {
      alert('Sản phẩm chưa có ID từ database. Vui lòng chọn sản phẩm từ danh sách sản phẩm.');
      return;
    }

    setAdding(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (accessToken) {
        // Đã đăng nhập - thêm vào giỏ qua API
        // Chỉ gửi product_variant_id nếu có giá trị, không gửi null
        const requestBody: any = {
          product_id: productId,
          quantity: 1
        };
        
        if (productVariantId) {
          requestBody.product_variant_id = productVariantId;
        }
        
        const response = await axios.post(
          'http://localhost:3000/api/cart/add',
          requestBody,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
        
        // Dispatch event để Cart component có thể refresh
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        // Chưa đăng nhập - lưu vào localStorage (guest cart)
        const guestCart = localStorage.getItem('guestCart');
        let cartItems = guestCart ? JSON.parse(guestCart) : [];
        
        // Kiểm tra xem sản phẩm đã có trong giỏ chưa
        const existingItemIndex = cartItems.findIndex(
          (item: any) => item.id === productId && (!productVariantId || item.size === productVariantId)
        );
        
        const numericPrice = typeof price === 'number' ? price : parseInt(price.replace(/[^0-9]/g, '')) || 0;
        const finalPrice = numericPrice;
        
        if (existingItemIndex >= 0) {
          // Tăng số lượng nếu đã có
          cartItems[existingItemIndex].quantity += 1;
        } else {
          // Thêm mới
          cartItems.push({
            id: productId,
            cartItemId: `${productId}_${productVariantId || 'default'}_${Date.now()}`,
            name: title,
            image: imageUrl,
            price: finalPrice,
            originalPrice: finalPrice,
            quantity: 1,
            size: productVariantId || undefined
          });
        }
        
        localStorage.setItem('guestCart', JSON.stringify(cartItems));
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
        
        // Dispatch event để Cart component có thể refresh
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error: unknown) {
      console.error('Error adding to cart:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
          navigate('/login');
        } else if (error.response?.status === 400) {
          const errorMessage = error.response?.data?.message || 'Dữ liệu không hợp lệ';
          alert(`Lỗi: ${errorMessage}`);
        } else {
          const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng';
          alert(errorMessage);
        }
      } else {
        alert('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng');
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="product-card" style={{ position: 'relative' }}>
      {tag && <span className="product-tag">{tag}</span>}
      <img src={imageUrl} alt={title} className="product-card-img" />
      <div className="product-info">
        <h6 className="product-title">{title}</h6>
        <p className="product-price">{formatPrice(price)}</p>
        {showAddToCart && productId && (
          <Button
            variant={added ? "success" : "primary"}
            size="sm"
            className="w-100 mt-2"
            onClick={handleAddToCart}
            disabled={adding}
            style={{ fontSize: '12px' }}
          >
            {adding ? (
              'Đang thêm...'
            ) : added ? (
              <>
                <FontAwesomeIcon icon={faCheck} className="me-1" />
                Đã thêm
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faShoppingBag} className="me-1" />
                Thêm vào giỏ
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export default ProductCard;