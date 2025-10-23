import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // "Bearer token"
    if (!token) return res.status(401).json({ message: "Không có token" });

    const decoded = jwt.verify(token, "secretkey");
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    next();
  } catch (err) {
    res.status(403).json({ message: "Token không hợp lệ", error: err.message });
  }
};

// Kiểm tra quyền admin
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Bạn không có quyền admin" });
  }
  next();
};
