const { Router } = require("express");
const { prisma } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");

// Owner: TN2 — task tracker #23, #38
const notificationsRouter = Router();

// Frontend polls this on an interval when NOTIFICATION_TRANSPORT=polling.
notificationsRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json(notifications);
  } catch (err) {
    next(err);
  }
});

notificationsRouter.post("/:id/read", requireAuth, async (req, res, next) => {
  try {
    await prisma.notification.update({ where: { id: req.params.id }, data: { read: true } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = { notificationsRouter };
