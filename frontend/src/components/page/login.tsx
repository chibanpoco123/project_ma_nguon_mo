import React, { useState } from "react";
import "../../assets/css/login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Xử lý login
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault(); // tránh reload trang
  try {
    const res = await axios.post("http://localhost:3000/api/users/login", {
      email: emailOrPhone,
      password: password,
    });

    console.log("Login success:");

    // ✅ Lưu token & user vào localStorage
    if (res.data.accessToken) {
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }

    alert("Đăng nhập thành công!");
    navigate("/"); // chuyển về Home
  } catch (err: any) {
    console.error(err.response || err);
    alert("Đăng nhập thất bại! Vui lòng kiểm tra email/mật khẩu.");
  }
};

  return (
    <div className="login-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <a href="/">Trang chủ</a> / <a href="/categories">Danh mục</a> /{" "}
        <a href="/account">Tài khoản</a> / <span className="current">Đăng nhập</span>
      </div>

      <h2 className="login-title">ĐĂNG NHẬP TÀI KHOẢN</h2>

      <div className="login-box">
        {/* Tabs */}
        <div className="tabs">
          <button
            className={isLoginTab ? "active" : ""}
            onClick={() => setIsLoginTab(true)}
          >
            ĐĂNG NHẬP
          </button>
          <button
            className={!isLoginTab ? "active" : ""}
            onClick={() => setIsLoginTab(false)}
          >
            ĐĂNG KÝ
          </button>
        </div>

        {isLoginTab ? (
          <form className="form" onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Nhập số điện thoại hoặc email"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
            />
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "🙈"}
              </span>
            </div>
            <button type="submit" className="btn-login">
              ĐĂNG NHẬP
            </button>
            <a href="/forgot-password" className="forgot">
              Quên mật khẩu?
            </a>
          </form>
        ) : (
          <form className="form">
            <input type="text" placeholder="Họ và tên" />
            <input type="text" placeholder="Số điện thoại" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Mật khẩu" />
            <button type="submit" className="btn-login">
              ĐĂNG KÝ
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
