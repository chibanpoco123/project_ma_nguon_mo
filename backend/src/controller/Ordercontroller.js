import Order from "../models/Order.js";
import mongoose from "mongoose";

// 📌 Hàm tạo mã đơn hàng tự động
const generateOrderNumber = () => {
  const date = new Date();
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD${yyyymmdd}${random}`;
};

// 📦 1️⃣ Tạo đơn hàng mới
export const createOrder = async (req, res) => {
  try {
    const user_id = req.user.id;
    const order_number = generateOrderNumber();

    const {
      customer_name,
      customer_phone,
      customer_email,
      shipping_address,
      shipping_ward,
      shipping_district,
      shipping_province,
      subtotal,
      shipping_fee,
      discount_amount,
      tax,
      total_price,
      payment_method,
      shipping_method,
      customer_note,
    } = req.body;

    // Kiểm tra thông tin cơ bản
    if (!customer_name || !customer_phone || !shipping_address) {
      return res.status(400).json({ message: "Thiếu thông tin người nhận" });
    }

    const newOrder = new Order({
      user_id,
      order_number,
      customer_name,
      customer_phone,
      customer_email,
      shipping_address,
      shipping_ward,
      shipping_district,
      shipping_province,
      subtotal,
      shipping_fee,
      discount_amount,
      tax,
      total_price,
      payment_method,
      shipping_method,
      customer_note,
    });

    await newOrder.save();
    res.status(201).json({ message: "Tạo đơn hàng thành công", order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi tạo đơn hàng", error: error.message });
  }
};

// 📋 2️⃣ Lấy danh sách đơn hàng của user
export const getUserOrders = async (req, res) => {
  try {
    const user_id = req.user.id;
    const orders = await Order.find({ user_id }).sort({ created_at: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng" });
  }
};

// 🧾 3️⃣ Lấy chi tiết 1 đơn hàng
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const order = await Order.findById(id).populate("user_id", "name email");
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi lấy chi tiết đơn hàng" });
  }
};

// 🛠️ 4️⃣ Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status, admin_note } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    if (status) order.status = status;
    if (payment_status) order.payment_status = payment_status;
    if (admin_note) order.admin_note = admin_note;

    // Ghi nhận thời điểm thay đổi trạng thái
    if (status === "confirmed") order.confirmed_at = new Date();
    if (status === "shipped") order.shipped_at = new Date();
    if (status === "delivered") order.delivered_at = new Date();
    if (status === "cancelled") order.cancelled_at = new Date();

    order.updated_at = new Date();
    await order.save();

    res.json({ message: "Cập nhật đơn hàng thành công", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi cập nhật đơn hàng" });
  }
};
// 📦 Cập nhật thông tin người nhận khi đơn còn pending
export const updateOrderInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // id đơn hàng
    const {
      customer_name,
      customer_phone,
      shipping_address,
      shipping_ward,
      shipping_district,
      shipping_province,
    } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    // ✅ Kiểm tra quyền
    if (order.user_id.toString() !== userId) {
      return res.status(403).json({ message: "Bạn không có quyền sửa đơn này" });
    }

    // ✅ Chỉ được sửa nếu đơn còn pending
    if (order.status !== "pending") {
      return res.status(400).json({ message: "Chỉ được chỉnh sửa khi đơn đang chờ xác nhận (pending)" });
    }

    // ✅ Cập nhật thông tin
    if (customer_name) order.customer_name = customer_name;
    if (customer_phone) order.customer_phone = customer_phone;
    if (shipping_address) order.shipping_address = shipping_address;
    if (shipping_ward) order.shipping_ward = shipping_ward;
    if (shipping_district) order.shipping_district = shipping_district;
    if (shipping_province) order.shipping_province = shipping_province;
    order.updated_at = new Date();

    await order.save();

    res.json({
      message: "Cập nhật thông tin người nhận thành công",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi cập nhật thông tin đơn hàng", error: error.message });
  }
};

// 🗑️ 5️⃣ Xóa đơn hàng
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    await Order.findByIdAndDelete(id);
    res.json({ message: "Xóa đơn hàng thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi xóa đơn hàng" });
  }
};

// 🧹 6️⃣ Admin: Lấy toàn bộ đơn hàng (tất cả người dùng)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user_id", "name email")
      .sort({ created_at: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng" });
  }
};
// 📌 Hủy đơn hàng (user)
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Lấy từ middleware verifyToken

    // Tìm đơn hàng của user
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Kiểm tra quyền: chỉ chủ đơn hàng hoặc admin mới được hủy
    if (order.user_id.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Không có quyền hủy đơn hàng này" });
    }

    // Chỉ cho phép hủy khi trạng thái là 'pending'
    if (order.status !== "pending") {
      return res.status(400).json({
        message: "Chỉ có thể hủy đơn hàng khi trạng thái là 'pending'",
        currentStatus: order.status,
      });
    }

    // Cập nhật trạng thái
    order.status = "cancelled";
    order.cancelled_at = new Date();
    await order.save();

    return res.json({ message: "Đơn hàng đã được hủy thành công", order });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi hủy đơn hàng", error: error.message });
  }
};
