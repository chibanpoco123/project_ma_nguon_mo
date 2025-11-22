import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  quantity: number;
  category_id?: string;
  images: string[];
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  product: Product | null;
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    discount: 0,
    quantity: 0,
    category_id: '',
    images: [] as string[],
  });
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        discount: product.discount || 0,
        quantity: product.quantity || 0,
        category_id: product.category_id?._id || product.category_id || '',
        images: product.images || [],
      });
      setImageUrls(product.images && product.images.length > 0 ? product.images : ['']);
    } else {
      // Reset form for new product
      setFormData({
        name: '',
        description: '',
        price: 0,
        discount: 0,
        quantity: 0,
        category_id: '',
        images: [],
      });
      setImageUrls(['']);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'discount' || name === 'quantity' 
        ? Number(value) 
        : value,
    }));
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageUrl = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls.length > 0 ? newUrls : ['']);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Filter out empty image URLs
    const validImages = imageUrls.filter((url) => url.trim() !== '');

    const submitData = {
      ...formData,
      images: validImages,
    };

    try {
      const token = localStorage.getItem('accessToken');
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      if (product) {
        // Update existing product
        await axios.put(
          `http://localhost:3000/api/products/${product._id}`,
          submitData,
          { headers }
        );
      } else {
        // Create new product
        await axios.post(
          'http://localhost:3000/api/products',
          submitData,
          { headers }
        );
      }

      onSuccess();
    } catch (err: any) {
      setError(
        err.response?.data?.error || 
        err.message || 
        'Có lỗi xảy ra khi lưu sản phẩm'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Tên sản phẩm *</Form.Label>
        <Form.Control
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Nhập tên sản phẩm"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Mô tả</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Nhập mô tả sản phẩm"
        />
      </Form.Group>

      <div className="row">
        <Form.Group className="mb-3 col-md-4">
          <Form.Label>Giá *</Form.Label>
          <Form.Control
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="1000"
            placeholder="0"
          />
        </Form.Group>

        <Form.Group className="mb-3 col-md-4">
          <Form.Label>Giảm giá (%)</Form.Label>
          <Form.Control
            type="number"
            name="discount"
            value={formData.discount}
            onChange={handleChange}
            min="0"
            max="100"
            placeholder="0"
          />
        </Form.Group>

        <Form.Group className="mb-3 col-md-4">
          <Form.Label>Số lượng *</Form.Label>
          <Form.Control
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            min="0"
            placeholder="0"
          />
        </Form.Group>
      </div>

      <Form.Group className="mb-3">
        <Form.Label>Danh mục</Form.Label>
        <Form.Select
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
        >
          <option value="">Chọn danh mục</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Hình ảnh (URLs)</Form.Label>
        {imageUrls.map((url, index) => (
          <div key={index} className="d-flex mb-2">
            <Form.Control
              type="url"
              value={url}
              onChange={(e) => handleImageUrlChange(index, e.target.value)}
              placeholder={`URL hình ảnh ${index + 1}`}
              className="me-2"
            />
            {imageUrls.length > 1 && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => removeImageUrl(index)}
              >
                Xóa
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline-secondary"
          size="sm"
          onClick={addImageUrl}
        >
          + Thêm hình ảnh
        </Button>
      </Form.Group>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>
    </Form>
  );
};

export default ProductForm;

