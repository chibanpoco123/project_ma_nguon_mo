import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  createMomoPayment,
  createMomoATM,
  createVNPayPayment,
  vnpayReturn,
  momoIPN,
} from "../controller/paymmentscontroller.js";

const router = express.Router();

// CREATE
router.post("/", createPayment);

// MOMO PAYMENT
router.post("/momo", createMomoPayment);
router.post("/atm", createMomoATM); // thêm route ATM
router.post("/momo/ipn", momoIPN); // MOMO IPN callback (không cần token vì là webhook)
router.post("/vnpay/create", verifyToken, createVNPayPayment);


// READ
router.get("/", getPayments);
router.get("/:id", getPaymentById);
router.get("/vnpay/return", vnpayReturn);
// UPDATE
router.put("/:id", updatePayment);

// DELETE
router.delete("/:id", deletePayment);


export default router;
