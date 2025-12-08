import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 🔹 Tạo access + refresh token
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET || "secretkey", { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || "refreshsecret", { expiresIn: "7d" });
  return { accessToken, refreshToken };
};
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email đã tồn tại" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "customer",
    });

    await newUser.save();
    res.status(201).json({ message: "Tạo người dùng thành công", user: newUser });
  } catch (error) {
    console.error("Lỗi tạo người dùng:", error);
    res.status(500).json({ message: "Lỗi server khi tạo người dùng" });
  }
};
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Không cho phép đăng ký với email admin@icondenim.com
    if (email && email.toLowerCase() === "admin@icondenim.com") {
      return res.status(403).json({ 
        message: "Email này dành riêng cho quản trị viên. Vui lòng sử dụng email khác hoặc liên hệ quản trị viên để được cấp quyền." 
      });
    }
    
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email đã tồn tại" });

    const hashed = await bcrypt.hash(password, 10);
    
    // Tất cả người dùng đăng ký đều có role customer
    const role = "customer";

    const user = new User({ 
      name, 
      email, 
      password: hashed,
      phone: phone || "",
      role 
    });
    await user.save();
    res.status(201).json({ 
      message: "Đăng ký thành công", 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email và mật khẩu là bắt buộc" });
    }

    // Normalize email (lowercase và trim)
    const normalizedEmail = email.toLowerCase().trim();
    
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ 
        message: "Không tìm thấy người dùng với email này",
        hint: "Vui lòng kiểm tra lại email hoặc đăng ký tài khoản mới"
      });
    }

    // Kiểm tra tài khoản có bị khóa không
    if (user.is_active === false) {
      return res.status(403).json({ message: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: "Mật khẩu không đúng",
        hint: "Vui lòng kiểm tra lại mật khẩu. Nếu quên mật khẩu, vui lòng liên hệ quản trị viên."
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Cập nhật last_login_at
    user.last_login_at = new Date();
    await user.save();

    res.json({
      message: "Đăng nhập thành công",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, 
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
export const refreshToken = (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: "Không có refresh token" });

    jwt.verify(token, process.env.JWT_REFRESH_SECRET || "refreshsecret", (err, decoded) => {
      if (err) return res.status(403).json({ message: "Refresh token không hợp lệ" });

      const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET || "secretkey", { expiresIn: "15m" });
      res.json({ accessToken });
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
  res.json(user);
};

export const updateUser = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Bạn không có quyền sửa người khác" });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.status(200).json({
      message: "Cập nhật thông tin thành công",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Đã xóa người dùng" });
};

// 🔹 Quên mật khẩu - Tạo token reset
export const forgotPassword = async (req, res) => {
  try {
    console.log("🔵 Forgot password request received");
    console.log("📨 Request body:", req.body);
    
    const { email } = req.body;
    
    if (!email) {
      console.log("❌ Email không được cung cấp");
      return res.status(400).json({ message: "Email là bắt buộc" });
    }

    console.log("🔍 Tìm user với email:", email);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log("❌ Không tìm thấy user với email:", email);
      return res.status(404).json({ message: "Email không tồn tại trong hệ thống" });
    }

    console.log("✅ Tìm thấy user:", user._id);

    // 🔹 Tạo token reset (30 phút)
    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    // 🔹 Lưu reset token vào user (trong production dùng Redis hoặc database)
    user.resetToken = resetToken;
    user.resetTokenExpire = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    console.log("💾 Đã lưu reset token vào user");

    // 🔹 Tạo link reset password
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    // TODO: Gửi email với link reset
    console.log(`🔗 Reset link: ${resetLink}`);

    res.status(200).json({
      message: "✅ Vui lòng kiểm tra email để reset mật khẩu (hướng dẫn reset sẽ được gửi qua email)",
      // Trong production, không nên trả về token
      resetToken: resetToken, // 🔹 Chỉ để test
      resetLink: resetLink,   // 🔹 Chỉ để test
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// 🔹 Reset mật khẩu
export const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ message: "Thiếu thông tin" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu không khớp" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    // 🔹 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // 🔹 Kiểm tra token có khớp
    if (user.resetToken !== token) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    // 🔹 Kiểm tra token có hết hạn
    if (new Date() > user.resetTokenExpire) {
      return res.status(401).json({ message: "Token đã hết hạn, vui lòng yêu cầu reset lại" });
    }

    // 🔹 Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Cập nhật mật khẩu
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpire = null;
    await user.save();

    res.status(200).json({
      message: "✅ Mật khẩu đã được cập nhật thành công. Vui lòng đăng nhập lại.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token đã hết hạn" });
    }
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
