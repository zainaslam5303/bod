const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Invoice = sequelize.define("Invoice", {
  merchant_id: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: true },
  oil_type: { type: DataTypes.STRING, allowNull: false },
  rate: { type: DataTypes.INTEGER, allowNull: false},
  weight: { type: DataTypes.INTEGER, allowNull: false},
//   amount: { type: DataTypes.INTEGER, allowNull: false },
  other_charges: { type: DataTypes.INTEGER, allowNull: true },
  total_amount: { type: DataTypes.INTEGER, allowNull: false },
  other_account: { type: DataTypes.STRING, allowNull: true },
  settled_amount: { type: DataTypes.INTEGER, allowNull: false },
  unsettled_amount: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },

}, {
  // timestamps: false, // disable both
  createdAt: "created_date", // use custom column
  updatedAt: "updated_date", // no updated column
});

module.exports = Invoice;
