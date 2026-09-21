const { Router } = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { supabase } = require("../config/db");
const { env } = require("../config/env");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireMfaTempToken, requireAuthOrMfaTemp } = require("../middleware/mfa.middleware");
const { signAccessToken, signRefreshToken, userSafe } = require("../lib/token");
const { hashToken, storeRefreshToken } = require("../lib/tokenStore");
const {
  generateTotpSecret,
  verifyToken,
  getOtpauthUri,
  generateBackupCodes,
  hashBackupCodes,
  verifyBackupCode,
} = require("../utils/mfa");

const mfaRouter = Router();

function signMfaTempToken(userId) {
  return jwt.sign({ sub: userId, mfa_pending: true }, env.jwtSecret, { expiresIn: "5m" });
}

function verifyMfaTempToken(token) {
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    if (!payload.mfa_pending) return null;
    return payload;
  } catch {
    return null;
  }
}

mfaRouter.post("/setup", requireAuthOrMfaTemp, async (req, res, next) => {
  try {
    const { data: user } = await supabase
      .from("users")
      .select("email, totp_enabled")
      .eq("id", req.userId)
      .maybeSingle();

    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.totp_enabled) {
      return res.status(400).json({ error: "Authenticator is already enabled" });
    }

    const secret = generateTotpSecret();
    const otpauthUri = getOtpauthUri(secret, user.email);

    await supabase
      .from("users")
      .update({ totp_secret: secret })
      .eq("id", req.userId);

    res.json({
      secret,
      otpauthUri,
      message: "Scan this QR code with Microsoft Authenticator, then verify to enable",
    });
  } catch (err) {
    next(err);
  }
});

mfaRouter.post("/enable", requireAuthOrMfaTemp, async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Verification code required" });

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", req.userId)
      .maybeSingle();

    if (error) throw error;
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.totp_enabled) {
      return res.status(400).json({ error: "Authenticator is already enabled" });
    }
    if (!user.totp_secret) {
      return res.status(400).json({ error: "Please set up authenticator first" });
    }

    if (!verifyToken(user.totp_secret, token)) {
      return res.status(400).json({ error: "Invalid verification code. Please try again." });
    }

    const backupCodes = generateBackupCodes();
    const hashedCodes = hashBackupCodes(backupCodes);

    const { error: updateErr } = await supabase
      .from("users")
      .update({
        totp_enabled: true,
        totp_backup_codes: JSON.stringify(hashedCodes),
      })
      .eq("id", req.userId);
    if (updateErr) throw updateErr;

    const accessToken = signAccessToken(user.id, user.token_version);
    const refreshToken = signRefreshToken(user.id, user.token_version);
    await storeRefreshToken(user.id, refreshToken);

    res.json({
      message: "Authenticator enabled successfully",
      backupCodes,
      token: accessToken,
      refreshToken,
      user: userSafe(user),
    });
  } catch (err) {
    next(err);
  }
});

mfaRouter.post("/disable", requireAuth, async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Verification code required" });

    const { data: user } = await supabase
      .from("users")
      .select("totp_secret")
      .eq("id", req.userId)
      .maybeSingle();

    if (!user) return res.status(404).json({ error: "User not found" });

    if (!verifyToken(user.totp_secret, token)) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    await supabase
      .from("users")
      .update({
        totp_enabled: false,
        totp_secret: null,
        totp_backup_codes: null,
      })
      .eq("id", req.userId);

    res.json({ message: "Authenticator disabled successfully" });
  } catch (err) {
    next(err);
  }
});

mfaRouter.post("/validate", async (req, res, next) => {
  try {
    const { mfaToken, totpCode } = req.body;
    if (!mfaToken || !totpCode) {
      return res.status(400).json({ error: "MFA token and code required" });
    }

    const payload = verifyMfaTempToken(mfaToken);
    if (!payload) {
      return res.status(401).json({ error: "MFA session expired. Please log in again." });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", payload.sub)
      .maybeSingle();
    if (error) throw error;
    if (!user) return res.status(404).json({ error: "User not found" });

    let valid = false;

    if (verifyToken(user.totp_secret, totpCode)) {
      valid = true;
    } else if (user.totp_backup_codes) {
      const storedCodes = JSON.parse(user.totp_backup_codes);
      if (verifyBackupCode(totpCode, storedCodes)) {
        valid = true;
        const remaining = storedCodes.filter(
          (hash) =>
            hash !==
            crypto
              .createHash("sha256")
              .update(totpCode.replace(/-/g, "").toLowerCase())
              .digest("hex")
        );
        await supabase
          .from("users")
          .update({ totp_backup_codes: JSON.stringify(remaining) })
          .eq("id", user.id);
      }
    }

    if (!valid) {
      return res.status(401).json({ error: "Invalid verification code" });
    }

    const token = signAccessToken(user.id, user.token_version);
    const refreshToken = signRefreshToken(user.id, user.token_version);
    await storeRefreshToken(user.id, refreshToken);

    const { userSafe } = require("../lib/token");
    res.json({ token, refreshToken, user: userSafe(user) });
  } catch (err) {
    next(err);
  }
});

mfaRouter.get("/status", requireAuth, async (req, res, next) => {
  try {
    const { data: user } = await supabase
      .from("users")
      .select("totp_enabled")
      .eq("id", req.userId)
      .maybeSingle();

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ enabled: user.totp_enabled });
  } catch (err) {
    next(err);
  }
});

module.exports = { mfaRouter, signMfaTempToken, verifyMfaTempToken };
