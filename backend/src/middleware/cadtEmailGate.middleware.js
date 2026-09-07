const { env } = require("../config/env");

// Enforces the CADT-email-gated signup described in the project scope.
// Used only on the signup route, not on every request.
function requireCadtEmail(req, res, next) {
  const email = req.body && req.body.cadtEmail;
  const normalized = email && email.toLowerCase();
  const allowed = [
    env.cadtEmailDomain.toLowerCase(),
    env.studentEmailDomain.toLowerCase(),
  ];
  if (!normalized || !allowed.some((d) => normalized.endsWith(d))) {
    return res.status(400).json({ error: "Invalid Credentials" });
  }
  next();
}

module.exports = { requireCadtEmail };
