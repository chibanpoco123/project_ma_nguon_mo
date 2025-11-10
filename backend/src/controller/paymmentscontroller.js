import Payment from "../models/payments.js";

// Tạo payment
export const createPayment = async (req, res) => {
  try {
    const payment = new Payment(req.body);
    const savedPayment = await payment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(400).json({ message: "Tạo payment thất bại", error });
  }
};

// Lấy danh sách payments
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("user_id order_id");
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Lấy danh sách thất bại", error });
  }
};

// Lấy payment theo ID
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("user_id order_id");
    if (!payment) return res.status(404).json({ message: "Payment không tồn tại" });
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Lấy payment thất bại", error });
  }
};

// Cập nhật payment
export const updatePayment = async (req, res) => {
  try {
    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedPayment) return res.status(404).json({ message: "Payment không tồn tại" });
    res.status(200).json(updatedPayment);
  } catch (error) {
    res.status(400).json({ message: "Cập nhật thất bại", error });
  }
};

// Xoá payment
export const deletePayment = async (req, res) => {
  try {
    const deletedPayment = await Payment.findByIdAndDelete(req.params.id);
    if (!deletedPayment) return res.status(404).json({ message: "Payment không tồn tại" });
    res.status(200).json({ message: "Xoá payment thành công" });
  } catch (error) {
    res.status(500).json({ message: "Xoá thất bại", error });
  }
};
