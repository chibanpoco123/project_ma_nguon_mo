import { Routes, Route } from 'react-router-dom';
import Home from '../Home';
import Login from '../components/page/login';
import Order from '../components/page/Order'; // 1. Import component Order mới tạo

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* 2. Thêm các đường dẫn cho trang Order */}
      <Route path="/order" element={<Order />} />      {/* Trường hợp khách vào xem danh sách */}
      <Route path="/order/:id" element={<Order />} />  {/* Trường hợp khách xem chi tiết 1 đơn cụ thể */}
      
    </Routes>
  );
}

export default AppRoutes;