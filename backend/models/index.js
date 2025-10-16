const sequelize = require("../config/db");
const Invoice = require("./Invoice");
const Merchant = require("./Merchant");
const Payment = require("./Payment");

// ✅ Define associations here (ONLY here)
Merchant.hasMany(Invoice, { foreignKey: "merchant_id" });
Invoice.belongsTo(Merchant, { foreignKey: "merchant_id" });

Merchant.hasMany(Payment, { foreignKey: "merchant_id" });
Payment.belongsTo(Merchant, { foreignKey: "merchant_id" });

module.exports = { sequelize, Invoice, Merchant };
