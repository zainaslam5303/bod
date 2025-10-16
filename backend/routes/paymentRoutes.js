const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const {
  getAllPayments,
  addPayment,
  getPaymentById,
  updatePayment,
  deletePayment
} = require("../controllers/paymentController");

router.get("/", verifyToken, getAllPayments);
router.post("/", verifyToken, addPayment);
router.get("/:id", verifyToken, getPaymentById);
router.put("/:id", verifyToken, updatePayment);
router.delete("/:id", verifyToken, deletePayment);

module.exports = router;
