import User from "../models/user.js";
import jwt from "jsonwebtoken";

// 🔹 Tạo access + refresh token
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET || "secretkey", { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || "refreshsecret", { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

// 🔹 Google Callback
export const googleCallback = async (req, res) => {
  try {
    console.log("🔵 Google callback received:", JSON.stringify(req.body, null, 2));

    const { credential } = req.body;
 
    if (!credential) {
      return res.status(400).json({ message: "Không nhận được credential từ Google" });
    }

    const decoded = jwt.decode(credential);

    if (!decoded) {
      return res.status(400).json({ message: "Credential không hợp lệ" });
    }

    const { sub: googleId, email, name, picture } = decoded;

    if (!email) {
      return res.status(400).json({ message: "Google không cung cấp email" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        password: "",
        googleId,
        avatar: picture,
        role: "customer",
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = picture;
      await user.save();
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.json({
      message: "Đăng nhập Google thành công",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Google callback error:", error);
    res.status(500).json({ message: "Lỗi xác thực Google", error: error.message });
  }
};


// 🔹 Facebook Callback
export const facebookCallback = async (req, res) => {
  try {
    const { id, email, name, picture } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        password: "", // OAuth users don't have password
        facebookId: id,
        avatar: picture?.data?.url,
        role: "customer",
      });
      await user.save();
    } else if (!user.facebookId) {
      user.facebookId = id;
      user.avatar = picture?.data?.url;
      await user.save();
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.json({
      message: "Đăng nhập Facebook thành công",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Facebook callback error:", error);
    res.status(500).json({ message: "Lỗi xác thực Facebook", error: error.message });
  }
};

// 🔹 Kiểm tra trạng thái đăng nhập
export const socialLoginSuccess = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Không có token" });

    const decoded = jwt.verify(token, "secretkey");
    const user = await User.findById(decoded.id).select("-password");

    res.json({ authenticated: true, user });
  } catch (error) {
    res.status(401).json({ authenticated: false, message: "Token không hợp lệ" });
  }
};

// 🔹 Logout
export const socialLogout = (req, res) => {
  res.json({ message: "Đã đăng xuất" });
};
