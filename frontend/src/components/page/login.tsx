import React, { useState } from "react";
import "../../assets/css/login.css";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

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
  const location = useLocation();

  // Xử lý login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/api/users/login", {
        email: emailOrPhone,
        password: password,
      });

      console.log("Login success:", res.data);

      if (res.data.accessToken) {
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      alert("Đăng nhập thành công!");
      
      // Check if there's a redirect path from protected route
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from); // chuyển về trang trước đó hoặc Home
    } catch (err: any) {
      console.error(err.response || err);
      alert("Đăng nhập thất bại! Vui lòng kiểm tra email/mật khẩu.");
    }
  };

  // Xử lý register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/api/users/register", {
        name,
        phone,
        email,
        password: regPassword,
      });

      console.log("Register success:", res.data);
      
      // Chỉ email admin@icondenim.com mới được cấp quyền admin
      const isAdminEmail = email.toLowerCase() === "admin@icondenim.com";
      
      if (isAdminEmail && res.data.user?.role === "admin") {
        // Tự động đăng nhập nếu đăng ký với admin@icondenim.com
        const loginRes = await axios.post("http://localhost:3000/api/users/login", {
          email: email,
          password: regPassword,
        });

        if (loginRes.data.accessToken) {
          localStorage.setItem("accessToken", loginRes.data.accessToken);
          localStorage.setItem("refreshToken", loginRes.data.refreshToken);
          localStorage.setItem("user", JSON.stringify(loginRes.data.user));
        }

        alert("Đăng ký thành công! Bạn đã được cấp quyền quản trị viên. Đang chuyển đến trang quản trị...");
        
        // Check if there's a redirect path from protected route
        const from = (location.state as any)?.from?.pathname || "/admin";
        navigate(from);
      } else {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        setIsLoginTab(true); // chuyển sang tab login
      }
    } catch (err: any) {
      console.error(err.response || err);
      const errorMessage = err.response?.data?.message || "Đăng ký thất bại! Vui lòng thử lại.";
      alert(errorMessage);
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
                padding: "0.5rem",
                backgroundColor: "#e3f2fd",
                borderRadius: "4px",
                fontSize: "0.85rem",
                color: "#1976d2",
                marginBottom: "0.5rem"
              }}>
                ℹ️ Email này sẽ được cấp quyền quản trị viên
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
