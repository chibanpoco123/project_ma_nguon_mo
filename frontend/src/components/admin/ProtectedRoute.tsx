import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import '../../css/admin.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
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
          setIsAdmin(user.role === 'admin' && isAdminEmail);
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
        state={{ from: location, message: 'Vui lòng đăng nhập để truy cập trang quản trị' }} 
        replace 
      />
    );
  }

  // Redirect if admin required but user is not admin
  if (requireAdmin && !isAdmin) {
    return (
      <div className="protected-route-error">
        <h2>⚠️ Không có quyền truy cập</h2>
        <p>Chỉ tài khoản <strong>admin@icondenim.com</strong> mới có quyền truy cập trang quản trị.</p>
        <p className="text-muted">Vui lòng đăng nhập với email quản trị viên để tiếp tục.</p>
        <button 
          className="btn btn-primary"
          onClick={() => window.location.href = '/'}
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

