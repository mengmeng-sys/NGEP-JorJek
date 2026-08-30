const { Router } = require("express");
const { prisma } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");
const { notify } = require("../services/notification.service");

// Owner: CS3 + TN2
const commentsRouter = Router();

commentsRouter.post("/posts/:postId/comments", requireAuth, async (req, res, next) => {
  try {
    const { body, parentId } = req.body;
    const comment = await prisma.comment.create({
      data: { postId: req.params.postId, authorId: req.userId, body, parentId },
      include: { author: true },
    });

    const post = await prisma.post.findUnique({ where: { id: req.params.postId } });
    if (post && post.authorId !== req.userId) {
      await notify(post.authorId, "reply", { postId: post.id, commentId: comment.id });
    }

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

module.exports = { commentsRouter };
