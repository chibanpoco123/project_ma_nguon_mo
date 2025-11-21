import mongoose from "mongoose";

import express from "express";

import Product from "../models/product.js";
import { verifyToken, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get("/search/query", async (req, res) => {
  try {
    const { q } = req.query;
    console.log("🔍 Search query received:", q);
    
    if (!q) {
      console.log("⚠️  Empty query, returning []");
      return res.json([]);
    }

    const searchRegex = new RegExp(q, "i");
    console.log("📊 Search regex:", searchRegex);
    
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex }
      ]
    }).populate("category_id");

    console.log("✅ Found products:", products.length);
    res.json(products);
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).json({ error: err.message });
  }
});

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

// Seed sample products (for testing)
router.post("/seed/data", async (req, res) => {
  try {
    // Xóa tất cả sản phẩm cũ
    await Product.deleteMany({});

    // Tạo sample products
    const sampleProducts = [
      {
        name: "Áo Denim Classic",
        description: "Áo denim cổ điển màu xanh, chất liệu bền bỉ",
        price: 599000,
        discount: 50,
        quantity: 100,
        images: ["https://via.placeholder.com/300x400?text=Ao+Denim+1"]
      },
      {
        name: "Quần Jeans Blue",
        description: "Quần jeans xanh dương, phong cách casual",
        price: 799000,
        discount: 50,
        quantity: 80,
        images: ["https://via.placeholder.com/300x400?text=Quan+Jeans+1"]
      },
      {
        name: "Áo Khoác Denim",
        description: "Áo khoác denim, thích hợp cho mùa thu đông",
        price: 899000,
        discount: 50,
        quantity: 60,
        images: ["https://via.placeholder.com/300x400?text=Ao+Khoac+1"]
      },
      {
        name: "Quần Chinos",
        description: "Quần chinos thoải mái, màu beige",
        price: 699000,
        discount: 50,
        quantity: 90,
        images: ["https://via.placeholder.com/300x400?text=Quan+Chinos+1"]
      },
      {
        name: "Áo Polo Premium",
        description: "Áo polo cao cấp, vải cotton 100%",
        price: 499000,
        discount: 50,
        quantity: 120,
        images: ["https://via.placeholder.com/300x400?text=Ao+Polo+1"]
      },
      {
        name: "Quần Short",
        description: "Quần short thể thao, thoáng khí",
        price: 399000,
        discount: 50,
        quantity: 150,
        images: ["https://via.placeholder.com/300x400?text=Quan+Short+1"]
      },
      {
        name: "Áo Sơ Mi Denim",
        description: "Áo sơ mi denim, kiểu dáng hiện đại",
        price: 549000,
        discount: 50,
        quantity: 70,
        images: ["https://via.placeholder.com/300x400?text=Ao+Somi+1"]
      },
      {
        name: "Quần Jean Slim Fit",
        description: "Quần jeans slim fit, ôm vừa vặn",
        price: 750000,
        discount: 50,
        quantity: 95,
        images: ["https://via.placeholder.com/300x400?text=Quan+Slim+1"]
      },
      {
        name: "Áo Khoác Denim Premium",
        description: "Áo khoác denim premium, chất liệu nhập khẩu",
        price: 950000,
        discount: 50,
        quantity: 50,
        images: ["https://via.placeholder.com/300x400?text=Ao+Khoac+Premium+1"]
      },
      {
        name: "Quần Baggy Denim",
        description: "Quần baggy denim, phong cách streetwear",
        price: 650000,
        discount: 50,
        quantity: 85,
        images: ["https://via.placeholder.com/300x400?text=Quan+Baggy+1"]
      }
    ];

    const createdProducts = await Product.insertMany(sampleProducts);
    res.json({
      message: "✅ Thêm sample products thành công!",
      count: createdProducts.length,
      products: createdProducts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router