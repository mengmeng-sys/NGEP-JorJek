const { Router } = require("express");
const { prisma } = require("../config/db");

// Owner: CS3
const usersRouter = Router();

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
