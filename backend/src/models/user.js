import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên người dùng là bắt buộc"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      unique: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Email không hợp lệ"],
    },
    password: {
      type: String,
      validate: {
        validator: function(v) {
          // If password is empty/null (OAuth users), allow it
          if (!v || v === '') return true;
          // If password exists, it must be at least 6 characters
          return v.length >= 6;
        },
        message: "Mật khẩu ít nhất 6 ký tự khi được cung cấp"
      }
    },
    phone: {
      type: String,
      trim: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
    },

    address: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["customer", "admin", "staff"],
      default: "customer",
    },

    avatar: {
      type: String,
      default: "",
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_verified_at: {
      type: Date,
      default: null,
    },
    email_verified_at: {
      type: Date,
      default: null,
    },
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
