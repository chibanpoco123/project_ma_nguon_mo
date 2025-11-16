import { Routes, Route } from 'react-router-dom';
import Home from '../Home';
import Login from '../components/page/login';
import Cart from '../components/page/Cart';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminProducts from '../components/admin/AdminProducts';
import AdminDatabase from '../components/admin/AdminDatabase';
import AdminUsers from '../components/admin/AdminUsers';
import AdminDebug from '../components/admin/AdminDebug';
import ProtectedRoute from '../components/admin/ProtectedRoute';
import Checkout from '../components/page/checkout';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/debug" element={<AdminDebug />} />

      
      {/* Admin Routes - Protected */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<div>Quản lý Danh mục - Đang phát triển</div>} />
        <Route path="posts" element={<div>Quản lý Bài viết - Đang phát triển</div>} />
        <Route path="contact" element={<div>Liên hệ - Đang phát triển</div>} />
        <Route path="orders" element={<div>Đơn hàng - Đang phát triển</div>} />
        <Route path="database" element={<AdminDatabase />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
