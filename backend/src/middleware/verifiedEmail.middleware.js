const { supabase } = require("../config/db");

// Blocks authenticated users whose email is not verified yet from any
// action that writes to the campus feed (posts, comments, votes, tag
// follows, reports). Must run AFTER requireAuth — it reuses the
// `req.user.emailVerified` flag set there and falls back to a DB lookup if
// the middleware is ever mounted without requireAuth first.
async function requireVerifiedEmail(req, res, next) {
  try {
    let verified = req.user?.emailVerified;
    if (verified === undefined) {
      const { data: user, error } = await supabase
        .from("users")
        .select("id, email_verified")
        .eq("id", req.userId)
        .maybeSingle();
      if (error) throw error;
      verified = user?.email_verified ?? false;
    }
    if (!verified) {
      return res
        .status(403)
        .json({ error: "Please verify your email to continue" });
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireVerifiedEmail };