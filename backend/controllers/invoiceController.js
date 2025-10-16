const Invoice = require("../models/Invoice");
const Ledger = require("../models/Ledger");
const Merchant = require("../models/Merchant");
const { Op } = require("sequelize");

exports.getAllInvoices = async (req, res) => {
  try {
    const { merchantId, settleCheck, oilType } = req.query; // 👈 both from query params

    // Build dynamic where condition
    const whereCondition = {};

    // filter by merchant
    if (merchantId) {
      whereCondition.merchant_id = merchantId;
    }

    // filter by unsettled amount only if settleCheck = 1
    if (settleCheck === "1") {
      whereCondition.unsettled_amount = { [Op.gt]: 0 }; // only > 0
    }
    
    if (oilType) {
      whereCondition.oil_type = oilType; // only > 0
    }

    const invoices = await Invoice.findAll({
      where: whereCondition,
      include: [
        {
          model: Merchant,
          attributes: ["name"],
        },
      ],
    });
    res.json({ success: true, invoices });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.addInvoice = async (req, res) => {
  try {
    // const exists = await Invoice.findOne({ where: { name: req.body.name } });
    // if (exists) return res.json({ success: false, message: "Merchant already exists" });
    const invoiceData = {
        ...req.body,           // req.body ke saare fields include kar lo
        settled_amount: 0,     // nayi fields append karo
        unsettled_amount: req.body.total_amount
        // createdBy: req.user?.id || null  // example
      };
    
    const invoice = await Invoice.create(invoiceData);
    const ledgerData = {
      merchant_id: req.body.merchant_id,
      invoice_id: invoice.id,  
      description: req.body.description,           
      oil_type: req.body.oil_type,
      debit: req.body.total_amount,
    };
    const ledger = await Ledger.create(ledgerData);

    res.json({ success: true, message: "Invoice created", invoice,ledger});
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.json({ success: false, message: "Invoice not found" });
    res.json({ success: true, invoice });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const result = await Invoice.update(req.body, { where: { id: req.params.id } });
    if (result[0] > 0) {
      res.json({ success: true, message: "Invoice updated" });
    } else {
      res.json({ success: false, message: "Update failed" });
    }
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    // Delete ledger entries first (to maintain FK integrity if any)
    await Ledger.destroy({ where: { invoice_id: req.params.id } });

    // Then delete the invoice
    const result = await Invoice.destroy({ where: { id: req.params.id } });

    if (result > 0) {
      res.json({ success: true, message: "Invoice and related ledger entries deleted" });
    } else {
      res.json({ success: false, message: "Invoice not found" });
    }
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

