import React, { useEffect, useState } from "react";
import { Card, Table, Badge, Alert, Spinner, Collapse, Button } from "react-bootstrap";
import axios from "axios";
import tokenManager from "../../../utils/tokenManager";

interface OrderItem {
  product_id?: {
    name?: string;
  };
  name?: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  order_number: string;
  status: string;
  payment_status?: string;
  total_price: number;
  created_at: string;
  items: OrderItem[];
}

const statusVariant: Record<string, string> = {
  pending: "warning",
  confirmed: "info",
  shipped: "primary",
  delivered: "success",
  cancelled: "secondary",
};

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = tokenManager.getAccessToken();
        if (!token) return;
        const res = await axios.get("http://localhost:3000/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedOrders = res.data || [];
        setAllOrders(fetchedOrders);
      } catch (err: any) {
        setError(err.response?.data?.message || "Không thể tải lịch sử đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders khi filterPaymentStatus thay đổi
  useEffect(() => {
    if (filterPaymentStatus === 'all') {
      setOrders(allOrders);
    } else {
      setOrders(allOrders.filter((order: Order) => order.payment_status === filterPaymentStatus));
    }
  }, [filterPaymentStatus, allOrders]);

  if (loading) {
    return (
      <Card>
        <Card.Body className="d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" />
          <span>Đang tải đơn hàng...</span>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Card.Body>
          <Alert variant="danger" dismissible onClose={() => setError("")}>
            {error}
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Lịch sử mua sắm</span>
          <select
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value)}
            title="Lọc theo trạng thái thanh toán"
            style={{ 
              padding: '6px 12px', 
              borderRadius: '4px', 
              border: '1px solid #ccc',
              fontSize: '14px'
            }}
          >
            <option value="all">Tất cả đơn hàng</option>
            <option value="paid">Đã thanh toán</option>
            <option value="pending">Chờ thanh toán</option>
          </select>
        </div>
      </Card.Header>
      <Card.Body>
        {orders.length === 0 ? (
          <p className="text-muted mb-0">Bạn chưa có đơn hàng nào.</p>
        ) : (
          <Table responsive hover>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Thanh toán</th>
                <th>Tổng tiền</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr>
                    <td>{order.order_number}</td>
                    <td>{new Date(order.created_at).toLocaleString("vi-VN")}</td>
                    <td>
                      <Badge bg={statusVariant[order.status] || "secondary"}>{order.status}</Badge>
                    </td>
                    <td>
                      <Badge bg={order.payment_status === "paid" ? "success" : "warning"}>
                        {order.payment_status || "pending"}
                      </Badge>
                    </td>
                    <td>{order.total_price.toLocaleString("vi-VN")} ₫</td>
                    <td>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setOpenRow((prev) => (prev === order._id ? null : order._id))}
                      >
                        Xem chi tiết
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={6} className="p-0 border-0">
                      <Collapse in={openRow === order._id}>
                        <div className="p-3 bg-light border-top">
                          <h6 className="mb-3">Sản phẩm</h6>
                          <Table size="sm">
                            <thead>
                              <tr>
                                <th>Tên</th>
                                <th>Số lượng</th>
                                <th>Giá</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item, idx) => (
                                <tr key={idx}>
                                  <td>{item.name || item.product_id?.name || "Sản phẩm"}</td>
                                  <td>{item.quantity}</td>
                                  <td>{item.price.toLocaleString("vi-VN")} ₫</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </Collapse>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default OrderHistory;

