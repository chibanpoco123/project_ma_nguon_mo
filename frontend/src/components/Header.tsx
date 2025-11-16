  // src/components/Header.tsx
  import { Navbar, Container, Nav } from 'react-bootstrap';
  import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
  import { faSearch, faUser, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
  import { Link } from "react-router-dom";

  function Header() {
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
              <Nav.Link href="#outlet" className="text-danger fw-bold">-50% OUTLET</Nav.Link>
            </Nav>
            <div className="d-flex align-items-center">
              <a href="#search" className="nav-icon"><FontAwesomeIcon icon={faSearch} /></a>
              <a href="#user" className="nav-icon"><FontAwesomeIcon icon={faUser} /></a>
              <Link to="/cart" className="nav-icon"><FontAwesomeIcon icon={faShoppingBag} /></Link>
              <Link to="/login"><button> đăng nhập </button></Link>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }

  export default Header;