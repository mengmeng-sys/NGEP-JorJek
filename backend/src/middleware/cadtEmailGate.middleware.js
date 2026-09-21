const { env } = require("../config/env");

// Enforces the CADT-email-gated flows described in the project scope.
// Used on the signup, forgot-password, and reset-password routes.
function requireCadtEmail(req, res, next) {
  const email = req.body && req.body.cadtEmail;
  const normalized = email?.toLowerCase();
  if (!normalized || !env.cadtEmailDomains.some((d) => normalized.endsWith(d))) {
    return res.status(400).json({
      error: `A valid CADT email (${env.cadtEmailDomains.join(" or ")}) is required`,
    });
  }
  next();
}

module.exports = { requireCadtEmail };
