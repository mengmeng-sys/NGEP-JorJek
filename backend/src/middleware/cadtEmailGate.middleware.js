const { env } = require("../config/env");

// Enforces the CADT-email-gated signup described in the project scope.
// Used only on the signup route, not on every request.
function requireCadtEmail(req, res, next) {
  const email = req.body && req.body.cadtEmail;
  if (!email || !email.toLowerCase().endsWith(env.cadtEmailDomain.toLowerCase())) {
    return res.status(400).json({ error: `Signup requires a ${env.cadtEmailDomain} email` });
  }
  next();
}

module.exports = { requireCadtEmail };
