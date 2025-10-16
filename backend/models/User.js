const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  first_name: { type: DataTypes.STRING, allowNull: true },
  last_name: { type: DataTypes.STRING, allowNull: true },
}, {
  // timestamps: false, // disable both
  createdAt: "created_date", // use custom column
  updatedAt: false, // no updated column
});

module.exports = User;
