import express from "express";
import { verifyToken, isAdmin } from "../middlewares/auth.js";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getAllOrders,
  cancelOrder,
  updateOrderInfo
} from "../controller/Ordercontroller.js";

const router = express.Router();

// USER
router.post("/", verifyToken, createOrder);
router.get("/", verifyToken, getUserOrders);

// ADMIN routes phải đặt trước "/:id"
router.get("/admin/all", verifyToken, isAdmin, getAllOrders);

// ORDER DETAILS
router.get("/:id", verifyToken, getOrderById);
router.put("/:id/update-info", verifyToken, updateOrderInfo);
router.put("/:id/cancel", verifyToken, cancelOrder);

// ADMIN actions on order
router.put("/:id", verifyToken, isAdmin, updateOrderStatus);
router.delete("/:id", verifyToken, isAdmin, deleteOrder);

export default router;
