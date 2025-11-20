import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors"; // ✅ Thêm dòng này
import productRoutes from "./src/routes/product.js"; 
import userRoutes from "./src/routes/user.js";       
import categoriesRoutes from "./src/routes/categories.js";
import cartRoutes from "./src/routes/cartRoutes.js"; // 👈 import route giỏ hàng
import OrderRoutes from "./src/routes/OrderRoutes.js"
import reviewRoutes from "./src/routes/review.js";
import couponRoutes from "./src/routes/cupponroutes.js"
import PaymentRoutes from "./src/routes/payments.js";
import ShippingRoutes from "./src/routes/shiping.js";
import Wishlist from "./src/routes/wishlist.js";

import socialAuthRoutes from "./src/routes/socialauth.js";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));
console.log("MONGO_URI =", process.env.MONGO_URI);

app.use(express.json());
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Kết nối MongoDB Atlas thành công!"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));
app.get("/", (req, res) => {
  res.send("🚀 Server & MongoDB Atlas đang hoạt động!");
});
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);     
app.use("/api/categories", categoriesRoutes);
app.use("/api/cart", cartRoutes); 
app.use("/api/Order", OrderRoutes); 
app.use ("/api/reviews",reviewRoutes)
app.use("/api/coupons", couponRoutes);

app.use("api/payments",PaymentRoutes)
app.use("api/Shipping",ShippingRoutes)
app.use("api/whishlist",Wishlist)

app.use("/api/auth/social", socialAuthRoutes);
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
});
