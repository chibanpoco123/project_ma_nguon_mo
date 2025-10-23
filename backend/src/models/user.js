import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // 👤 Tên người dùng
    name: {
      type: String,
      required: [true, "Tên người dùng là bắt buộc"],
      trim: true,
    },

    // 📧 Email - duy nhất
    email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      unique: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Email không hợp lệ"],
    },

    // 🔒 Mật khẩu (nên được mã hoá bằng bcrypt trước khi lưu)
    password: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
      minlength: [6, "Mật khẩu ít nhất 6 ký tự"],
    },

    // 📱 Số điện thoại
    phone: {
      type: String,
      trim: true,
    },

    // 🏠 Địa chỉ
    address: {
      type: String,
      trim: true,
    },

    // 🧩 Vai trò (admin / customer / staff)
    role: {
      type: String,
      enum: ["customer", "admin", "staff"],
      default: "customer",
    },

    // 🖼️ Ảnh đại diện
    avatar: {
      type: String,
      default: "",
    },

    // ⚙️ Trạng thái hoạt động
    is_active: {
      type: Boolean,
      default: true,
    },

    // ✅ Xác minh tài khoản & email
    is_verified_at: {
      type: Date,
      default: null,
    },
    email_verified_at: {
      type: Date,
      default: null,
    },

    // ⏰ Thời điểm đăng nhập gần nhất
    last_login_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);
const User = mongoose.model("User", userSchema);
export default User;
