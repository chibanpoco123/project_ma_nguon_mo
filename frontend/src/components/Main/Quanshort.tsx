// src/components/ShortsSection.tsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import ProductCard from "../ProductCard";

// Banner
import shortsPromoBanner from "../../assets/quanshort-promo-banner.jpg";

interface Product {
  imageUrl: string;
  title: string;
  price: string;
  productId: string;
  is_new?: boolean;
  updated_at?: string;
  created_at?: string;
}

const QUAN_SHORT_ID = "691c9ebd79b13d609112c4c5";

const ShortsSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchShorts = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/products?category_id=${QUAN_SHORT_ID}`
        );
        const data = await res.json();

        if (Array.isArray(data)) {
          const apiProducts: Product[] = data.slice(0, 8).map((item: any) => ({
            imageUrl: item.images?.[0] || "",
            title: item.name,
            price: item.price
              ? item.price.toLocaleString("vi-VN") + "₫"
              : "Liên hệ",
            productId: item._id,
            is_new: item.is_new === true,
            updated_at: item.updated_at,
            created_at: item.created_at,
          }));

          setProducts(apiProducts);
        }
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm Quần Short:", error);
      }
    };

    fetchShorts();
  }, []);

  return (
    <Container as="section" className="py-3">
      {/* Thanh điều hướng */}
      <div className="category-nav">
        <a href="#" className="active">Quần Short</a>
        <a href="#">Quần Jean</a>
        <a href="#">Quần Tây</a>
      </div>

      <Row>
        {/* Banner trái */}
        <Col lg={3} className="d-none d-lg-block">
          <div className="category-promo-banner">
            <img
              src={shortsPromoBanner}
              alt="Quần Short"
              className="img-fluid"
            />
            <div className="promo-content">
              <h2>QUẦN SHORT</h2>
              <Link to="/men-pants">
                <Button variant="light" size="sm">
                  XEM NGAY
                </Button>
              </Link>
            </div>
          </div>
        </Col>

        {/* Grid sản phẩm */}
        <Col lg={9}>
          <Row xs={2} md={3} lg={4} className="g-3">
            {products.map((product) => (
              <Col key={product.productId}>
                <Link
                  to={`/product/${product.productId}`}
                  className="product-link"
                >
                  <ProductCard {...product} />
                </Link>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Xem tất cả */}
      <div className="text-center mt-4">
        <Link to="/men-pants">
          <Button variant="outline-dark">Xem tất cả</Button>
        </Link>
      </div>
    </Container>
  );
};

export default ShortsSection;
