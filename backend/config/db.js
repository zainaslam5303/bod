const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("bod", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

sequelize.authenticate()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ DB Connection error:", err));

module.exports = sequelize;
