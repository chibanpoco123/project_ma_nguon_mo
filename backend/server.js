import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Kết nối MongoDB Atlas thành công!"))
  .catch((err) => console.error("❌ Lỗi kết nối:", err));

app.get("/", (req, res) => {
  res.send("MongoDB Atlas đã kết nối thành công!");
});

app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));
