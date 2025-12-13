import express from "express";
import {
  createReview,
  getReviewsByProduct,
  deleteReview,
  getPurchasedProductsForReview,
  checkCanReview,
  getReviewStatistics,
  toggleLikeReview,
  getAllReviewsAdmin,
  getReviewStatisticsAdmin,
  toggleReviewVisibility,
  adminDeleteReview
} from "../controller/review.controller.js"; // ✅ controllers (số nhiều)

import { verifyToken, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// ⚠️ Route cụ thể phải đứng TRƯỚC route động

// Lấy danh sách sản phẩm đã mua và chưa đánh giá
router.get(
  "/purchased/for-review",
  verifyToken,
  (req, res, next) => {
    console.log("🔍 [Route] /purchased/for-review hit");
    next();
  },
  getPurchasedProductsForReview
);

// Kiểm tra user có thể đánh giá không
router.get("/:productId/can-review", verifyToken, checkCanReview);

// Tạo đánh giá
router.post("/", verifyToken, createReview);

// Thống kê đánh giá theo sản phẩm
router.get("/:productId/statistics", getReviewStatistics);

// Lấy danh sách đánh giá theo sản phẩm
router.get("/:productId", getReviewsByProduct);

// Like / Unlike đánh giá
router.post("/:reviewId/like", verifyToken, toggleLikeReview);

// Xóa đánh giá của user
router.delete("/:id", verifyToken, deleteReview);

// ================= ADMIN =================

// Admin: tất cả đánh giá
router.get("/admin/all", verifyToken, isAdmin, getAllReviewsAdmin);

// Admin: thống kê
router.get("/admin/statistics", verifyToken, isAdmin, getReviewStatisticsAdmin);

// Admin: ẩn / hiện đánh giá
router.put("/admin/:id/visibility", verifyToken, isAdmin, toggleReviewVisibility);

// Admin: xóa đánh giá
router.delete("/admin/:id", verifyToken, isAdmin, adminDeleteReview);

export default router;
