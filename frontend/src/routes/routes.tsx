import { Routes, Route } from 'react-router-dom';
import Home from '../Home';
import Login from '../components/page/login';
import Checkout from '../components/page/checkout';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/checkout" element={<Checkout />} />
    </Routes>
  );
}

export default AppRoutes;
