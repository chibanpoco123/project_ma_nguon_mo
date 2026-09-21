import React, { useState, useEffect } from 'react';
import { Container, Card, Alert } from 'react-bootstrap';

const AdminDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    const refreshToken = localStorage.getItem('refreshToken');

    let user = null;
    try {
      if (userStr) {
        user = JSON.parse(userStr);
      }
    } catch (e) {
      console.error('Error parsing user:', e);
    }
    const info = {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      hasRefreshToken: !!refreshToken,
      hasUser: !!userStr,
      user: user,
      isAdminEmail: user?.email?.toLowerCase() === 'admin@icondenim.com',
      isAdminRole: user?.role === 'admin',
      canAccessAdmin: user?.email?.toLowerCase() === 'admin@icondenim.com' && user?.role === 'admin',
      timestamp: new Date().toISOString()
    };

    setDebugInfo(info);
  }, []);

  return (
    <Container fluid className="mt-4">
      <h2>🔍 Debug Information</h2>
      <Alert variant="info" className="mt-3">
        <strong>Thông tin này giúp kiểm tra tại sao không thể truy cập trang admin</strong>
      </Alert>
      {debugInfo && (
        <Card className="mt-3">
          <Card.Header>
            <h5>Thông tin đăng nhập</h5>
          </Card.Header>
          <Card.Body>
            <div className="row">
              <div className="col-md-6">
                <p><strong>Access Token:</strong> {debugInfo.hasToken ? '✅ Có' : '❌ Không có'}</p>
                <p><strong>Token Length:</strong> {debugInfo.tokenLength}</p>
                <p><strong>Refresh Token:</strong> {debugInfo.hasRefreshToken ? '✅ Có' : '❌ Không có'}</p>
                <p><strong>User Data:</strong> {debugInfo.hasUser ? '✅ Có' : '❌ Không có'}</p>
              </div>
              <div className="col-md-6">
                {debugInfo.user && (
                  <>
                    <p><strong>Email:</strong> <code>{debugInfo.user.email || 'N/A'}</code></p>
                    <p><strong>Role:</strong> <code>{debugInfo.user.role || 'N/A'}</code></p>
                    <p><strong>Name:</strong> {debugInfo.user.name || 'N/A'}</p>
                    <p><strong>ID:</strong> {debugInfo.user.id || 'N/A'}</p>
                  </>
                )}
              </div>
            </div>

            <hr />

            <div className="mt-3">
              <h6>Kiểm tra quyền Admin:</h6>
              <ul>
                <li>
                  Email là <code>admin@icondenim.com</code>: 
                  {debugInfo.isAdminEmail ? ' ✅' : ' ❌'}
                </li>
                <li>
                  Role là <code>admin</code>: 
                  {debugInfo.isAdminRole ? ' ✅' : ' ❌'}
                </li>
                <li>
                  <strong>Có thể truy cập admin:</strong> 
                  {debugInfo.canAccessAdmin ? ' ✅ CÓ' : ' ❌ KHÔNG'}
                </li>
              </ul>
            </div>

            {!debugInfo.canAccessAdmin && (
              <Alert variant="warning" className="mt-3">
                <strong>⚠️ Không thể truy cập admin vì:</strong>
                <ul className="mb-0 mt-2">
                  {!debugInfo.hasToken && <li>Không có Access Token</li>}
                  {!debugInfo.hasUser && <li>Không có thông tin User</li>}
                  {!debugInfo.isAdminEmail && <li>Email không phải admin@icondenim.com</li>}
                  {!debugInfo.isAdminRole && <li>Role không phải admin</li>}
                </ul>
              </Alert>
            )}

            <div className="mt-3">
              <h6>Hướng dẫn:</h6>
              <ol>
                <li>Nếu không có token: Đăng nhập lại</li>
                <li>Nếu email không đúng: Đăng nhập với <code>admin@icondenim.com</code></li>
                <li>Nếu role không đúng: Tạo lại tài khoản với email <code>admin@icondenim.com</code></li>
                <li>Chạy script: <code>cd backend && npm run create-admin</code></li>
              </ol>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default AdminDebug;

