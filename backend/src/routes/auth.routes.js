const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { supabase } = require("../config/db");
const { env } = require("../config/env");
const { requireCadtEmail } = require("../middleware/cadtEmailGate.middleware");

// Owner: TN1 — task tracker #7, #15
const authRouter = Router();

authRouter.post("/signup", requireCadtEmail, async (req, res, next) => {
  try {
    const { cadtEmail, password, displayName, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const { data: user, error } = await supabase
      .from("users")
      .insert({ cadt_email: cadtEmail, password_hash: passwordHash, display_name: displayName, role: role ?? "STUDENT" })
      .select()
      .single()
    if (error) throw error;

    const token = jwt.sign({ sub: user.id }, env.jwtSecret, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user.id, displayName: user.display_name, role: user.role } });
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
      .eq("cadt_email", cadtEmail)
      .maybeSingle();
    if (erro) throw error;
    if(!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ sub: user.id }, env.jwtSecret, { expiresIn: "7d0" });
    res.json({ token, user: { id: user.id, displayName: user.display_name, role: user.role } });
  } catch (err) {
    next(err);
  }
});

module.exports = { authRouter };
