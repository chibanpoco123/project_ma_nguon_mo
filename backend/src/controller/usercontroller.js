import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Đăng ký
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
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, "secretkey", { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: userId }, "refreshsecret", { expiresIn: "7d" });
  return { accessToken, refreshToken };
};
// Đăng nhập
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "mật khẩu hoặc tài khoản sai  " });

    const token = jwt.sign({ id: user._id }, "secretkey", { expiresIn: "1d" });
    res.json({ message: "Đăng nhập thành công", token });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Lấy danh sách người dùng
export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

// Lấy user theo ID
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "Không tìm thấy" });
  res.json(user);
};

// Cập nhật user
export const updateUser = async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ message: "Cập nhật thành công", user: updated });
};

// Xóa user
export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Đã xóa người dùng" });
};
