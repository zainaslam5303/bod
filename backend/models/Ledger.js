const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Ledger = sequelize.define("Ledger", {
  merchant_id: { type: DataTypes.INTEGER, allowNull: false },
  invoice_id: { type: DataTypes.INTEGER, allowNull: true },
  payment_id: { type: DataTypes.INTEGER, allowNull: true },
  description: { type: DataTypes.STRING, allowNull: true },
  oil_type: { type: DataTypes.STRING, allowNull: false },
  other_account: { type: DataTypes.STRING, allowNull: true },
//   amount: { type: DataTypes.INTEGER, allowNull: false },
  credit: { type: DataTypes.INTEGER, allowNull: true },
  debit: { type: DataTypes.INTEGER, allowNull: true },

}, {
  // timestamps: false, // disable both
  createdAt: "created_date", // use custom column
  updatedAt: "updated_date", // no updated column
});

module.exports = Ledger;
