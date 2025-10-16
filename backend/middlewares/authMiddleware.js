const jwt = require("jsonwebtoken");
const jwtKey = '?safkjasfjkasn/safajasjfoasj12412412???asfjasjaksl@?';;

function verifyToken(req, res, next) {
  let token = req.headers["authorization"];
  if (!token) return res.status(403).json({ success: false, message: "Token required" });

  jwt.verify(token, jwtKey, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, message: "Invalid Token" });
    req.user = decoded;
    next();
  });
}

module.exports = { verifyToken, jwtKey };
