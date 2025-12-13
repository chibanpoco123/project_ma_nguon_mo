import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminOrder.css';

interface Order {
  _id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total_price: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  status: string;
  items?: Array<{
    product_id: string | {
      _id: string;
      name: string;
      images?: string[];
      price: number;
    };
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
}

const AdminOrder: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken");

  // ✅ CẤU HÌNH QUAN TRỌNG: Trỏ thẳng sang cổng 3000 của Backend
  // Web bạn chạy ở 5173 nhưng sẽ gọi dữ liệu từ 3000 -> Điều này hoàn toàn đúng.
  const API_BASE_URL = 'http://localhost:3000/api/Order';

  useEffect(() => {
    const timeoutId = setTimeout(() => {
        fetchOrders();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterPaymentStatus]);

  const fetchOrders = async () => {
    try {
      // Setup tìm kiếm
      const queryParam = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const url = `${API_BASE_URL}/admin/all${queryParam}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Gửi kèm Token để qua bảo mật
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        // Xử lý lỗi nếu token hết hạn
        if (res.status === 401 || res.status === 403) {
             console.error("Lỗi quyền truy cập! Vui lòng đăng nhập lại.");
        }
        throw new Error("Lỗi tải dữ liệu từ Server");
      }

      const data = await res.json();
      console.log('📦 [AdminOrder] Received orders from API:', data.length);
      if (data.length > 0 && data[0].items) {
        console.log('📦 [AdminOrder] First order items:', data[0].items);
        if (data[0].items[0]) {
          console.log('📦 [AdminOrder] First item:', data[0].items[0]);
          console.log('📦 [AdminOrder] First item product_id:', data[0].items[0].product_id);
        }
      }
      
      let filteredData = data;
      
      // Filter theo payment_status nếu có
      if (filterPaymentStatus !== 'all') {
        filteredData = data.filter((order: Order) => order.payment_status === filterPaymentStatus);
      }
      
      setOrders(filteredData);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    if(!window.confirm(`Xác nhận đổi trạng thái sang: ${newStatus}?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        alert("Cập nhật thành công!");
        fetchOrders(); // Load lại danh sách
      } else {
        alert("Lỗi cập nhật. Kiểm tra lại server.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formatCurrency = (num: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getProductId = (item: Order['items'][0]): string => {
    if (typeof item.product_id === 'string') {
      return item.product_id;
    }
    return item.product_id?._id || '';
  };

  const getProductName = (item: Order['items'][0]): string => {
    if (typeof item.product_id === 'object' && item.product_id) {
      return item.product_id.name || item.name || 'Sản phẩm';
    }
    return item.name || 'Sản phẩm';
  };

  const getProductImage = (item: Order['items'][0]): string => {
    if (typeof item.product_id === 'object' && item.product_id?.images && item.product_id.images.length > 0) {
      return item.product_id.images[0];
    }
    return item.image || '/no-image.png';
  };

  const handleViewReviews = (productId: string) => {
    navigate(`/product/${productId}`, { state: { showReviewTab: true } });
  };

  if (loading) return <div className="p-4">Đang tải danh sách đơn...</div>;

  return (
    <div className="admin-order-container">
      <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 className="page-title" style={{ margin: 0 }}>Quản lý Đơn hàng</h2>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value)}
            title="Lọc theo trạng thái thanh toán"
            style={{ 
              padding: '10px', 
              borderRadius: '6px', 
              border: '1px solid #ccc',
              outline: 'none',
              fontSize: '14px'
            }}
          >
            <option value="all">Tất cả thanh toán</option>
            <option value="paid">Đã thanh toán</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="failed">Thanh toán thất bại</option>
            <option value="refunded">Đã hoàn tiền</option>
          </select>
        
        <input 
          type="text" 
          placeholder="🔍 Tìm mã đơn, tên khách..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            padding: '10px', 
            width: '300px', 
            borderRadius: '6px', 
            border: '1px solid #ccc',
            outline: 'none'
          }}
        />
        </div>
      </div>
      
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Thanh toán</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
                orders.map((order) => (
                <React.Fragment key={order._id}>
                <tr>
                    <td className="font-bold">#{order.order_number}</td>
                    <td>
                        <div className="customer-name" style={{fontWeight: 600}}>{order.customer_name}</div>
                        <div className="customer-phone" style={{fontSize: '0.9em', color: '#666'}}>{order.customer_phone}</div>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                    <td className="text-red font-bold">{formatCurrency(order.total_price)}</td>
                    
                    <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <span className="badge-payment" style={{ 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            background: '#f0f0f0', 
                              fontSize: '12px',
                              display: 'inline-block'
                        }}>
                              {order.payment_method || 'COD'}
                          </span>
                          <span style={{ 
                              padding: '4px 8px', 
                              borderRadius: '4px', 
                              background: order.payment_status === 'paid' ? '#d4edda' : 
                                         order.payment_status === 'pending' ? '#fff3cd' :
                                         order.payment_status === 'failed' ? '#f8d7da' : '#e2e3e5',
                              color: order.payment_status === 'paid' ? '#155724' : 
                                     order.payment_status === 'pending' ? '#856404' :
                                     order.payment_status === 'failed' ? '#721c24' : '#383d41',
                              fontSize: '11px',
                              fontWeight: '600',
                              display: 'inline-block'
                          }}>
                              {order.payment_status === 'paid' ? '✓ Đã thanh toán' : 
                               order.payment_status === 'pending' ? '⏳ Chờ thanh toán' :
                               order.payment_status === 'failed' ? '✗ Thất bại' :
                               order.payment_status === 'refunded' ? '↩ Đã hoàn' : 'Chờ thanh toán'}
                        </span>
                        </div>
                    </td>
                    
                    <td>
                    <select 
                        className={`status-select ${order.status}`}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        title={`Thay đổi trạng thái đơn hàng ${order.order_number}`}
                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        <option value="pending">Chờ xử lý</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="shipped">Đang giao hàng</option>
                        <option value="delivered">Đã giao thành công</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                    </td>
                    
                    <td>
                    <button 
                        className="btn-view" 
                        onClick={() => toggleOrderDetails(order._id)}
                        style={{ 
                            cursor: 'pointer', 
                            padding: '6px 12px', 
                            background: expandedOrderId === order._id ? '#28a745' : '#007bff', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '4px' 
                        }}
                    >
                        {expandedOrderId === order._id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                    </button>
                    </td>
                </tr>
                {expandedOrderId === order._id && order.items && order.items.length > 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '20px', background: '#f8f9fa' }}>
                      <div style={{ marginBottom: '15px', fontWeight: 600, fontSize: '16px', color: '#333' }}>
                        📦 Danh sách sản phẩm ({order.items.length} sản phẩm)
                      </div>
                      <div style={{ display: 'grid', gap: '15px' }}>
                        {order.items.map((item, index) => {
                          const productId = getProductId(item);
                          const productName = getProductName(item);
                          const productImage = getProductImage(item);
                          
                          return (
                            <div 
                              key={index} 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                padding: '15px', 
                                background: '#fff', 
                                borderRadius: '8px',
                                border: '1px solid #dee2e6',
                                gap: '20px'
                              }}
                            >
                              <img 
                                src={productImage} 
                                alt={productName}
                                style={{ 
                                  width: '80px', 
                                  height: '80px', 
                                  objectFit: 'cover', 
                                  borderRadius: '6px',
                                  border: '1px solid #ddd'
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/no-image.png';
                                }}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '8px', color: '#333' }}>
                                  {productName}
                                </div>
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '14px', color: '#666' }}>
                                  <span><strong>Giá:</strong> {formatCurrency(item.price)}</span>
                                  <span><strong>Số lượng:</strong> {item.quantity}</span>
                                  <span><strong>Thành tiền:</strong> <span style={{ color: '#e74c3c', fontWeight: 600 }}>{formatCurrency(item.price * item.quantity)}</span></span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleViewReviews(productId)}
                                style={{
                                  padding: '8px 16px',
                                  background: '#17a2b8',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: 500,
                                  whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={(e) => {
                                  (e.target as HTMLButtonElement).style.background = '#138496';
                                }}
                                onMouseLeave={(e) => {
                                  (e.target as HTMLButtonElement).style.background = '#17a2b8';
                                }}
                              >
                                ⭐ Xem đánh giá
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
                ))
            ) : (
                <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                        Không tìm thấy đơn hàng nào.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrder;