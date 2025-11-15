import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';

interface MongoDBInfo {
  status: string;
  state: string;
  isConnected: boolean;
  database: {
    name: string;
    host: string;
    port: string | number;
    collectionsCount: number;
    collections: string[];
  };
  connectionString: string;
  timestamp: string;
}

interface HealthCheck {
  healthy: boolean;
  status: string;
  message: string;
  timestamp?: string;
}

const AdminDatabase: React.FC = () => {
  const [dbInfo, setDbInfo] = useState<MongoDBInfo | null>(null);
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const API_URL = 'http://localhost:3000/api/admin';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchDatabaseInfo = React.useCallback(async () => {
    try {
      setError('');
      const [infoRes, healthRes] = await Promise.all([
        axios.get(`${API_URL}/mongodb/info`, getAuthHeaders()),
        axios.get(`${API_URL}/mongodb/health`, getAuthHeaders())
      ]);
      
      setDbInfo(infoRes.data);
      setHealth(healthRes.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error.response?.data?.message || error.message || 'Không thể lấy thông tin database');
      console.error('Error fetching database info:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDatabaseInfo();
  }, [fetchDatabaseInfo]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDatabaseInfo();
  };

  const getStatusBadge = (isConnected: boolean) => {
    return isConnected ? (
      <Badge bg="success">Đã kết nối</Badge>
    ) : (
      <Badge bg="danger">Chưa kết nối</Badge>
    );
  };

  const getHealthBadge = (healthy: boolean) => {
    return healthy ? (
      <Badge bg="success">Khỏe mạnh</Badge>
    ) : (
      <Badge bg="danger">Lỗi</Badge>
    );
  };

  if (loading) {
    return (
      <Container fluid>
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
          <p className="mt-3">Đang tải thông tin database...</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="admin-database">
      <Container fluid>
        {/* Breadcrumbs */}
        <nav className="admin-breadcrumbs">
          <span>Trang chủ</span> / <span>Cấu hình</span> / <span>Database</span>
        </nav>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Thông tin MongoDB</h2>
          <Button variant="primary" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang làm mới...
              </>
            ) : (
              '🔄 Làm mới'
            )}
          </Button>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {health && (
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Trạng thái Health Check</h5>
              {getHealthBadge(health.healthy)}
            </Card.Header>
            <Card.Body>
              <p><strong>Trạng thái:</strong> {health.status}</p>
              <p><strong>Thông báo:</strong> {health.message}</p>
              {health.timestamp && (
                <p className="text-muted small">
                  <strong>Kiểm tra lúc:</strong> {new Date(health.timestamp).toLocaleString('vi-VN')}
                </p>
              )}
            </Card.Body>
          </Card>
        )}

        {dbInfo && (
          <>
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Thông tin kết nối</h5>
                {getStatusBadge(dbInfo.isConnected)}
              </Card.Header>
              <Card.Body>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <p><strong>Trạng thái:</strong> {dbInfo.state}</p>
                    <p><strong>Database Name:</strong> {dbInfo.database.name}</p>
                    <p><strong>Host:</strong> {dbInfo.database.host}</p>
                    <p><strong>Port:</strong> {dbInfo.database.port}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <p><strong>Connection String:</strong></p>
                    <code className="database-connection-string">
                      {dbInfo.connectionString}
                    </code>
                    <p className="text-muted small mt-2">
                      <em>Lưu ý: Thông tin đăng nhập đã được ẩn vì lý do bảo mật</em>
                    </p>
                  </div>
                </div>
                {dbInfo.timestamp && (
                  <p className="text-muted small mb-0">
                    <strong>Cập nhật lúc:</strong> {new Date(dbInfo.timestamp).toLocaleString('vi-VN')}
                  </p>
                )}
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <h5 className="mb-0">Collections trong Database</h5>
              </Card.Header>
              <Card.Body>
                <p><strong>Tổng số collections:</strong> {dbInfo.database.collectionsCount}</p>
                {dbInfo.database.collections.length > 0 ? (
                  <div className="mt-3">
                    <h6>Danh sách collections:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {dbInfo.database.collections.map((collection, index) => (
                        <Badge key={index} bg="info" style={{ fontSize: '0.9rem', padding: '0.5rem' }}>
                          {collection}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted">Không có collections nào</p>
                )}
              </Card.Body>
            </Card>
          </>
        )}
      </Container>
    </div>
  );
};

export default AdminDatabase;

