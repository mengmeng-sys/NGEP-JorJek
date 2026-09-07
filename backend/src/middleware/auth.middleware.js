const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const { prisma } = require("../config/db");

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

// Admin Dashboard RBAC (SRS 2.1). Must be chained after requireAuth.
// Enforces the four-role hierarchy (SUPER_ADMIN > MODERATOR > PROFESSOR />
// STUDENT): the route provides the allowed roles, and the signed-in user's
// role must be one of them. Account standing is also enforced here so a
// banned/suspended account can't keep using admin endpoints.
function requireRole(...roles) {
  return async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      if (!user) {
        return res.status(401).json({ error: "Account not found" });
      }
      if (user.status === "BANNED") {
        return res.status(403).json({ error: "This account has been banned" });
      }
      if (user.status === "SUSPENDED" && user.suspendedUntil && user.suspendedUntil > new Date()) {
        return res.status(403).json({ error: "This account is currently suspended" });
      }
      if (!roles.includes(user.role)) {
        return res.status(403).json({ error: "Forbidden: insufficient role" });
      }
      req.admin = user;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { requireAuth, requireRole };