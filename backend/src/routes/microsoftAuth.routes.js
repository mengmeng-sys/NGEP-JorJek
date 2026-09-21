const { Router } = require("express");
const bcrypt = require("bcryptjs");
const { supabase } = require("../config/db");
const { env } = require("../config/env");
const { validateMicrosoftIdToken } = require("../config/microsoft");
const { signAccessToken, signRefreshToken, userSafe } = require("../lib/token");

const router = Router();

function isCadtEmail(email) {
  const normalized = email.toLowerCase();
  return env.cadtEmailDomains.some((d) => normalized.endsWith(d));
}

router.post("/check", async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: "Microsoft authentication required" });

    let ms;
    try {
      ms = await validateMicrosoftIdToken(idToken);
    } catch {
      return res.status(401).json({ error: "Microsoft authentication failed" });
    }

    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", ms.email)
      .maybeSingle();

    res.json({ exists: !!user, email: ms.email });
  } catch (err) {
    next(err);
  }
});

router.post("/signup", async (req, res, next) => {
  try {
    const { idToken, displayName, password, role, gen, department, specialization } = req.body;
    if (!idToken) return res.status(400).json({ error: "Microsoft authentication required" });
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    let ms;
    try {
      ms = await validateMicrosoftIdToken(idToken);
    } catch {
      return res.status(401).json({ error: "Microsoft authentication failed — please try again" });
    }

    if (!isCadtEmail(ms.email)) {
      return res.status(400).json({ error: `A valid CADT email (${env.cadtEmailDomains.join(" or ")}) is required` });
    }

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", ms.email)
      .maybeSingle();
    if (existing) return res.status(409).json({ error: "An account with this email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        email: ms.email,
        password_hash: passwordHash,
        display_name: displayName,
        role: role ?? "STUDENT",
        gen: gen ?? null,
        department: department ?? null,
        specialization: specialization ?? null,
        email_verified: true,
      })
      .select()
      .single();
    if (error) throw error;

    const token = signAccessToken(user.id, user.token_version);
    const refreshToken = signRefreshToken(user.id, user.token_version);
    res.status(201).json({ token, refreshToken, user: userSafe(user) });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: "Microsoft authentication required" });

    let ms;
    try {
      ms = await validateMicrosoftIdToken(idToken);
    } catch {
      return res.status(401).json({ error: "Microsoft authentication failed — please try again" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", ms.email)
      .maybeSingle();
    if (error) throw error;
    if (!user) return res.status(404).json({ error: "No account found — please sign up first" });

    const token = signAccessToken(user.id, user.token_version);
    const refreshToken = signRefreshToken(user.id, user.token_version);
    res.json({ token, refreshToken, user: userSafe(user) });
  } catch (err) {
    next(err);
  }
});

router.post("/reset-password", async (req, res, next) => {
  try {
    const { idToken, newPassword } = req.body;
    if (!idToken) return res.status(400).json({ error: "Microsoft authentication required" });
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ error: "Password must contain at least one uppercase letter" });
    }
    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({ error: "Password must contain at least one number" });
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      return res.status(400).json({ error: "Password must contain at least one special character" });
    }

    let ms;
    try {
      ms = await validateMicrosoftIdToken(idToken);
    } catch {
      return res.status(401).json({ error: "Microsoft authentication failed — please try again" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, token_version")
      .eq("email", ms.email)
      .maybeSingle();
    if (error) throw error;
    if (!user) return res.status(404).json({ error: "No account found" });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: passwordHash, token_version: (user.token_version ?? 0) + 1 })
      .eq("id", user.id);
    if (updateError) throw updateError;

    res.json({ message: "Password reset successfully — please log in" });
  } catch (err) {
    next(err);
  }
});

module.exports = { microsoftAuthRouter: router };
