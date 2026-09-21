const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

function requireMfaTempToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "MFA session token required" });
  }
  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret);
    if (!payload.mfa_pending) {
      return res.status(403).json({ error: "Full authentication required" });
    }
    req.userId = payload.sub;
    req.mfaPending = true;
    next();
  } catch (err) {
    if (err?.name === "TokenExpiredError") {
      return res.status(401).json({ error: "MFA session expired. Please log in again." });
    }
    return res.status(401).json({ error: "Invalid MFA session" });
  }
}

module.exports = { requireMfaTempToken };
