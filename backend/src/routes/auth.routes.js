const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { supabase } = require("../config/db");
const { env } = require("../config/env");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireCadtEmail } = require("../middleware/cadtEmailGate.middleware");
const { signAccessToken, signRefreshToken, userSafe } = require("../lib/token");
const { sendMail } = require("../config/mailer");
const { generateOtp, otpEmailHtml } = require("../utils/otp");
const { getIO } = require("../lib/socket");
const { signupLimiter } = require("../middleware/rateLimit.middleware");
const { signMfaTempToken } = require("./mfa.routes");


const authRouter = Router();

const OTP_EXPIRY_MINUTES = 10;

function otpExpiry() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + OTP_EXPIRY_MINUTES);
  return d.toISOString();
}

const { hashToken, storeRefreshToken } = require("../lib/tokenStore");

authRouter.post("/signup", signupLimiter, requireCadtEmail, async (req, res, next) => {
  try {
    const { cadtEmail, password, displayName, gen, department, specialization } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    if (gen !== undefined && gen !== null && gen !== '') {
      const maxGen = new Date().getFullYear() - 2014 + 1;
      const genVal = Number(gen);
      if (isNaN(genVal) || genVal < 1 || genVal > maxGen) {
        return res.status(400).json({ error: `Generation must be between 1 and ${maxGen} (CADT started in 2014).` });
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const otp = generateOtp();

    const { data: user, error } = await supabase
      .from("users")
      .insert({
        email: cadtEmail,
        password_hash: passwordHash,
        display_name: displayName,
        role: "STUDENT",
        gen: gen ?? null,
        department: department ?? null,
        specialization: specialization ?? null,
        email_verified: false,
        otp_code: otp,
        otp_expires_at: otpExpiry(),
      })
      .select()
      .single();
    if (error) throw error;

    const token = signAccessToken(user.id, user.token_version);
    const refreshToken = signRefreshToken(user.id, user.token_version);
    await storeRefreshToken(user.id, refreshToken);

    await sendMail({
      to: cadtEmail,
      subject: "JorJek — Verify your email",
      html: otpEmailHtml(otp, "verify"),
    }).catch((e) => console.error("Failed to send verification OTP:", e.message));

    const io = getIO();
    if (io) {
      io.emit("user_registered", userSafe(user));
    }

    const devPayload = process.env.NODE_ENV !== "production" ? { devOtp: otp } : {};
    res.status(201).json({ token, refreshToken, user: userSafe(user), ...devPayload });
  } catch (err) {
    next(err);
  }
});

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

    if (user.status === "BANNED") {
      return res.status(403).json({ error: "This account has been banned" });
    }
    if (user.status === "SUSPENDED") {
      if (user.suspended_until && new Date(user.suspended_until) < new Date()) {
        await supabase.from("users").update({ status: "ACTIVE", suspended_until: null }).eq("id", user.id);
      } else {
        const until = user.suspended_until ? ` until ${new Date(user.suspended_until).toLocaleDateString()}` : "";
        return res.status(403).json({ error: `This account is suspended${until}` });
      }
    }

    if (user.totp_enabled) {
      const mfaToken = signMfaTempToken(user.id);
      return res.json({ mfaRequired: true, mfaToken });
    }

    const token = signAccessToken(user.id, user.token_version);
    const refreshToken = signRefreshToken(user.id, user.token_version);
    await storeRefreshToken(user.id, refreshToken);

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
      .select("id, token_version, status, suspended_until")
      .eq("id", payload.sub)
      .maybeSingle();
    if (error) throw error;
    if (!user || user.token_version !== payload.ver) {
      return res.status(401).json({ error: "Token revoked — please log in again" });
    }

    if (user.status === "BANNED") {
      return res.status(403).json({ error: "This account has been banned" });
    }
    if (user.status === "SUSPENDED") {
      if (user.suspended_until && new Date(user.suspended_until) < new Date()) {
        await supabase.from("users").update({ status: "ACTIVE", suspended_until: null }).eq("id", user.id);
      } else {
        return res.status(403).json({ error: "This account is currently suspended" });
      }
    }

    const tokenHash = hashToken(refreshToken);
    const { data: storedToken, error: tokenErr } = await supabase
      .from("refresh_tokens")
      .select("id, used_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (tokenErr || !storedToken) {
      return res.status(401).json({ error: "Refresh token not found" });
    }

    if (storedToken.used_at) {
      await supabase.from("refresh_tokens").delete().eq("user_id", user.id);
      await supabase.rpc("increment_token_version", { uid: user.id }).catch(() => {});
      return res.status(401).json({ error: "Refresh token reuse detected — all sessions revoked" });
    }

    await supabase
      .from("refresh_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", storedToken.id);

    const newAccessToken = signAccessToken(user.id, user.token_version);
    const newRefreshToken = signRefreshToken(user.id, user.token_version);
    await storeRefreshToken(user.id, newRefreshToken);

    res.json({ token: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", requireAuth, async (req, res, next) => {
  try {
    await supabase.from("refresh_tokens").delete().eq("user_id", req.userId);
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
      .select("id,email,display_name,role,bio,gen,department,specialization,avatar_url,karma,email_verified,show_profile_to_guests,allow_direct_requests,show_online_status,receive_email_notifications,created_at")
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
      avatarUrl: user.avatar_url,
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

authRouter.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();
    if (error) throw error;
    if (!user) {
      return res.json({ message: "If an account exists with this email, a reset code has been sent." });
    }

    const otp = generateOtp();
    await supabase
      .from("users")
      .update({ otp_code: otp, otp_expires_at: otpExpiry() })
      .eq("id", user.id);

    await sendMail({
      to: email,
      subject: "JorJek — Reset your password",
      html: otpEmailHtml(otp, "reset"),
    }).catch((e) => console.error("Failed to send reset OTP:", e.message));

    const devPayload = process.env.NODE_ENV !== "production" ? { devOtp: otp } : {};
    res.json({ message: "If an account exists with this email, a reset code has been sent.", ...devPayload });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/reset-password", async (req, res, next) => {
  try {
    const { email, otpCode, newPassword } = req.body;
    if (!email || !otpCode || !newPassword) {
      return res.status(400).json({ error: "Email, OTP code, and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, otp_code, otp_expires_at, token_version")
      .eq("email", email)
      .maybeSingle();
    if (error) throw error;
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.otp_code || user.otp_code !== otpCode) {
      return res.status(400).json({ error: "Invalid or expired reset code" });
    }

    const now = new Date();
    const expiresAt = new Date(user.otp_expires_at);
    if (now > expiresAt) {
      return res.status(400).json({ error: "Reset code has expired. Please request a new one." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_hash: passwordHash,
        otp_code: null,
        otp_expires_at: null,
        token_version: (user.token_version ?? 0) + 1,
      })
      .eq("id", user.id);
    if (updateError) throw updateError;

    res.json({ message: "Password reset successfully — please log in" });
  } catch (err) {
    next(err);
  }
});

module.exports = { authRouter };
