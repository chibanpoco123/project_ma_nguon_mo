import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import '../../css/product-form.css';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  quantity: number;
  category_id?: string;
  images: string[];
  is_new?: boolean;
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
    is_new: false,
  });
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (product) {
      let categoryId = '';
      if (product.category_id) {
        if (typeof product.category_id === 'string') {
          categoryId = product.category_id;
        } else if (typeof product.category_id === 'object' && '_id' in product.category_id) {
          categoryId = (product.category_id as { _id: string })._id;
        }
      }
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        discount: product.discount || 0,
        quantity: product.quantity || 0,
        category_id: categoryId,
        images: product.images || [],
        is_new: Boolean(product.is_new), // Đảm bảo boolean, không phải undefined
      });
      setImageUrls(product.images && product.images.length > 0 ? product.images : ['']);
      setImageFiles([]);
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
        is_new: false,
      });
      setImageUrls(['']);
      setImageFiles([]);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    const newValue = type === 'checkbox' 
      ? checked 
      : name === 'price' || name === 'discount' || name === 'quantity' 
      ? Number(value) 
      : value;
    
    const updatedFormData = {
      ...formData,
      [name]: newValue,
    };
    
    setFormData(updatedFormData);
    
    // Nếu là checkbox is_new và đang edit sản phẩm, lưu ngay lập tức
    if (type === 'checkbox' && name === 'is_new' && product) {
      // Sử dụng setTimeout để đảm bảo state đã được cập nhật
      setTimeout(() => {
        handleSaveIsNew(checked);
      }, 0);
    }
  };

  // Lưu trạng thái is_new ngay khi click checkbox (chỉ khi đang edit)
  const handleSaveIsNew = async (isNew: boolean) => {
    if (!product) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');
      
      if (!token) {
        setError('Vui lòng đăng nhập lại. Token không tồn tại.');
        // Revert checkbox
        setFormData((prev) => ({
          ...prev,
          is_new: !isNew,
        }));
        return;
      }
      
      // Kiểm tra quyền admin
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role !== 'admin') {
            setError('Bạn không có quyền admin. Vui lòng đăng nhập bằng tài khoản admin.');
            // Revert checkbox
            setFormData((prev) => ({
              ...prev,
              is_new: !isNew,
            }));
            return;
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
      
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      
      console.log('🔄 Đang cập nhật is_new:', { productId: product._id, isNew, token: token ? 'exists' : 'missing' });
      
      // Update chỉ field is_new để tránh conflict
      const response = await axios.put(
        `https://project-ma-nguon-mo-3.onrender.com/apiproducts/${product._id}`,
        { is_new: isNew },
        { headers }
      );
      
      console.log('✅ Cập nhật is_new thành công:', response.data);
      
      // Đảm bảo formData được cập nhật đúng từ response
      if (response.data) {
        setFormData((prev) => ({
          ...prev,
          is_new: Boolean(response.data.is_new),
        }));
      }
      
      // Clear error nếu thành công
      setError('');
      
      // Gọi onSuccess để refresh danh sách sản phẩm trong AdminProducts
      onSuccess();
    } catch (err: unknown) {
      console.error('❌ Lỗi khi cập nhật is_new:', err);
      
      let errorMessage = 'Có lỗi xảy ra khi cập nhật trạng thái hàng mới';
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const status = err.response.status;
          const data = err.response.data;
          
          if (status === 401) {
            errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          } else if (status === 403) {
            errorMessage = data?.message || data?.error || 'Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập bằng tài khoản admin.';
          } else if (status === 404) {
            errorMessage = 'Không tìm thấy sản phẩm.';
          } else if (status === 400) {
            errorMessage = data?.error || data?.message || 'Dữ liệu không hợp lệ.';
          } else {
            errorMessage = data?.error || data?.message || `Lỗi ${status}: Không thể cập nhật sản phẩm.`;
          }
        } else if (err.request) {
          errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        } else {
          errorMessage = err.message || 'Có lỗi xảy ra khi gửi yêu cầu.';
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Revert checkbox nếu lỗi
      setFormData((prev) => ({
        ...prev,
        is_new: !isNew,
      }));
    }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...files]);
    }
  };

  const removeImageFile = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const token = localStorage.getItem('accessToken');
    const response = await axios.post(
      'https://project-ma-nguon-mo-3.onrender.com/apiproducts/upload',
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.images.map((img: string) => `https://project-ma-nguon-mo-3.onrender.com/api${img}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setUploadingImages(true);

    try {
      // Upload files first if any
      let uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        uploadedImageUrls = await uploadImages(imageFiles);
      }

      // Filter out empty image URLs and combine with uploaded URLs
      const validImageUrls = imageUrls.filter((url) => url.trim() !== '');
      const allImages = [...validImageUrls, ...uploadedImageUrls];

      // Chuẩn bị dữ liệu submit
      const submitData: {
        name: string;
        description: string;
        price: number;
        discount: number;
        quantity: number;
        images: string[];
        is_new: boolean;
        category_id?: string;
      } = {
        name: formData.name,
        description: formData.description || '',
        price: Number(formData.price) || 0,
        discount: Number(formData.discount) || 0,
        quantity: Number(formData.quantity) || 0,
        images: allImages,
        is_new: Boolean(formData.is_new), // Đảm bảo is_new luôn là boolean
      };

      // Chỉ thêm category_id nếu có giá trị
      if (formData.category_id && formData.category_id.trim() !== '') {
        submitData.category_id = formData.category_id;
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Vui lòng đăng nhập lại');
        setLoading(false);
        setUploadingImages(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      if (product) {
        // Update existing product
        await axios.put(
          `https://project-ma-nguon-mo-3.onrender.com/apiproducts/${product._id}`,
          submitData,
          { headers }
        );
      } else {
        // Create new product
        await axios.post(
          'https://project-ma-nguon-mo-3.onrender.com/apiproducts',
          submitData,
          { headers }
        );
      }

      // Gọi onSuccess để refresh danh sách
      onSuccess();
    } catch (err: unknown) {
      console.error('Lỗi khi lưu sản phẩm:', err);
      let errorMessage = 'Có lỗi xảy ra khi lưu sản phẩm';
      
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setUploadingImages(false);
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
          aria-label="Chọn danh mục sản phẩm"
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
        <Form.Label>Hình ảnh</Form.Label>
        
        {/* Upload từ file */}
        <div className="mb-3">
          <Form.Label className="mb-2">Tải ảnh từ máy tính</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="mb-2"
          />
          {imageFiles.length > 0 && (
            <div className="d-flex flex-wrap gap-2 mb-2">
              {imageFiles.map((file, index) => (
                <div key={index} className="position-relative d-inline-block">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="product-image-preview"
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    className="position-absolute top-0 end-0"
                    style={{ transform: 'translate(50%, -50%)' }}
                    onClick={() => removeImageFile(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hoặc nhập URL */}
        <div>
          <Form.Label className="mb-2">Hoặc nhập URL hình ảnh</Form.Label>
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
            + Thêm URL
          </Button>
        </div>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          name="is_new"
          label="Đánh dấu là hàng mới"
          checked={Boolean(formData.is_new)}
          onChange={handleChange}
        />
      </Form.Group>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>
        <Button variant="primary" type="submit" disabled={loading || uploadingImages}>
          {uploadingImages ? 'Đang tải ảnh...' : loading ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>
    </Form>
  );
};

export default ProductForm;

