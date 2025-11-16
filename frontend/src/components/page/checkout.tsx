import React, { useState, useEffect } from "react";
import "../../assets/css/checkout.css";
import axios from "axios";
import momo from "../../assets/icon/Payment By Momo.png"
import vvnpay from "../../assets/icon/Payment By ATM.png"
interface CartItem {
  _id: string;
  quantity: number;
  product_id: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  } | null;
}

interface Province {
  code: number;
  name: string;
}
interface District {
  code: number;
  name: string;
}
interface Ward {
  code: number;
  name: string;
}

const Checkout: React.FC = () => {
  const [payment, setPayment] = useState("COD");
  const [voucher, setVoucher] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);

  // --------- Tỉnh/Quận/Xã ----------
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  // --------- Lấy giỏ hàng ----------
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    axios
      .get("http://localhost:3000/api/cart/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const validItems = res.data.filter(
          (item: CartItem) => item.product_id !== null
        );
        setCart(validItems);

        const total = validItems.reduce((sum: number, item: CartItem) => {
          const price = item.product_id?.price ?? 0;
          return sum + price * item.quantity;
        }, 0);
        setSubtotal(total);
      })
      .catch((err) => console.error("API Error:", err));
  }, []);

  // --------- Lấy tỉnh VN ----------
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error(err));
  }, []);

  const handleProvinceChange = (code: string) => {
    setSelectedProvince(code);
    setSelectedDistrict("");
    setSelectedWard("");
    setDistricts([]);
    setWards([]);

    fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`)
      .then((res) => res.json())
      .then((data) => setDistricts(data.districts))
      .catch((err) => console.error(err));
  };

  const handleDistrictChange = (code: string) => {
    setSelectedDistrict(code);
    setSelectedWard("");
    setWards([]);

    fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`)
      .then((res) => res.json())
      .then((data) => setWards(data.wards))
      .catch((err) => console.error(err));
  };

  // --------- Xử lý ảnh ----------
  const getImageUrl = (img: string | undefined) => {
    if (!img) return "/no-image.png";
    if (img.startsWith("data:image")) return img;
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    return `http://localhost:3000/${img}`;
  };

  return (
    <div className="checkout-container">
      {/* LEFT */}
      <div className="checkout-left">
        <h3>Thông tin đơn hàng</h3>
        <div className="form-group">
          <input type="text" placeholder="Họ và tên" />
          <input type="text" placeholder="Số điện thoại" />
          <input type="text" placeholder="Địa chỉ" />

          {/* Tỉnh/Quận/Xã */}
          <select
            value={selectedProvince}
            onChange={(e) => handleProvinceChange(e.target.value)}
          >
            <option value="">Chọn tỉnh/thành phố</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
          >
            <option value="">Chọn Quận/huyện</option>
            {districts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
          >
            <option value="">Chọn Phường/xã</option>
            {wards.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name}
              </option>
            ))}
          </select>

          <textarea placeholder="Yêu cầu giao hàng"></textarea>
        </div>

        <h3>Hình thức thanh toán</h3>
        <div className="payment-box">
          <label className="pay-option">
            <input
              type="radio"
              name="payment"
              checked={payment === "COD"}
              onChange={() => setPayment("COD")}
            />
            <span>COD – Thanh toán khi nhận hàng</span>
          </label>

          <label className="pay-option">
            <input
              type="radio"
              name="payment"
              checked={payment === "VNPAY"}
              onChange={() => setPayment("VNPAY")}
            />
            <img src= {vvnpay   } alt="" />
            <span>Thanh toán VNPay</span>
          </label>

          <label className="pay-option">
            <input
              type="radio"
              name="payment"
              checked={payment === "MOMO"}
              onChange={() => setPayment("MOMO")}
            />
            <img src={momo} alt="" />
            <span>Thanh toán MoMo</span>
          </label>
        </div>
      </div>

      {/* RIGHT */}
      <div className="checkout-right">
        <h3>Giỏ hàng</h3>
        {cart.length === 0 ? (
          <p>Giỏ hàng trống...</p>
        ) : (
          cart.map((item) => {
            const product = item.product_id!;
            const imgUrl = getImageUrl(product.images?.[0]);
            return (
              <div className="cart-item" key={item._id}>
                <img src={imgUrl} alt={product.name} />
                <div className="item-info">
                  <p>{product.name}</p>
                  <p className="price">
                    {(product.price * item.quantity).toLocaleString()}₫
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* VOUCHER */}
        <div className="voucher-box">
          <input
            type="text"
            placeholder="Nhập mã giảm giá"
            value={voucher}
            onChange={(e) => setVoucher(e.target.value)}
          />
          <button className="apply-btn">Áp dụng</button>
        </div>

        {/* SUMMARY */}
        <div className="summary">
          <div>
            <span>Tạm tính</span>
            <span>{subtotal.toLocaleString()}₫</span>
          </div>
          <div>
            <span>Phí vận chuyển</span>
            <span>Miễn phí</span>
          </div>
          <div>
            <span>Voucher giảm</span>
            <span>0₫</span>
          </div>

          <div className="total">
            <span>Tổng cộng</span>
            <span>{subtotal.toLocaleString()}₫</span>
          </div>
        </div>

        <button className="btn-pay">Thanh toán</button>
      </div>
    </div>
  );
};

export default Checkout;
