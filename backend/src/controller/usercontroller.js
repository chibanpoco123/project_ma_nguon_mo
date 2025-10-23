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

// 🔹 Đăng ký
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email đã tồn tại" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();
    res.status(201).json({ message: "Đăng ký thành công", user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// 🔹 Đăng nhập
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu hoặc tài khoản" });

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.json({
      message: "Đăng nhập thành công",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // 👈 thêm dòng này
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// 🔹 Refresh Token
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

// 🔹 Lấy danh sách người dùng
export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

// 🔹 Lấy user theo ID
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
  res.json(user);
};

// 🔹 Cập nhật user
export const updateUser = async (req, res) => {
  try {
    // Nếu không phải admin, chỉ cho phép sửa chính mình
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


// 🔹 Xóa user
export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Đã xóa người dùng" });
};
