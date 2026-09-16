const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { supabase } = require("../config/db");
const { env } = require("../config/env");
const { requireAuth } = require("../middleware/auth.middleware");
const { signAccessToken, signRefreshToken, userSafe } = require("../lib/token");

const REFRESH_TOKEN_DAYS = 30;

const authRouter = Router();

<<<<<<< HEAD
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
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    bio: row.bio || null,
    gen: row.gen ?? null,
    department: row.department || null,
    specialization: row.specialization || null,
    emailVerified: row.email_verified,
    showProfileToGuests: row.show_profile_to_guests ?? true,
    allowDirectRequests: row.allow_direct_requests ?? true,
    showOnlineStatus: row.show_online_status ?? false,
    receiveEmailNotifications: row.receive_email_notifications ?? true,
  };
}

// ─── POST /auth/signup ────────────────────────────────────────────────

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Create a new account
 *     description: >
 *       Registers a new user with a CADT student email. Sends a 6-digit OTP to the email.
 *       `role` is always `STUDENT` — it is never accepted from the client (see security note below).
 *       Returns JWT tokens — email verification is recommended but tokens are issued immediately.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cadtEmail, password]
 *             properties:
 *               cadtEmail:
 *                 type: string
 *                 format: email
 *                 description: Must end with `@student.cadt.edu.kh`
 *                 example: dara@student.cadt.edu.kh
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 description: At least 6 characters
 *                 example: secret123
 *               displayName:
 *                 type: string
 *                 example: Dara Chan
 *     responses:
 *       201:
 *         description: Account created — tokens + safe user object returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthResponse"
 *       400:
 *         description: Invalid request (bad email / weak password)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
authRouter.post("/signup", requireCadtEmail, async (req, res, next) => {
  try {
    // SECURITY: `role` is intentionally NOT read from req.body. Every account
    // self-registers as STUDENT; SUPER_ADMIN/MODERATOR can only be granted by
    // an existing admin through a dedicated, requireRole-gated endpoint —
    // never by a value the caller supplies at signup.
    const { cadtEmail, password, displayName, gen, department, specialization } = req.body;
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

// ─── POST /auth/login ─────────────────────────────────────────────────

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Sign in with CADT email + password
 *     description: Authenticates a user and returns JWT access + refresh tokens along with a safe user object.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cadtEmail, password]
 *             properties:
 *               cadtEmail:
 *                 type: string
 *                 format: email
 *                 example: dara@student.cadt.edu.kh
 *               password:
 *                 type: string
 *                 format: password
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Logged in — tokens + safe user object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthResponse"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
=======
>>>>>>> e2a0731909e604507861a3ff77a53766367d8eb7
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
