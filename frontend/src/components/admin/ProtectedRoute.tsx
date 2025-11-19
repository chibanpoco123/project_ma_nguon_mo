import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import '../../css/admin.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  redirectMessage?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  redirectMessage = 'Vui lòng đăng nhập để truy cập trang này'
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');
      
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);

      // Check admin role if required
      // Chỉ email admin@icondenim.com mới có quyền truy cập
      if (requireAdmin && userStr) {
        try {
          const user = JSON.parse(userStr);
          const isAdminEmail = user.email && user.email.toLowerCase() === 'admin@icondenim.com';
          const hasAdminRole = user.role === 'admin';
          
          // Debug logging
          console.log('🔍 Admin Check:', {
            email: user.email,
            role: user.role,
            isAdminEmail,
            hasAdminRole,
            result: isAdminEmail && hasAdminRole
          });
          
          setIsAdmin(isAdminEmail && hasAdminRole);
        } catch (err) {
          console.error('Error parsing user data:', err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(true); // If admin not required, allow access
      }
    };

    checkAuth();

    // Listen for storage changes (e.g., login in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [requireAdmin, location]);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="protected-route-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang kiểm tra...</span>
        </div>
        <p>Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location, message: redirectMessage }} 
        replace 
      />
    );
  }

  // Redirect if admin required but user is not admin
  if (requireAdmin && !isAdmin) {
    const userStr = localStorage.getItem('user');
    let userInfo = 'Không có thông tin';
    try {
      if (userStr) {
        const user = JSON.parse(userStr);
        userInfo = `Email: ${user.email || 'N/A'}, Role: ${user.role || 'N/A'}`;
      }
    } catch (e) {
      userInfo = 'Lỗi đọc thông tin user';
    }

    return (
      <div className="protected-route-error">
        <h2>⚠️ Không có quyền truy cập</h2>
        <p>Chỉ tài khoản <strong>admin@icondenim.com</strong> mới có quyền truy cập trang quản trị.</p>
        <div className="alert alert-info mt-3">
          <strong>Thông tin tài khoản hiện tại:</strong><br />
          <code>{userInfo}</code>
        </div>
        <p className="text-muted mt-3">Vui lòng đăng nhập với email <strong>admin@icondenim.com</strong> để tiếp tục.</p>
        <div className="mt-3">
          <button 
            className="btn btn-primary me-2"
            onClick={() => window.location.href = '/login'}
          >
            Đăng nhập lại
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => window.location.href = '/'}
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

