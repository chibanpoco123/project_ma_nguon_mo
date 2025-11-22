import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Table, Button, Form, Modal, Alert } from 'react-bootstrap';
import ProductForm from './ProductForm';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  quantity: number;
  category_id?: {
    _id: string;
    name: string;
  };
  images: string[];
  is_new?: boolean;
  created_at: string;
  updated_at: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('name');
  const [filterIsNew, setFilterIsNew] = useState<string>('all'); // 'all', 'new', 'not-new'
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const API_URL = 'http://localhost:3000/api/products';
  const CATEGORIES_URL = 'http://localhost:3000/api/categories';

  // Get auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setProducts(response.data);
      setError('');
    } catch (err: any) {
      setError('Không thể tải danh sách sản phẩm: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(CATEGORIES_URL);
      setCategories(response.data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Handle add new product
  const handleAddNew = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  // Handle edit product
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  // Handle delete product
  const handleDelete = (id: string) => {
    setDeleteProductId(id);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteProductId) return;

    try {
      await axios.delete(`${API_URL}/${deleteProductId}`, getAuthHeaders());
      setSuccess('Xóa sản phẩm thành công!');
      fetchProducts();
      setShowDeleteModal(false);
      setDeleteProductId(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Không thể xóa sản phẩm: ' + (err.response?.data?.error || err.message));
      setTimeout(() => setError(''), 3000);
    }
  };

  // Handle form submit (add or update)
  const handleFormSubmit = () => {
    setShowModal(false);
    setSelectedProduct(null);
    fetchProducts();
    setSuccess('Thao tác thành công!');
    setTimeout(() => setSuccess(''), 3000);
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const searchValue = searchTerm.toLowerCase();
    
    // Filter by search term
    let matchesSearch = true;
    if (searchTerm) {
      if (searchBy === 'name') {
        matchesSearch = product.name.toLowerCase().includes(searchValue);
      } else if (searchBy === 'category') {
        matchesSearch = product.category_id?.name.toLowerCase().includes(searchValue) || false;
      }
    }
    
    // Filter by is_new status
    let matchesIsNew = true;
    if (filterIsNew === 'new') {
      matchesIsNew = product.is_new === true;
    } else if (filterIsNew === 'not-new') {
      matchesIsNew = product.is_new !== true;
    }
    
    return matchesSearch && matchesIsNew;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  return (
    <div className="admin-products">
      <Container fluid>
        {/* Breadcrumbs */}
        <nav className="admin-breadcrumbs">
          <span>Trang chủ</span> / <span>Danh mục</span> / <span>Sản phẩm</span>
        </nav>

        {/* Alerts */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Action Bar */}
        <div className="admin-action-bar">
          <div className="admin-action-group">
            <Form.Select size="sm" style={{ width: '150px' }}>
              <option>Tác vụ</option>
            </Form.Select>
            <Form.Control
              type="text"
              placeholder="Tìm kiếm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="sm"
              style={{ width: '200px' }}
            />
            <Form.Select
              size="sm"
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
              style={{ width: '150px' }}
            >
              <option value="name">Tìm theo tên</option>
              <option value="category">Tìm theo danh mục</option>
            </Form.Select>
            <Form.Select
              size="sm"
              value={filterIsNew}
              onChange={(e) => setFilterIsNew(e.target.value)}
              style={{ width: '150px' }}
              aria-label="Lọc theo trạng thái hàng mới"
            >
              <option value="all">Tất cả</option>
              <option value="new">Hàng mới</option>
              <option value="not-new">Không phải hàng mới</option>
            </Form.Select>
            <Form.Select
              size="sm"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              style={{ width: '150px' }}
            >
              <option value={10}>Hiển thị 10</option>
              <option value={20}>Hiển thị 20</option>
              <option value={50}>Hiển thị 50</option>
              <option value={100}>Hiển thị 100</option>
            </Form.Select>
          </div>
          <Button variant="primary" onClick={handleAddNew}>
            + Thêm mới
          </Button>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="text-center py-5">
            <p>Đang tải...</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>STT</th>
                  <th>Danh mục</th>
                  <th>Tiêu đề</th>
                  <th style={{ width: '100px' }}>Ảnh</th>
                  <th>Giá</th>
                  <th>Giảm giá</th>
                  <th>Số lượng</th>
                  <th style={{ width: '120px' }}>Hàng mới</th>
                  <th style={{ width: '100px' }}>Tác vụ</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4">
                      Không có sản phẩm nào
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => (
                    <tr key={product._id}>
                      <td>{index + 1}</td>
                      <td>{product.category_id?.name || 'Chưa phân loại'}</td>
                      <td>
                        <strong>{product.name}</strong>
                      </td>
                      <td>
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '4px',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '60px',
                              height: '60px',
                              backgroundColor: '#f0f0f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '4px',
                            }}
                          >
                            <span>No img</span>
                          </div>
                        )}
                      </td>
                      <td>{formatPrice(product.price || 0)}</td>
                      <td>{product.discount || 0}%</td>
                      <td>{product.quantity || 0}</td>
                      <td>
                        {product.is_new ? (
                          <span
                            style={{
                              display: 'inline-block',
                              backgroundColor: '#1A0F4A',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                            }}
                          >
                            HÀNG MỚI
                          </span>
                        ) : (
                          <span style={{ color: '#999', fontSize: '0.875rem' }}>-</span>
                        )}
                      </td>
                      <td>
                        <div className="admin-action-buttons">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            title="Sửa"
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(product._id)}
                            title="Xóa"
                          >
                            🗑️
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {selectedProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ProductForm
              product={selectedProduct}
              categories={categories}
              onSuccess={handleFormSubmit}
              onCancel={() => setShowModal(false)}
            />
          </Modal.Body>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Xác nhận xóa</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Bạn có chắc chắn muốn xóa sản phẩm này không?</p>
            <p className="text-muted">Hành động này không thể hoàn tác.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Hủy
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Xóa
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default AdminProducts;

