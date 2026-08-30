const { Router } = require("express");
const { prisma } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");

// Owner: CS3 (schema/data) + TN2
const postsRouter = Router();

postsRouter.get("/", async (req, res, next) => {
  try {
    const { tag } = req.query;
    const posts = await prisma.post.findMany({
      where: tag ? { tags: { some: { tag: { name: String(tag) } } } } : undefined,
      include: { author: true, tags: { include: { tag: true } }, votes: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

postsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const { type, title, body, tagNames } = req.body;

    const post = await prisma.post.create({
      data: {
        authorId: req.userId,
        type,
        title,
        body,
        tags: {
          create: (tagNames || []).map((name) => ({
            tag: { connectOrCreate: { where: { name }, create: { name } } },
          })),
        },
      },
      include: { tags: { include: { tag: true } } },
    });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
});

postsRouter.get("/:id", async (req, res, next) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        author: true,
        tags: { include: { tag: true } },
        comments: { include: { author: true, votes: true } },
        votes: true,
      },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

module.exports = { postsRouter };
