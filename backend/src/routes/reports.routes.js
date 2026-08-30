const { Router } = require("express");
const { prisma } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");

// Owner: TN1. Satisfies the DMIL Security & Safety competency — see
// JorJek_Project_Scope.pdf, Section 2. No moderation queue/admin UI yet
// (explicitly out of scope); this just records the report.
const reportsRouter = Router();

reportsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const { postId, commentId, targetUserId, reason } = req.body;
    const report = await prisma.report.create({
      data: { reporterId: req.userId, postId, commentId, targetUserId, reason },
    });
    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
});

module.exports = { reportsRouter };
