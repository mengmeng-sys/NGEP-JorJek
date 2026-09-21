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

function requireAuthOrMfaTemp(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret);
    if (payload.mfa_pending) {
      req.userId = payload.sub;
      req.mfaPending = true;
      return next();
    }
    const { supabase } = require("../config/db");
    supabase
      .from("users")
      .select("id, token_version")
      .eq("id", payload.sub)
      .maybeSingle()
      .then(({ data: user, error }) => {
        if (error) return next(error);
        if (!user || (user.token_version ?? 0) !== payload.ver) {
          return res.status(401).json({ error: "Invalid or expired token" });
        }
        req.userId = user.id;
        next();
      });
  } catch (err) {
    if (err?.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired. Please log in again." });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { requireMfaTempToken, requireAuthOrMfaTemp };
