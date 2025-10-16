const Merchant = require("../models/Merchant");

exports.getAllMerchants = async (req, res) => {
  try {
    const merchants = await Merchant.findAll();
    res.json({ success: true, merchants });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.addMerchant = async (req, res) => {
  try {
    const exists = await Merchant.findOne({ where: { name: req.body.name } });
    if (exists) return res.json({ success: false, message: "Merchant already exists" });

    const merchant = await Merchant.create(req.body);
    res.json({ success: true, message: "Merchant created", merchant });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.getMerchantById = async (req, res) => {
  try {
    const merchant = await Merchant.findByPk(req.params.id);
    if (!merchant) return res.json({ success: false, message: "Merchant not found" });
    res.json({ success: true, merchant });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.updateMerchant = async (req, res) => {
  try {
    const result = await Merchant.update(req.body, { where: { id: req.params.id } });
    if (result[0] > 0) {
      res.json({ success: true, message: "Merchant updated" });
    } else {
      res.json({ success: false, message: "Update failed" });
    }
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.deleteMerchant = async (req, res) => {
  try {
    const result = await Merchant.destroy({ where: { id: req.params.id } });
    if (result > 0) {
      res.json({ success: true, message: "Merchant deleted" });
    } else {
      res.json({ success: false, message: "Delete failed" });
    }
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
