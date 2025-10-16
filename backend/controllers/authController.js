const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { jwtKey } = require("../middlewares/authMiddleware");

exports.register = async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({ username: req.body.username, password: hash });
    res.json({ success: true, user });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    console.log("Full Body:", req.body);
console.log("Username check:", req.body.username);
    const user = await User.findOne({ where: { username: req.body.username } });
    if (!user) return res.json({ success: false, message: "Invalid username or password" });

    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) return res.json({ success: false, message: "Invalid username or password" });

    const token = jwt.sign({ id: user.id, username: user.username }, jwtKey, { expiresIn: "12h" });
    res.json({ success: true, user: { id: user.id, username: user.username,first_name: user.first_name,last_name:user.last_name }, token });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
exports.verify = async (req, res) => {
  try {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json({ success: false, message: "Token required" });

    const decoded = jwt.verify(token, jwtKey);
    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "username", "email", "first_name", "last_name"]
    });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid Token" });
  }
};

