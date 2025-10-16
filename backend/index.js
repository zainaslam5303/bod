const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/merchants", require("./routes/merchantRoutes"));
app.use("/invoice", require("./routes/invoiceRoutes"));
app.use("/payment", require("./routes/paymentRoutes"));

// Sync DB
sequelize.sync()
  .then(() => console.log("✅ Tables created"))
  .catch((err) => console.error("❌ Error creating tables:", err));

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
