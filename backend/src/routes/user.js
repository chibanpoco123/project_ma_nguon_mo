import express from "express";
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  refreshToken,
  createUser
} from "../controller/usercontroller.js";
import { verifyToken, isAdmin } from "../middlewares/auth.js";

const router = express.Router();
router.post("/register", registerUser);

router.post("/login", loginUser);

// 🆕 👉 ADMIN tạo người dùng ()
router.post("/create", verifyToken, isAdmin, createUser);

// 👉 Danh sách user (chỉ admin)
router.get("/", verifyToken, isAdmin, getAllUsers);

// 👉 Lấy thông tin chi tiết user
router.get("/:id", verifyToken, getUserById);

// 👉 Cập nhật thông tin (user hoặc admin)
router.put("/:id", verifyToken, updateUser);

// 👉 Xóa người dùng
router.delete("/:id", verifyToken, deleteUser);

export default router;
