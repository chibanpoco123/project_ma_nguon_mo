import mongoose from "mongoose";

import express from "express";

import Product from "../models/product.js";
import { verifyToken, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Lấy danh sách sản phẩm
router.get("/", async (req, res) => {
  try {
    let query = {};

    // Nếu có truyền ?category_id=xxx
    if (req.query.category_id) {
      query.category_id = new mongoose.Types.ObjectId(req.query.category_id);
    }
    const products = await Product.find(query).populate("category_id");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Thêm sản phẩm (chỉ admin)
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Xóa sản phẩm (chỉ admin)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    res.json({ message: "Xóa sản phẩm thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sửa sản phẩm (chỉ admin)
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
export default router