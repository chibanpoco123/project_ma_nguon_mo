import { Navbar, Container, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from "react-router-dom";
import SearchBar from './SearchBar';


function Header() {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  // Handle navigation to home page sections
  const handleSectionClick = (sectionId: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const currentPath = window.location.pathname;
    
    if (currentPath !== '/') {
      // If not on home page, navigate to home first
      navigate('/');
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // If already on home page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <Navbar bg="white" expand="lg" className="sticky-top border-bottom">
      <Container fluid className="px-md-5">
        <Navbar.Brand as={Link} to="/" className="fw-bolder">ICON DENIM</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="mx-auto">
            <Nav.Link href="#products" onClick={(e) => handleSectionClick('products', e)}>Sản phẩm</Nav.Link>
            <Nav.Link href="#new" className="fw-bold" onClick={(e) => handleSectionClick('new', e)}>Hàng Mới</Nav.Link>
            <Nav.Link href="#men-shirt" onClick={(e) => handleSectionClick('men-shirt', e)}>Áo Nam</Nav.Link>
            <Nav.Link href="#men-pants" onClick={(e) => handleSectionClick('men-pants', e)}>Quần Nam</Nav.Link>
            <Nav.Link href="#denim" onClick={(e) => handleSectionClick('denim', e)}>DENIM</Nav.Link>
            <Nav.Link href="#tech-urban" onClick={(e) => handleSectionClick('tech-urban', e)}>TechUrban</Nav.Link>
            <Link to="/outlet" className="nav-link">
              <span className="text-danger fw-bold">-50% OUTLET</span>
            </Link>
          </Nav>
          <div className="d-flex align-items-center gap-3">
            <SearchBar onSearch={handleSearch} />
            <a href="#user" className="nav-icon"><FontAwesomeIcon icon={faUser} /></a>
            <Link to="/cart" className="nav-icon"><FontAwesomeIcon icon={faShoppingBag} /></Link>
            <Link to="/login"><button className="btn btn-outline-dark btn-sm">Đăng nhập</button></Link>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;