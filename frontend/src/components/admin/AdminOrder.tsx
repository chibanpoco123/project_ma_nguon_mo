// src/components/admin/AdminOrder.tsx
import React, { useEffect, useState } from 'react';
import './AdminOrder.css'; // Nhớ tạo file css này

interface Order {
  _id: string;
  orderCode?: string;
  customer: {
    name: string;
    phone: string;
  };
  costs: {
    total: number;
  };
  createdAt: string;
  status: string;
}

const AdminOrder: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 1. LẤY DANH SÁCH ĐƠN HÀNG ---
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/Order'); // API lấy all đơn
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. XỬ LÝ CẬP NHẬT TRẠNG THÁI ---
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
        // Gọi API update (Bạn cần viết thêm API này ở backend)
        const res = await fetch(`http://localhost:3000/api/Order/${id}`, {
            method: 'PUT', // Hoặc PATCH
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            alert("Cập nhật thành công!");
            fetchOrders(); // Tải lại danh sách
        } else {
            alert("Lỗi cập nhật");
        }
    } catch (error) {
        console.error(error);
    }
  };

  const formatCurrency = (num: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

  if (loading) return <div className="p-4">Đang tải danh sách đơn...</div>;

  return (
    <div className="admin-order-container">
      <h2 className="page-title">Quản lý Đơn hàng</h2>
      
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="font-bold">#{order.orderCode || order._id.slice(-6)}</td>
                <td>
                    <div className="customer-name">{order.customer.name}</div>
                    <div className="customer-phone">{order.customer.phone}</div>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className="text-red">{formatCurrency(order.costs.total)}</td>
                
                {/* Cột chọn trạng thái */}
                <td>
                  <select 
                    className={`status-select ${order.status.toLowerCase()}`}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  >
                    <option value="Pending">Chờ xử lý</option>
                    <option value="Shipping">Đang giao</option>
                    <option value="Completed">Hoàn thành</option>
                    <option value="Cancelled">Đã hủy</option>
                  </select>
                </td>
                
                <td>
                  <button className="btn-view" onClick={() => alert(`Xem chi tiết đơn ${order._id}`)}>
                    Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrder;