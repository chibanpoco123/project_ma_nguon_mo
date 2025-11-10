import { Routes, Route } from 'react-router-dom';
import Home from '../Home';
import Login from '../components/page/login';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default AppRoutes;
