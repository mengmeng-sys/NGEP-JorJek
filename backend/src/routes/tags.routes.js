const { Router } = require("express");
const { prisma } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");

// Owner: CS3
const tagsRouter = Router();

tagsRouter.get("/", async (_req, res, next) => {
  try {
    res.json(await prisma.tag.findMany());
  } catch (err) {
    next(err);
  }
});

tagsRouter.post("/:tagName/follow", requireAuth, async (req, res, next) => {
  try {
    const tag = await prisma.tag.upsert({
      where: { name: req.params.tagName },
      update: {},
      create: { name: req.params.tagName },
    });
    await prisma.tagFollow.upsert({
      where: { userId_tagId: { userId: req.userId, tagId: tag.id } },
      update: {},
      create: { userId: req.userId, tagId: tag.id },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = { tagsRouter };
