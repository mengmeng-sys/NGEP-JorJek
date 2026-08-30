const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/db");
const { env } = require("../config/env");
const { requireCadtEmail } = require("../middleware/cadtEmailGate.middleware");

// Owner: TN1 — task tracker #7, #15
const authRouter = Router();

authRouter.post("/signup", requireCadtEmail, async (req, res, next) => {
  try {
    const { cadtEmail, password, displayName, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { cadtEmail, passwordHash, displayName, role: role ?? "STUDENT" },
    });
    const token = jwt.sign({ sub: user.id }, env.jwtSecret, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user.id, displayName: user.displayName, role: user.role } });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { cadtEmail, password } = req.body;
    const user = await prisma.user.findUnique({ where: { cadtEmail } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ sub: user.id }, env.jwtSecret, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, displayName: user.displayName, role: user.role } });
  } catch (err) {
    next(err);
  }
});

module.exports = { authRouter };
