import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

function PaymentSuccess() {
  const location = useLocation();
  const orderId = new URLSearchParams(location.search).get("order");

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
      const token = localStorage.getItem("token");

const res = await axios.get(`/api/order/${orderId}`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
        console.log(res.data)
        setOrder(res.data);
      } catch (error) {
        console.error("Failed to load order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div style={styles.center}>
        <h2>Đang tải thông tin thanh toán...</h2>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={styles.center}>
        <h2>Không tìm thấy đơn hàng!</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={{ color: "#28a745" }}>Thanh toán thành công! 🎉</h1>

        <p>Mã đơn hàng:</p>
        <h2>{order._id}</h2>

        <p>Số tiền:</p>
        <h2>{order.total} VND</h2>

        <button style={styles.button} onClick={() => (window.location.href = "/")}>
          Quay về trang chủ
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f5",
  },
  card: {
    width: "400px",
    padding: "30px",
    borderRadius: "12px",
    background: "#fff",
    textAlign: "center",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  center: {
    width: "100%",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    marginTop: "20px",
    padding: "12px 20px",
    borderRadius: "8px",
    backgroundColor: "#28a745",
    color: "#fff",
    fontSize: "16px",
    border: "none",
    cursor: "pointer",
  },
};

export default PaymentSuccess;
