import React, { useState, useEffect } from "react";
import "../../assets/css/checkout.css";
import axios from "axios";

import momo from "../../assets/icon/Payment By Momo.png";
import vvnpay from "../../assets/icon/Payment By ATM.png";

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

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  // -------------------- Lấy giỏ hàng --------------------
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
          return sum + item.product_id!.price * item.quantity;
        }, 0);

        setSubtotal(total);
      })
      .catch((err) => console.error("API Error:", err));
  }, []);

  // -------------------- Load tỉnh --------------------
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

  // -------------------- Xử lý ảnh --------------------
  const getImageUrl = (img?: string) => {
    if (!img) return "/no-image.png";
    if (img.startsWith("http")) return img;
    return `http://localhost:3000/${img}`;
  };

  // -------------------- Tạo đơn hàng --------------------
  const handlePayment = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("Bạn chưa đăng nhập!");
      return;
    }

    if (!customerName || !customerPhone || !address || !selectedWard) {
      alert("Vui lòng nhập đầy đủ thông tin giao hàng!");
      return;
    }

    if (cart.length === 0) {
      alert("Giỏ hàng trống!");
      return;
    }

    const orderData = {
      customer_name: customerName,
      customer_phone: customerPhone,
      shipping_address: address,
      shipping_ward: selectedWard,
      shipping_district: selectedDistrict,
      shipping_province: selectedProvince,
      note: note,
      payment_method: payment,
      items: cart.map((item) => ({
        product_id: item.product_id!._id,
        name: item.product_id!.name,
        price: item.product_id!.price,
        quantity: item.quantity,
        image: item.product_id!.images[0],
      })),
      subtotal,
      shipping_fee: 0,
      discount: 0,
      total_price: subtotal,
    };

    try {
      if (payment === "MOMO") {
        const res = await axios.post(
          "http://localhost:3000/api/payments/momo",
          { amount: subtotal },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.payUrl) {
          window.location.href = res.data.payUrl;
        }
        return;
      }

      const res = await axios.post(
        "http://localhost:3000/api/Order/",
        orderData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Đặt hàng thành công!");
      console.log("ORDER CREATED:", res.data);
    } catch (err: any) {
      console.error(err);
      alert("Đặt hàng thất bại!");
    }
  };

  return (
    <div className="checkout-container">
      {/* LEFT */}
      <div className="checkout-left">
        <h3>Thông tin đơn hàng</h3>
        <div className="form-group">
          <input
            type="text"
            placeholder="Họ và tên"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Số điện thoại"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
          <input
            type="text"
            placeholder="Địa chỉ (Số nhà, đường)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
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
            <option value="">Chọn Quận/Huyện</option>
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
            <option value="">Chọn Phường/Xã</option>
            {wards.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Yêu cầu giao hàng"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          ></textarea>
        </div>

        {/* HÌNH THỨC THANH TOÁN */}
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
            <img src={vvnpay} alt="" />
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
          cart.map((item) => (
            <div className="cart-item" key={item._id}>
              <img
                src={getImageUrl(item.product_id!.images?.[0])}
                alt={item.product_id!.name}
              />
              <div className="item-info">
                <p>{item.product_id!.name}</p>
                <p className="price">
                  {(item.product_id!.price * item.quantity).toLocaleString()}₫
                </p>
              </div>
            </div>
          ))
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

        <button className="btn-pay" onClick={handlePayment}>
          Thanh toán
        </button>
      </div>
    </div>
  );
};

export default Checkout;
