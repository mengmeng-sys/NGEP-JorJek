const { env } = require("../config/env");

// Enforces the CADT-email-gated flows described in the project scope.
// Used on the signup, forgot-password, and reset-password routes.
function requireCadtEmail(req, res, next) {
  const email = req.body && req.body.cadtEmail;
  if (!email || !email.toLowerCase().endsWith(env.cadtEmailDomain.toLowerCase())) {
    return res.status(400).json({ error: `A ${env.cadtEmailDomain} email is required` });
  }
  next();
}

module.exports = { requireCadtEmail };
