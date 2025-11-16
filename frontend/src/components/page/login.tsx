import React, { useState, useEffect, useCallback } from "react";
import "../../assets/css/login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Login state
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");

  // Register state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const navigate = useNavigate();

  // Xử lý login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (!emailOrPhone || !password) {
      alert("Vui lòng nhập đầy đủ email và mật khẩu!");
      return;
    }
    
    try {
      // Normalize email (trim và lowercase)
      const normalizedEmail = emailOrPhone.trim().toLowerCase();
      
      const res = await axios.post("http://localhost:3000/api/users/login", {
        email: normalizedEmail,
        password: password,
      });

      console.log("Login success:", res.data);

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

  // Xử lý register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra trước khi gửi request - không cho phép đăng ký với admin@icondenim.com
    if (email.toLowerCase() === "admin@icondenim.com") {
      alert("Email admin@icondenim.com dành riêng cho quản trị viên. Vui lòng sử dụng email khác hoặc liên hệ quản trị viên.");
      return;
    }
    
    try {
      const res = await axios.post("http://localhost:3000/api/users/register", {
        name,
        phone,
        email,
        password: regPassword,
      });

      console.log("Register success:", res.data);
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      setIsLoginTab(true); // chuyển sang tab login
    } catch (err: any) {
      console.error(err.response || err);
      alert("Đăng ký thất bại! Vui lòng thử lại.");
    }
  };

return (
    <div className="login-container">
      
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

            {/* 🔹 Social Login */}
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <p>Hoặc đăng nhập bằng:</p>
              <div id="google-signin" style={{ marginBottom: "10px" }}></div>
              <button
                type="button"
                onClick={handleFacebookSignUp}
                className="btn-facebook"
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#1877F2",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                Đăng nhập bằng Facebook
              </button>
            </div>
          </form>
        ) : (
          <form className="form" onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Họ và tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {email.toLowerCase() === "admin@icondenim.com" && (
              <div style={{
                padding: "0.75rem",
                backgroundColor: "#fff3cd",
                border: "1px solid #ffc107",
                borderRadius: "4px",
                fontSize: "0.85rem",
                color: "#856404",
                marginBottom: "0.5rem"
              }}>
                ⚠️ Email này dành riêng cho quản trị viên. Không thể đăng ký với email này. Vui lòng sử dụng email khác.
              </div>
            )}
            <input
              type="password"
              placeholder="Mật khẩu"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              required
              minLength={6}
            />
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
