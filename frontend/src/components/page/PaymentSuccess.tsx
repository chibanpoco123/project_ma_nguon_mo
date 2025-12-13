import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Alert, Spinner } from 'react-bootstrap';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const paymentStatus = searchParams.get('status');
    
    setStatus(paymentStatus || 'success');
    setLoading(false);

    // Redirect về profile sau 3 giây
    const timer = setTimeout(() => {
      navigate('/profile');
    }, 3000);

    return () => clearTimeout(timer);
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <Card>
        <Card.Body className="text-center">
          {status === 'success' ? (
            <>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
              <h2 style={{ color: '#28a745', marginBottom: '15px' }}>
                Thanh toán thành công!
              </h2>
              <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
                Đơn hàng của bạn đã được xác nhận và sẽ được xử lý sớm nhất.
              </p>
              <p style={{ fontSize: '14px', color: '#999' }}>
                Đang chuyển hướng đến trang hồ sơ...
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
              <h2 style={{ color: '#dc3545', marginBottom: '15px' }}>
                Thanh toán thất bại
              </h2>
              <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
                Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.
              </p>
              <p style={{ fontSize: '14px', color: '#999' }}>
                Đang chuyển hướng đến trang hồ sơ...
              </p>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
