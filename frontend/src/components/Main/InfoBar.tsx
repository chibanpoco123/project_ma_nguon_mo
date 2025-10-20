// src/components/InfoBar.tsx

import { Container, Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faExchangeAlt, faHandHoldingUsd, faPhoneAlt } from '@fortawesome/free-solid-svg-icons';

// Dữ liệu và ảnh từ component voucher cũ
const vouchers = [
  { value: '20.000', condition: 'đơn từ 299K', code: 'OCT20' },
  { value: '40.000', condition: 'đơn từ 599K', code: 'OCT40' },
  { value: '70.000', condition: 'đơn từ 899K', code: 'OCT70' },
];
import totebagBanner from '../../assets/totebag-banner.jpg'; 

function InfoBar() {

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      alert(`Đã sao chép mã: ${code}`);
    });
  };

  return (
    // Bọc cả 2 phần trong một thẻ <section> chung
    <section className="py-5 border-bottom">
      <Container>
        {/* --- PHẦN INFO BAR GỐC --- */}
        <Row className="text-center mb-4 d-none d-md-flex">
          <Col md={3}>
            <FontAwesomeIcon icon={faTruck} className="me-2" /> Miễn phí vận chuyển
          </Col>
          <Col md={3}>
            <FontAwesomeIcon icon={faExchangeAlt} className="me-2" /> Đổi hàng tận nhà
          </Col>
          <Col md={3}>
            <FontAwesomeIcon icon={faHandHoldingUsd} className="me-2" /> Thanh toán COD
          </Col>
          <Col md={3}>
            <FontAwesomeIcon icon={faPhoneAlt} className="me-2" /> Hotline: 028.73066.060
          </Col>
        </Row>

        {/* --- PHẦN VOUCHER  --- */}
        <Row className="g-3">
          <Col lg={3} md={12}>
            <img src={totebagBanner} alt="Tặng Totebag Retro Sports" className="img-fluid rounded h-100 object-fit-cover"/>
          </Col>
          {vouchers.map((voucher, index) => (
            <Col lg={3} md={4} key={index}>
              <div className="voucher-card">
                <div className="voucher-details">
                    
                  <div className="d-flex justify-content-between">
                    
                    <span className="fw-bold">VOUCHER</span>
                    <span className="text-muted small">{voucher.condition}</span>
                  </div>
                 <div className="voucher-value">
                    <span className="value-amount">{voucher.value}</span>
                    <span className="voucher-currency">VND</span>
                    </div>
                  <div className="text-muted small">Nhập mã: {voucher.code}</div>
                </div>
                {/* <div className="voucher-separator"></div> */}
                <Button 
                  variant="dark" 
                  className="copy-button"
                  onClick={() => handleCopy(voucher.code)}
                >
                  Sao chép
                </Button>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}
export default InfoBar;