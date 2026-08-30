const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

// TN1 — task tracker #34 "Security review of auth + session endpoints"
// touches this file. Verifies the JWT issued at login/signup and attaches
// req.userId for downstream routes.
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing bearer token" });
  }
  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { requireAuth };
