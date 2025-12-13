import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import {
  createReview,
  getReviewsByProduct,
  deleteReview,
} from "../controller/review.controller.js";
const router = express.Router();
router.post("/", verifyToken, createReview);
router.get("/:productId", getReviewsByProduct);
router.delete("/:id", verifyToken, deleteReview);
export default router;
