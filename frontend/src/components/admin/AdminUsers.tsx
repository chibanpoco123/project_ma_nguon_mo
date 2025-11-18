import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Table, Button, Form, Modal, Alert, Badge } from 'react-bootstrap';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'staff';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const API_URL = 'http://localhost:3000/api/users';

  // Get auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL, getAuthHeaders());
      setUsers(response.data);
      setError('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError('Không thể tải danh sách người dùng: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle edit user
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  // Handle delete user
  const handleDelete = (id: string) => {
    setDeleteUserId(id);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteUserId) return;

    try {
      await axios.delete(`${API_URL}/${deleteUserId}`, getAuthHeaders());
      setSuccess('Xóa người dùng thành công!');
      fetchUsers();
      setShowDeleteModal(false);
      setDeleteUserId(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError('Không thể xóa người dùng: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setError(''), 3000);
    }
  };

  // Handle update user
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const updateData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone') || '',
      role: formData.get('role'),
      is_active: formData.get('is_active') === 'on'
    };

    try {
      await axios.put(`${API_URL}/${selectedUser._id}`, updateData, getAuthHeaders());
      setSuccess('Cập nhật người dùng thành công!');
      fetchUsers();
      setShowEditModal(false);
      setSelectedUser(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError('Không thể cập nhật người dùng: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setError(''), 3000);
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const badges: { [key: string]: { bg: string; text: string } } = {
      admin: { bg: 'danger', text: 'Quản trị viên' },
      staff: { bg: 'warning', text: 'Nhân viên' },
      customer: { bg: 'info', text: 'Khách hàng' }
    };
    const badge = badges[role] || { bg: 'secondary', text: role };
    return <Badge bg={badge.bg}>{badge.text}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="admin-users">
      <Container fluid>
        {/* Breadcrumbs */}
        <nav className="admin-breadcrumbs">
          <span>Trang chủ</span> / <span>Cấu Hình</span> / <span>Quản lý Người dùng</span>
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
            <Form.Control
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="sm"
              style={{ width: '300px' }}
            />
            <Form.Select
              size="sm"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={{ width: '150px' }}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="staff">Nhân viên</option>
              <option value="customer">Khách hàng</option>
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
        </div>

        {/* Users Table */}
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
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th style={{ width: '120px' }}>Vai trò</th>
                  <th style={{ width: '100px' }}>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th style={{ width: '120px' }}>Tác vụ</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      Không có người dùng nào
                    </td>
                  </tr>
                ) : (
                  filteredUsers.slice(0, itemsPerPage).map((user, index) => (
                    <tr key={user._id}>
                      <td>{index + 1}</td>
                      <td><strong>{user.name}</strong></td>
                      <td>{user.email}</td>
                      <td>{user.phone || 'N/A'}</td>
                      <td>{getRoleBadge(user.role)}</td>
                      <td>
                        {user.is_active ? (
                          <Badge bg="success">Hoạt động</Badge>
                        ) : (
                          <Badge bg="secondary">Không hoạt động</Badge>
                        )}
                      </td>
                      <td className="small">{formatDate(user.created_at)}</td>
                      <td>
                        <div className="admin-action-buttons">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            title="Sửa"
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(user._id)}
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
            {filteredUsers.length > itemsPerPage && (
              <div className="text-center mt-3">
                <p className="text-muted">
                  Hiển thị {itemsPerPage} / {filteredUsers.length} người dùng
                </p>
              </div>
            )}
          </div>
        )}

        {/* Edit Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Sửa thông tin người dùng</Modal.Title>
          </Modal.Header>
          <form onSubmit={handleUpdate}>
            <Modal.Body>
              {selectedUser && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Tên *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      defaultValue={selectedUser.name}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      defaultValue={selectedUser.email}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Số điện thoại</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      defaultValue={selectedUser.phone || ''}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Vai trò *</Form.Label>
                    <Form.Select name="role" defaultValue={selectedUser.role} required>
                      <option value="customer">Khách hàng</option>
                      <option value="staff">Nhân viên</option>
                      <option value="admin">Quản trị viên</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      name="is_active"
                      label="Hoạt động"
                      defaultChecked={selectedUser.is_active}
                    />
                  </Form.Group>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                Lưu thay đổi
              </Button>
            </Modal.Footer>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Xác nhận xóa</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Bạn có chắc chắn muốn xóa người dùng này không?</p>
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

export default AdminUsers;

