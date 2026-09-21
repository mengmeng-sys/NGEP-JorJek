const jwt = require("jsonwebtoken");
const { supabase } = require("../config/db");
const { env } = require("../config/env");

// TN1 — task tracker #34 "Security review of auth + session endpoints"
// touches this file. Verifies the JWT issued at login/signup and attaches
// req.userId (plus req.user) for downstream routes. It also checks the token
// hasn't been revoked: a `token_version` bump on logout or password reset
// invalidates every previously-issued access token immediately, instead of
// letting them linger until their 7-day expiry.
async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing bearer token" });
  }
  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret);
    if (payload.mfa_pending) {
      return res.status(403).json({ error: "MFA setup or verification required" });
    }
    const { data: user, error } = await supabase
      .from("users")
      .select("id, token_version, email_verified")
      .eq("id", payload.sub)
      .maybeSingle();
    if (error) throw error;
    if (!user || (user.token_version ?? 0) !== payload.ver) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    req.userId = user.id;
    req.user = { id: user.id, emailVerified: user.email_verified };
    next();
  } catch (err) {
    if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    next(err);
  }
}

module.exports = { requireAuth, optionalAuth };

// Same token verification as requireAuth, but never rejects: it simply attaches
// req.userId/req.user when a valid (non-revoked) bearer token is present, and
// leaves them unset otherwise. Used to decorate public reads with per-user data
// (e.g. `isSaved` on post listings) without forcing authentication.
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next();
  }
  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret);
    if (payload.mfa_pending) return next();
    const { data: user, error } = await supabase
      .from("users")
      .select("id, token_version, email_verified")
      .eq("id", payload.sub)
      .maybeSingle();
    if (!error && user && (user.token_version ?? 0) === payload.ver) {
      req.userId = user.id;
      req.user = { id: user.id, emailVerified: user.email_verified };
    }
  } catch {
    /* invalid/expired token — treat as anonymous */
  }
  next();
}