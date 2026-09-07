const { Router } = require("express");
const { prisma } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");

// Owner: CS3
const usersRouter = Router();

// Current session user — role/status drive the Admin Dashboard RBAC guard.
usersRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, cadtEmail: true, displayName: true, role: true, status: true, karma: true, isMentor: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

usersRouter.get("/top-mentors", async (_req, res, next) => {
  try {
    const topMentors = await prisma.user.findMany({
      orderBy: { karma: "desc" },
      take: 10,
      select: { id: true, displayName: true, role: true, karma: true },
    });
    res.json(topMentors);
  } catch (err) {
    next(err);
  }
});

usersRouter.get("/:id", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, displayName: true, role: true, karma: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = { usersRouter };
