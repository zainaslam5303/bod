const Payment = require("../models/Payment");
const Ledger = require("../models/Ledger");
const Merchant = require("../models/Merchant");
const Invoice = require("../models/Invoice");
const InvoiceSettlement = require("../models/InvoiceSettlement");
const { Op } = require("sequelize");
const { sequelize } = require("../config/db"); // adjust if needed
// const { Invoice, Payment, Ledger, InvoiceSettlement } = require("../models");


exports.getAllPayments = async (req, res) => {
  try {
    const { merchantId } = req.query; // 👈 Get from query params

    // Build dynamic where condition
    const whereCondition = merchantId ? { merchant_id: merchantId } : {};

    const payments = await Payment.findAll({
      where: whereCondition,
      include: [
        {
          model: Merchant,
          attributes: ["name"],
        },
      ],
    });
    res.json({ success: true, payments });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.addPayment = async (req, res) => {
  const t = await sequelize.transaction(); // 🔹 start transaction
  try {
    const data = req.body;

    if (!data.payment_type) {
      await t.rollback();
      return res.json({ success: false, message: "Payment Type not found" });
    }

    if (data.payment_type === "invoice") {
      if (!data.invoice_id) {
        await t.rollback();
        return res.json({ success: false, message: "Invoice ID not found" });
      }

      const invoice = await Invoice.findByPk(data.invoice_id, { transaction: t });
      if (!invoice) {
        await t.rollback();
        return res.json({ success: false, message: "Invoice not found" });
      }

      const paidAmount = Number(data.amount);
      let settledForPayment = 0;
      let unsettledForPayment = 0;

      if (paidAmount >= invoice.unsettled_amount) {
        settledForPayment = invoice.unsettled_amount;
        unsettledForPayment = paidAmount - invoice.unsettled_amount;
        invoice.settled_amount += invoice.unsettled_amount;
        invoice.unsettled_amount = 0;
      } else {
        settledForPayment = paidAmount;
        unsettledForPayment = 0;
        invoice.settled_amount += paidAmount;
        invoice.unsettled_amount -= paidAmount;
      }

      await invoice.save({ transaction: t });

      const paymentData = {
        merchant_id: data.merchant_id,
        description: data.description,
        oil_type: data.oil_type,
        amount: paidAmount,
        invoice_id: data.invoice_id,
        settled_amount: settledForPayment,
        unsettled_amount: unsettledForPayment,
        date: data.date,
      };

      const payment = await Payment.create(paymentData, { transaction: t });

      const ledgerData = {
        merchant_id: data.merchant_id,
        payment_id: payment.id,
        description: data.description,
        oil_type: data.oil_type,
        credit: data.total_amount,
      };
      const ledger = await Ledger.create(ledgerData, { transaction: t });

      const invoiceSettlementData = {
        merchant_id: data.merchant_id,
        invoice_id: data.invoice_id,
        payment_id: payment.id,
        settled_amount: paidAmount,
      };
      await InvoiceSettlement.create(invoiceSettlementData, { transaction: t });

      await t.commit(); // ✅ everything OK — commit transaction
      return res.json({
        success: true,
        message: "Payment created and invoice settled",
        payment,
        ledger,
      });

    } else {
      // 🔥 General payment: settle all invoices for this merchant & oil_type
      const invoices = await Invoice.findAll({
        where: {
          merchant_id: data.merchant_id,
          oil_type: data.oil_type,
          unsettled_amount: { [Op.gt]: 0 },
        },
        transaction: t,
      });

      let remainingPayment = Number(data.amount);
      let totalSettled = 0;

      for (const inv of invoices) {
        if (remainingPayment <= 0) break;

        const unsettled = inv.unsettled_amount;
        if (remainingPayment >= unsettled) {
          inv.settled_amount += unsettled;
          inv.unsettled_amount = 0;
          remainingPayment -= unsettled;
          totalSettled += unsettled;
        } else {
          inv.settled_amount += remainingPayment;
          inv.unsettled_amount -= remainingPayment;
          totalSettled += remainingPayment;
          remainingPayment = 0;
        }

        await inv.save({ transaction: t });
        await InvoiceSettlement.create(
          {
            merchant_id: data.merchant_id,
            invoice_id: inv.id,
            settled_amount: Math.min(unsettled, data.amount),
          },
          { transaction: t }
        );
      }

      const paymentData = {
        merchant_id: data.merchant_id,
        description: data.description,
        oil_type: data.oil_type,
        amount: Number(data.amount),
        settled_amount: totalSettled,
        unsettled_amount: remainingPayment,
      };

      const payment = await Payment.create(paymentData, { transaction: t });

      const ledgerData = {
        merchant_id: data.merchant_id,
        payment_id: payment.id,
        description: data.description,
        oil_type: data.oil_type,
        credit: Number(data.amount),
      };

      const ledger = await Ledger.create(ledgerData, { transaction: t });

      await t.commit(); // ✅ everything OK
      return res.json({
        success: true,
        message: "All unsettled invoices settled successfully",
        totalSettled,
        payment,
        ledger,
      });
    }
  } catch (err) {
    await t.rollback(); // ❌ undo all changes
    return res.json({ success: false, message: err.message });
  }
};


exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.json({ success: false, message: "Payment not found" });
    res.json({ success: true, payment });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const result = await Payment.update(req.body, { where: { id: req.params.id } });
    if (result[0] > 0) {
      res.json({ success: true, message: "Payment updated" });
    } else {
      res.json({ success: false, message: "Update failed" });
    }
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    // Delete ledger entries first (to maintain FK integrity if any)
    await Ledger.destroy({ where: { payment_id: req.params.id } });

    // Then delete the payment
    const result = await Payment.destroy({ where: { id: req.params.id } });

    if (result > 0) {
      res.json({ success: true, message: "Payment and related ledger entries deleted" });
    } else {
      res.json({ success: false, message: "Payment not found" });
    }
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

