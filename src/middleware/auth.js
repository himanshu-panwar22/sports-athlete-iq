const jwt = require("jsonwebtoken");
const config = require("../config");
const db = require("../db");

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      phone: user.phone,
      role: user.role,
      fullName: user.fullName
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
}

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Authentication token missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    const user = await db.getUserById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: "User account inactive or not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, error: "Authentication token expired" });
    }
    return res.status(401).json({ success: false, error: "Invalid authentication token" });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: role ${req.user.role} does not have permission for this resource`
      });
    }
    next();
  };
}

module.exports = {
  generateToken,
  authenticate,
  authorize
};
