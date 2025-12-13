import express from "express";
import {
  createReview,
  getReviewsByProduct,
  deleteReview,
  getReviewStatistics,
  toggleLikeReview,
  checkCanReview,
  getPurchasedProductsForReview,
  getAllReviewsAdmin,
  toggleReviewVisibility,
  adminDeleteReview,
  getReviewStatisticsAdmin,
} from "../controller/reviewcontroller.js";
import { verifyToken, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// ⚠️ QUAN TRỌNG: Route /purchased/for-review phải đứng TRƯỚC route /:productId 
// để tránh conflict với route động

// Lấy danh sách sản phẩm đã mua và chưa đánh giá (yêu cầu đăng nhập)
router.get("/purchased/for-review", verifyToken, (req, res, next) => {
  console.log('🔍 [Route] /purchased/for-review hit');
  next();
}, getPurchasedProductsForReview);

// Kiểm tra user có thể đánh giá không (yêu cầu đăng nhập)
router.get("/:productId/can-review", verifyToken, checkCanReview);

// Tạo đánh giá mới (yêu cầu đăng nhập)
router.post("/", verifyToken, createReview);

// Lấy thống kê đánh giá (điểm TB, số lượng theo sao)
router.get("/:productId/statistics", getReviewStatistics);

// Lấy danh sách đánh giá với lọc (public)
router.get("/:productId", getReviewsByProduct);

// Like/Unlike đánh giá (yêu cầu đăng nhập)
router.post("/:reviewId/like", verifyToken, toggleLikeReview);

// Xóa đánh giá (yêu cầu đăng nhập)
router.delete("/:id", verifyToken, deleteReview);

// ==================== ADMIN ROUTES ====================
// Admin: Lấy tất cả đánh giá với lọc và phân trang
router.get("/admin/all", verifyToken, isAdmin, getAllReviewsAdmin);

// Admin: Thống kê đánh giá
router.get("/admin/statistics", verifyToken, isAdmin, getReviewStatisticsAdmin);

// Admin: Ẩn/Hiện đánh giá
router.put("/admin/:id/visibility", verifyToken, isAdmin, toggleReviewVisibility);

// Admin: Xóa đánh giá
router.delete("/admin/:id", verifyToken, isAdmin, adminDeleteReview);

export default router;
