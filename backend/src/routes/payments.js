import express from "express";
import {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  createMomoPayment
} from "../controller/paymmentscontroller.js";

const router = express.Router();

router.post("/", createPayment);
router.get("/", getPayments);
router.get("/:id", getPaymentById);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);
router.post("/momo", createMomoPayment);

export default router;
