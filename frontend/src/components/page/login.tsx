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
        
        // Dispatch custom event để Header cập nhật
        window.dispatchEvent(new Event('userLogin'));
      }

      // Kiểm tra nếu là admin@icondenim.com thì chuyển đến trang admin
      const userEmail = res.data.user?.email?.toLowerCase();
      const userRole = res.data.user?.role;
      const isAdmin = userEmail === "admin@icondenim.com" && userRole === "admin";
      
      // Debug logging
      console.log("🔍 Login Check:", {
        email: userEmail,
        role: userRole,
        isAdmin,
        expectedEmail: "admin@icondenim.com"
      });
      
      if (isAdmin) {
        alert("Đăng nhập thành công! Chào mừng đến trang quản trị.");
        navigate("/admin"); // Chuyển đến trang admin
      } else {
        alert("Đăng nhập thành công!");
        // Check if there's a redirect path from protected route
        const from = (location.state as any)?.from?.pathname || "/";
        navigate(from); // chuyển về trang trước đó hoặc Home
      }
    } catch (err: any) {
      console.error("Login error:", err.response || err);
      
      let errorMessage = "Đăng nhập thất bại!";
      
      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message || "Có lỗi xảy ra";
        const hint = err.response.data?.hint || "";
        
        if (status === 404) {
          errorMessage = `${message}\n\n💡 ${hint || "Tài khoản chưa tồn tại. Vui lòng đăng ký hoặc kiểm tra lại email."}`;
        } else if (status === 401) {
          errorMessage = `${message}\n\n💡 ${hint || "Mật khẩu không đúng. Vui lòng thử lại."}`;
        } else if (status === 403) {
          errorMessage = message;
        } else if (status === 500) {
          errorMessage = "Lỗi server. Vui lòng thử lại sau.";
        } else {
          errorMessage = message;
        }
      } else if (err.request) {
        errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra:\n- Backend có đang chạy không?\n- URL API có đúng không?";
      } else {
        errorMessage = "Có lỗi xảy ra: " + err.message;
      }
      
      alert(errorMessage);
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
      
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setRegPassword("");
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
