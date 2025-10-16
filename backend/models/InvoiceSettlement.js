const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Payment = sequelize.define("InvoiceSettlement", {
  merchant_id: { type: DataTypes.INTEGER, allowNull: false },
//   description: { type: DataTypes.STRING, allowNull: true },
//   oil_type: { type: DataTypes.STRING, allowNull: false },
//   amount: { type: DataTypes.INTEGER, allowNull: false},
  invoice_id: {type: DataTypes.INTEGER, allowNull: true},
  payment_id: {type: DataTypes.INTEGER, allowNull: true},
//   other_account: { type: DataTypes.STRING, allowNull: true },
  settled_amount: { type: DataTypes.INTEGER, allowNull: false },
//   unsettled_amount: { type: DataTypes.INTEGER, allowNull: false },

}, {
  // timestamps: false, // disable both
  createdAt: "created_date", // use custom column
  updatedAt: "updated_date", // no updated column
});

module.exports = Payment;
