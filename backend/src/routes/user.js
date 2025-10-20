import express from "express";
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  refreshToken
} from "../controller/usercontroller.js";
const router = express.Router(); // ✅ phải có dòng này

// 👉 Đăng ký người dùng mới
router.post("/register", registerUser);

// 👉 Đăng nhập
router.post("/login", loginUser);

// 👉 Lấy danh sách người dùng
router.get("/", getAllUsers);

// 👉 Lấy thông tin 1 người dùng theo ID
router.get("/:id", getUserById);

// 👉 Cập nhật thông tin người dùng
router.put("/:id", updateUser);

// 👉 Xóa người dùng
router.delete("/:id", deleteUser);\
router.post("/refresh", refreshToken);
export default router;