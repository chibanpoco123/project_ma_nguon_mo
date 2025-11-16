import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 🔹 Tạo access + refresh token
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, "secretkey", { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: userId }, "refreshsecret", { expiresIn: "7d" });
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

    jwt.verify(token, "refreshsecret", (err, decoded) => {
      if (err) return res.status(403).json({ message: "Refresh token không hợp lệ" });

      const accessToken = jwt.sign({ id: decoded.id }, "secretkey", { expiresIn: "15m" });
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
