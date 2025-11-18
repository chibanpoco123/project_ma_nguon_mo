import { Routes, Route } from 'react-router-dom';
import Home from '../Home';
import Login from '../components/page/login';
<<<<<<< HEAD
import OutletPage from '../components/page/Outlet';
import SearchResultsPage from '../components/page/SearchResults';
=======
>>>>>>> e616dfb9e62865f112ae1eb6149bdec4fdda2cb4

import ResetPassword from '../components/page/ResetPassword';
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
<<<<<<< HEAD
      <Route path="/outlet" element={<OutletPage />} />
      <Route path="/search" element={<SearchResultsPage />} />
=======

      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/debug" element={<AdminDebug />} />
      <Route path="/checkout" element={<Checkout />} />
      
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
>>>>>>> e616dfb9e62865f112ae1eb6149bdec4fdda2cb4
    </Routes>
  );
}

export default AppRoutes;
