
  // src/components/Header.tsx
  import { useState, useEffect } from 'react';
  import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
  import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
  import { faSearch, faUser, faShoppingBag, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
  import { Link, useNavigate } from "react-router-dom";

  interface User {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  }


import SearchBar from './SearchBar';



function Header() {
  const navigate = useNavigate();
  function Header() {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
      // Đọc thông tin user từ localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } catch (err) {
          console.error('Error parsing user data:', err);
        }
      }

      // Lắng nghe sự kiện storage để cập nhật khi đăng nhập/đăng xuất
      const handleStorageChange = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            setUser(userData);
          } catch (err) {
            console.error('Error parsing user data:', err);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      };

      window.addEventListener('storage', handleStorageChange);
      
      // Lắng nghe custom event khi đăng nhập trong cùng tab
      const handleUserLogin = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            setUser(userData);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      };

      window.addEventListener('userLogin', handleUserLogin);
      window.addEventListener('userLogout', handleUserLogin);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('userLogin', handleUserLogin);
        window.removeEventListener('userLogout', handleUserLogin);
      };
    }, []);

    const handleLogout = () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      
      // Dispatch custom event để cập nhật UI
      window.dispatchEvent(new Event('userLogout'));
      
      navigate('/');
    };

    return (
      <Navbar bg="white" expand="lg" className="sticky-top border-bottom">
        <Container fluid className="px-md-5">
<Navbar.Brand as={Link} to="/" className="fw-bolder">
  ICON DENIM
</Navbar.Brand>          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="mx-auto">
              <Nav.Link href="#products">Sản phẩm</Nav.Link>
              <Nav.Link href="#new" className="fw-bold">Hàng Mới</Nav.Link>
              <Nav.Link href="#men-shirt">Áo Nam</Nav.Link>
              <Nav.Link href="#men-pants">Quần Nam</Nav.Link>
              <Nav.Link href="#denim">DENIM</Nav.Link>
              <Nav.Link href="#tech-urban">TechUrban</Nav.Link>
              <Nav.Link href="#outlet" className="text-danger fw-bold">-50% OUTLET</Nav.Link>
            </Nav>
            <div className="d-flex align-items-center gap-3">
              <a href="#search" className="nav-icon" aria-label="Tìm kiếm"><FontAwesomeIcon icon={faSearch} /></a>
              
              {user ? (
                <>
                  <NavDropdown 
                    title={
                      <span className="d-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={faUser} />
                        <span className="text-dark">{user.name || user.email}</span>
                      </span>
                    } 
                    id="user-dropdown"
                    className="nav-icon"
                  >
                    <NavDropdown.ItemText>
                      <div className="px-2">
                        <div className="fw-bold">{user.name}</div>
                        <div className="text-muted small">{user.email}</div>
                      </div>
                    </NavDropdown.ItemText>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={handleLogout}>
                      <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                      Đăng xuất
                    </NavDropdown.Item>
                  </NavDropdown>
                  <Link to="/cart" className="nav-icon position-relative" aria-label="Giỏ hàng">
                    <FontAwesomeIcon icon={faShoppingBag} />
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-icon">
                    <FontAwesomeIcon icon={faUser} />
                  </Link>
                  <Link to="/cart" className="nav-icon" aria-label="Giỏ hàng">
                    <FontAwesomeIcon icon={faShoppingBag} />
                  </Link>
                </>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <Navbar bg="white" expand="lg" className="sticky-top border-bottom">
      <Container fluid className="px-md-5">
        <Navbar.Brand href="#home" className="fw-bolder">ICON DENIM</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="mx-auto">
            <Nav.Link href="#products">Sản phẩm</Nav.Link>
            <Nav.Link href="#new" className="fw-bold">Hàng Mới</Nav.Link>
            <Nav.Link href="#men-shirt">Áo Nam</Nav.Link>
            <Nav.Link href="#men-pants">Quần Nam</Nav.Link>
            <Nav.Link href="#denim">DENIM</Nav.Link>
            <Nav.Link href="#tech-urban">TechUrban</Nav.Link>
            <Link to="/outlet" className="nav-link">
              <span className="text-danger fw-bold">-50% OUTLET</span>
            </Link>
          </Nav>
          <div className="d-flex align-items-center gap-3">
            <SearchBar onSearch={handleSearch} />
            <a href="#user" className="nav-icon"><FontAwesomeIcon icon={faUser} /></a>
            <Link to ="/cart" ><FontAwesomeIcon icon={faShoppingBag} /></Link>
            <Link to="/login"><button className="btn btn-outline-dark btn-sm">Đăng nhập</button></Link>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;