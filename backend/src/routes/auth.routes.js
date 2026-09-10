const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { supabase } = require("../config/db");
const { env } = require("../config/env");
const { sendMail } = require("../config/mailer");
const { generateOtp, otpEmailHtml, successEmailHtml } = require("../utils/otp");
const { requireCadtEmail } = require("../middleware/cadtEmailGate.middleware");
const { requireAuth } = require("../middleware/auth.middleware");

const OTP_EXPIRY_MINUTES = 10;
const REFRESH_TOKEN_DAYS = 30;

const authRouter = Router();

// ─── helpers ──────────────────────────────────────────────────────────
function signAccessToken(userId, tokenVersion) {
  return jwt.sign({ sub: userId, ver: tokenVersion }, env.jwtSecret, { expiresIn: "7d" });
}

function signRefreshToken(userId, tokenVersion) {
  return jwt.sign({ sub: userId, ver: tokenVersion }, env.jwtRefreshSecret, { expiresIn: `${REFRESH_TOKEN_DAYS}d` });
}

function otpExpiry() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + OTP_EXPIRY_MINUTES);
  return d.toISOString();
}

function userSafe(row) {
  return { id: row.id, email: row.email, displayName: row.display_name, role: row.role, emailVerified: row.email_verified };
}

// ─── POST /auth/signup ────────────────────────────────────────────────
authRouter.post("/signup", requireCadtEmail, async (req, res, next) => {
  try {
    const { cadtEmail, password, displayName, role } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    const { data: user, error } = await supabase
      .from("users")
      .insert({
        email: cadtEmail,
        password_hash: passwordHash,
        display_name: displayName,
        role: role ?? "STUDENT",
        email_verified: false,
        otp_code: otp,
        otp_expires_at: otpExpiry(),
      })
      .select()
      .single();
    if (error) throw error;

    const token = signAccessToken(user.id, user.token_version);
    const refreshToken = signRefreshToken(user.id, user.token_version);

    await sendMail({
      to: cadtEmail,
      subject: "JorJek — Verify your email",
      html: otpEmailHtml(otp, "verify"),
    }).catch((e) => console.error("Failed to send verification OTP:", e.message));

    res.status(201).json({ token, refreshToken, user: userSafe(user) });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/login ─────────────────────────────────────────────────
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

// ─── POST /auth/refresh ───────────────────────────────────────────────
authRouter.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }

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

// ─── POST /auth/logout ────────────────────────────────────────────────
authRouter.post("/logout", requireAuth, async (req, res, next) => {
  try {
    // Try the RPC first (atomic increment)
    const { error: rpcErr } = await supabase.rpc("increment_token_version", { uid: req.userId });
    if (rpcErr) {
      // Fallback: manual bump if the RPC doesn't exist yet
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

// ─── GET /auth/me ─────────────────────────────────────────────────────
authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id,email,display_name,role,bio,karma,email_verified,created_at")
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
      karma: user.karma,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/resend-otp ────────────────────────────────────────────
authRouter.post("/resend-otp", async (req, res, next) => {
  try {
    const { cadtEmail } = req.body;
    if (!cadtEmail) {
      return res.status(400).json({ error: "Email is required" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email_verified")
      .eq("email", cadtEmail)
      .maybeSingle();
    if (error) throw error;
    if (!user) {
      return res.status(404).json({ error: "No account found with this email" });
    }
    if (user.email_verified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    const otp = generateOtp();
    const { error: updateErr } = await supabase
      .from("users")
      .update({ otp_code: otp, otp_expires_at: otpExpiry() })
      .eq("id", user.id);
    if (updateErr) throw updateErr;

    await sendMail({
      to: cadtEmail,
      subject: "JorJek — New Verification Code",
      html: otpEmailHtml(otp, "resend"),
    });

    res.json({ message: "OTP sent" });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/verify-email ──────────────────────────────────────────
authRouter.post("/verify-email", async (req, res, next) => {
  try {
    const { cadtEmail, otp } = req.body;
    if (!cadtEmail || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, otp_code, otp_expires_at, email_verified")
      .eq("email", cadtEmail)
      .maybeSingle();
    if (error) throw error;
    if (!user) return res.status(404).json({ error: "No account found with this email" });
    if (user.email_verified) return res.json({ message: "Email already verified" });

    if (!user.otp_code || user.otp_code !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    if (new Date(user.otp_expires_at) < new Date()) {
      return res.status(400).json({ error: "OTP has expired — request a new one" });
    }

    const { error: updateErr } = await supabase
      .from("users")
      .update({ email_verified: true, otp_code: null, otp_expires_at: null })
      .eq("id", user.id);
    if (updateErr) throw updateErr;

    await sendMail({
      to: cadtEmail,
      subject: "JorJek — Email Verified Successfully",
      html: successEmailHtml("verified"),
    }).catch((e) => console.error("Failed to send verification success email:", e.message));

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/forgot-password ───────────────────────────────────────
authRouter.post("/forgot-password", async (req, res, next) => {
  try {
    const { cadtEmail } = req.body;
    if (!cadtEmail) {
      return res.status(400).json({ error: "Email is required" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", cadtEmail)
      .maybeSingle();
    if (error) throw error;

    // Always return success to prevent email enumeration
    if (!user) return res.json({ message: "If an account exists, an OTP has been sent" });

    const otp = generateOtp();
    const { error: updateErr } = await supabase
      .from("users")
      .update({ otp_code: otp, otp_expires_at: otpExpiry() })
      .eq("id", user.id);
    if (updateErr) throw updateErr;

    await sendMail({
      to: cadtEmail,
      subject: "JorJek — Password Reset",
      html: otpEmailHtml(otp, "reset"),
    });

    res.json({ message: "If an account exists, an OTP has been sent" });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/reset-password ────────────────────────────────────────
authRouter.post("/reset-password", async (req, res, next) => {
  try {
    const { cadtEmail, otp, newPassword } = req.body;
    if (!cadtEmail || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, OTP, and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, otp_code, otp_expires_at")
      .eq("email", cadtEmail)
      .maybeSingle();
    if (error) throw error;
    if (!user) return res.status(404).json({ error: "No account found" });

    if (!user.otp_code || user.otp_code !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    if (new Date(user.otp_expires_at) < new Date()) {
      return res.status(400).json({ error: "OTP has expired — request a new one" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const { error: updateErr } = await supabase
      .from("users")
      .update({
        password_hash: passwordHash,
        otp_code: null,
        otp_expires_at: null,
        token_version: 0, // invalidate all existing sessions
      })
      .eq("id", user.id);
    if (updateErr) throw updateErr;

    await sendMail({
      to: cadtEmail,
      subject: "JorJek — Password Reset Successful",
      html: successEmailHtml("passwordReset"),
    }).catch((e) => console.error("Failed to send password reset success email:", e.message));

    res.json({ message: "Password reset successfully — please log in" });
  } catch (err) {
    next(err);
  }
});

module.exports = { authRouter };
