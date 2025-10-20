import express from "express";
import Product from "../models/product.js";

const router = express.Router();

// Lấy danh sách sản phẩm
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("category_id");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Thêm sản phẩm
router.post("/", async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// lấy chi tiết sản phẩm theo id 
router.get("/:id",async(req,res) =>{
    try{
        const product = await Product.findById(req.params.id).populate("category_id");
        if (!product) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    res.json(product);
    }catch (err) {
    res.status(500).json({ error: err.message });
  }
})
// xóa sản phẩm theo id 
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    res.json({ message: "Xóa sản phẩm thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// sửa sản phâm theo id 
router.put("/:id", async (req, res) => {
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
export default router;
