const { supabase } = require("../config/db");

// RBAC guard — must run AFTER requireAuth. Verifies the authenticated
// user's role from the database (req.user only has id + emailVerified)
// and rejects anyone without an allowed management role.
function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", req.userId)
        .maybeSingle();
      if (error) throw error;
      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      req.user = { ...req.user, id: req.userId, role: user.role };
      req.admin = { id: req.userId, role: user.role };
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { requireRole };
