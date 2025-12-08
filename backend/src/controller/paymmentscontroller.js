import crypto from "crypto";
import https from "https";
import Payment from "../models/payments.js";

// =============================
// CRUD PAYMENT
// =============================

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
    const updated = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Payment không tồn tại" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: "Cập nhật thất bại", error });
  }
};

// Xoá payment
export const deletePayment = async (req, res) => {
  try {
    const deleted = await Payment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Payment không tồn tại" });
    res.status(200).json({ message: "Xoá payment thành công" });
  } catch (error) {
    res.status(500).json({ message: "Xoá thất bại", error });
  }
};

// =============================
// 🔥 TẠO THANH TOÁN MOMO
// =============================
export const createMomoPayment = async (req, res) => {
  try {
    const partnerCode = "MOMO";
    const accessKey = "F8BBA842ECF85";
    const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";

    const requestId = partnerCode + Date.now();
    const orderId = requestId;
    const orderInfo = "pay with MoMo";

    const redirectUrl = "https://momo.vn/return";
    const ipnUrl = "https://callback.url/notify";

    const amount = req.body.amount || "50000";
    const requestType = "captureWallet";
    const extraData = "";

    const rawSignature =
      `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = JSON.stringify({
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: "vi",
    });

    // ---------------- SEND TO MOMO ----------------
    const options = {
      hostname: "test-payment.momo.vn",
      port: 443,
      path: "/v2/gateway/api/create",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody),
      },
    };

    const momoReq = https.request(options, (momoRes) => {
      let data = "";

      momoRes.on("data", (chunk) => (data += chunk));

      momoRes.on("end", () => {
        const response = JSON.parse(data);
        return res.json(response);
      });
    });

    momoReq.on("error", (e) => {
      return res.status(500).json({ message: "Lỗi MoMo", error: e });
    });

    momoReq.write(requestBody);
    momoReq.end();
  } catch (error) {
    res.status(500).json({ message: "Lỗi MoMo server", error });
  }
};
