const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const {
  getAllInvoices,
  addInvoice,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
} = require("../controllers/invoiceController");

router.get("/", verifyToken, getAllInvoices);
router.post("/", verifyToken, addInvoice);
router.get("/:id", verifyToken, getInvoiceById);
router.put("/:id", verifyToken, updateInvoice);
router.delete("/:id", verifyToken, deleteInvoice);

module.exports = router;
