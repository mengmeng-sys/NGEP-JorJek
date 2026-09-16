const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { supabase } = require("../config/db");
const { env } = require("../config/env");
const { requireAuth } = require("../middleware/auth.middleware");
const { signAccessToken, signRefreshToken, userSafe } = require("../lib/token");

const REFRESH_TOKEN_DAYS = 30;

const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  try {
    const { cadtEmail, password } = req.body;
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", cadtEmail)
      .maybeSingle();
    if (error) throw error;
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signAccessToken(user.id, user.token_version);
    const refreshToken = signRefreshToken(user.id, user.token_version);
    res.json({ token, refreshToken, user: userSafe(user) });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: "Refresh token required" });

    let payload;
    try {
      payload = jwt.verify(refreshToken, env.jwtRefreshSecret);
    } catch {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, token_version")
      .eq("id", payload.sub)
      .maybeSingle();
    if (error) throw error;
    if (!user || user.token_version !== payload.ver) {
      return res.status(401).json({ error: "Token revoked — please log in again" });
    }

    const newAccessToken = signAccessToken(user.id, user.token_version);
    const newRefreshToken = signRefreshToken(user.id, user.token_version);
    res.json({ token: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", requireAuth, async (req, res, next) => {
  try {
    const { error: rpcErr } = await supabase.rpc("increment_token_version", { uid: req.userId });
    if (rpcErr) {
      const { data: current } = await supabase
        .from("users").select("token_version").eq("id", req.userId).maybeSingle();
      if (current) {
        await supabase
          .from("users").update({ token_version: current.token_version + 1 }).eq("id", req.userId);
      }
    }
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id,email,display_name,role,bio,gen,department,specialization,karma,email_verified,show_profile_to_guests,allow_direct_requests,show_online_status,receive_email_notifications,created_at")
      .eq("id", req.userId)
      .maybeSingle();
    if (error) throw error;
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      bio: user.bio,
      gen: user.gen,
      department: user.department,
      specialization: user.specialization,
      karma: user.karma,
      emailVerified: user.email_verified,
      showProfileToGuests: user.show_profile_to_guests,
      allowDirectRequests: user.allow_direct_requests,
      showOnlineStatus: user.show_online_status,
      receiveEmailNotifications: user.receive_email_notifications,
      createdAt: user.created_at,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = { authRouter };
