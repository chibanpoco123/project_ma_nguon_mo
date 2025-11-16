import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../src/models/user.js";

dotenv.config();

const ADMIN_EMAIL = "admin@icondenim.com";
const ADMIN_PASSWORD = "admin123"; // Mật khẩu mặc định - nên đổi sau khi đăng nhập
const ADMIN_NAME = "Administrator";

async function createAdmin() {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Đã kết nối MongoDB");

    // Kiểm tra xem admin đã tồn tại chưa (normalize email)
    const normalizedEmail = ADMIN_EMAIL.toLowerCase().trim();
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: normalizedEmail },
        { email: ADMIN_EMAIL }
      ]
    });
    
    if (existingAdmin) {
      console.log("⚠️  Tài khoản admin đã tồn tại!");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log("\n💡 Nếu muốn đặt lại mật khẩu, hãy xóa tài khoản này và chạy lại script.");
      console.log("   Hoặc cập nhật mật khẩu trong database.");
      process.exit(0);
    }

    // Tạo mật khẩu đã hash
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Tạo tài khoản admin (normalize email)
    const admin = new User({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
      is_active: true,
    });

    await admin.save();
    
    console.log("\n✅ Đã tạo tài khoản admin thành công!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:    " + ADMIN_EMAIL);
    console.log("🔑 Mật khẩu: " + ADMIN_PASSWORD);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n⚠️  LƯU Ý: Vui lòng đổi mật khẩu sau khi đăng nhập!");
    console.log("   Đăng nhập tại: http://localhost:5173/login");
    console.log("   Sau đó truy cập: http://localhost:5173/admin\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khi tạo admin:", error);
    process.exit(1);
  }
}

createAdmin();

