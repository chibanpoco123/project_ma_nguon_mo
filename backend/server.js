import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import productRoutes from "./src/routes/product.js"; 
import userRoutes from "./src/routes/user.js";       
import categoriesRoutes from "./src/routes/categories.js";
import cartRoutes from "./src/routes/cartRoutes.js"; // 👈 import route giỏ hàng
import OrderRoutes from "./src/routes/OrderRoutes.js"
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 👉 Middleware để đọc JSON
app.use(express.json());

// 👉 Kết nối MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Kết nối MongoDB Atlas thành công!"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// 👉 Route kiểm tra server
app.get("/", (req, res) => {
  res.send("🚀 Server & MongoDB Atlas đang hoạt động!");
});

// 👉 Routes API
app.use("/api/products", productRoutes); // số nhiều (thông thường)
app.use("/api/users", userRoutes);       // để trùng với postman
app.use("/api/categories", categoriesRoutes);
app.use("/api/cart", cartRoutes); // 👈 đăng ký prefix
app.use("/api/Order", OrderRoutes); // 👈 đăng ký prefix
// 👉 Chạy server
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
});
