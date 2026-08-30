const { Router } = require("express");
const { prisma } = require("../config/db");

// Owner: CS2 (frontend consumer) / CS3 (query)
const searchRouter = Router();

searchRouter.get("/", async (req, res, next) => {
  try {
    const q = String(req.query.q ?? "");
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { body: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 20,
    });
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

module.exports = { searchRouter };
