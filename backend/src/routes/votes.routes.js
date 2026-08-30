const { Router } = require("express");
const { prisma } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");
const { recalculateKarma } = require("../services/karma.service");
const { notify } = require("../services/notification.service");

// Owner: CS3 + TN2
const votesRouter = Router();

votesRouter.post("/vote", requireAuth, async (req, res, next) => {
  try {
    const { postId, commentId, value } = req.body;

    const vote = await prisma.vote.upsert({
      where: postId
        ? { userId_postId: { userId: req.userId, postId } }
        : { userId_commentId: { userId: req.userId, commentId } },
      update: { value },
      create: { userId: req.userId, postId, commentId, value },
    });

    const authorId = postId
      ? (await prisma.post.findUnique({ where: { id: postId } }))?.authorId
      : (await prisma.comment.findUnique({ where: { id: commentId } }))?.authorId;

    if (authorId) {
      await recalculateKarma(authorId);
      if (value === "UP" && authorId !== req.userId) {
        await notify(authorId, "upvote", { postId, commentId });
      }
    }

    res.json(vote);
  } catch (err) {
    next(err);
  }
});

module.exports = { votesRouter };
