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
            <a href="#cart" className="nav-icon"><FontAwesomeIcon icon={faShoppingBag} /></a>
            <Link to="/login"><button className="btn btn-outline-dark btn-sm">Đăng nhập</button></Link>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;