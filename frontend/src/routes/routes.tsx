import { Routes, Route } from 'react-router-dom';
import Home from '../Home';
import Login from '../components/page/login';
import OutletPage from '../components/page/Outlet';
import SearchResultsPage from '../components/page/SearchResults';
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
import Oder from '../components/admin/AdminOrder'; // Trang của Admin

// --- 1. THÊM DÒNG NÀY (Import trang Order của khách) ---
import Order from '../components/page/Order'; 

import Header from '../components/Header';
import Footer from '../components/Footer';

function AppRoutes() {
  return (
    <Routes>
      {/* Route Trang chủ đầy đủ (có Header/Footer) */}
      <Route 
        path="/" 
        element={
          <>
            <Header />
            <Home/>
            <Footer />
          </>
        } 
      />
      
      {/* --- 2. THÊM ROUTE CHO KHÁCH HÀNG XEM ĐƠN --- */}
      {/* Trang danh sách hoặc đơn mới nhất */}
      <Route 
        path="/order" 
        element={
          <>
            <Header />
            <Order />
            <Footer />
          </>
        } 
      />
      
      {/* Trang chi tiết đơn hàng (khi có ID) */}
      <Route 
        path="/order/:id" 
        element={
          <>
            <Header />
            <Order />
            <Footer />
          </>
        } 
      />

      {/* Các Route khác */}
      <Route path="/login" element={<Login />} />
      <Route path="/outlet" element={<OutletPage />} />
      <Route path="/search" element={<SearchResultsPage />} />
      <Route path="/reset-password" element={<ResetPassword />} />
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
        
        {/* Trang Quản lý đơn hàng của Admin */}
        <Route path="order" element={<Oder/>} />
        
        <Route path="database" element={<AdminDatabase />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;