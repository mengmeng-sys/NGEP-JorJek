const { Router } = require("express");
const { supabase } = require("../config/db");

// Owner: CS2 (frontend consumer) / CS3 (query)

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search posts
 *     description: |
 *       Case-insensitive search over post title and body (`ilike`). Returns up to 20 matching posts, newest first.
 *       An empty `q` returns an empty array.
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *         description: Search query (matches against post title or body)
 *         example: react
 *     responses:
 *       200:
 *         description: Array of matching posts (raw post rows, no joins)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Post"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
const searchRouter = Router();

searchRouter.get("/", async (req, res, next) => {
  try {
    const q = String(req.query.q ?? "");
    
    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .or(`title.ilike.%${q}%,body.ilike.%${q}%`)
      .limit(20)

    if (error) throw error;

    res.json(posts)
  } catch (err) {
    next (err);
  }
});

module.exports = { searchRouter };
