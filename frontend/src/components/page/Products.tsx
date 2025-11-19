import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import ProductCard from '../ProductCard';
import axios from 'axios';

interface Product {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  images: string[];
  category_id?: {
    _id: string;
    name: string;
  };
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/api/products');
        setProducts(response.data);
        setError('');
      } catch (err: unknown) {
        console.error('Error fetching products:', err);
        setError('Không thể tải danh sách sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const formatPrice = (price: number, discount?: number): number => {
    if (discount) {
      return price - (price * discount / 100);
    }
    return price;
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <p>Đang tải sản phẩm...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Danh sách sản phẩm</h2>
      {products.length === 0 ? (
        <Alert variant="info">Chưa có sản phẩm nào</Alert>
      ) : (
        <Row xs={2} md={3} lg={4} className="g-3">
          {products.map((product) => (
            <Col key={product._id}>
              <ProductCard
                imageUrl={product.images?.[0] || ''}
                title={product.name}
                price={formatPrice(product.price || 0, product.discount)}
                productId={product._id}
                showAddToCart={true}
              />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Products;

