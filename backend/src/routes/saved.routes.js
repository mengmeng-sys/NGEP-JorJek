const { Router } = require("express");
const { supabase } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");

const savedRouter = Router();

const USER_SAFE = "id,email,display_name,role,bio,karma,created_at";

// GET /saved -- READ the current user's saved posts

/**
 * @swagger
 * /saved:
 *   get:
 *     summary: List the current user's saved posts
 *     description: Returns the posts the authenticated user saved, newest saves first.
 *     tags: [Saved]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Paginated list of saved posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Post"
 *                 total:
 *                   type: integer
 *       401:
 *         description: Missing or invalid token
 */
savedRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 50));
    const from = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from("saved_posts")
      .select("post:posts!saved_posts_post_id_fkey(*, author:users!posts_author_id_fkey(*), tags:post_tags(tag:skill_tags(*)), comments:comments(id), votes(*), saved_posts:saved_posts(post_id)), created_at", { count: "exact" })
      .eq("user_id", req.userId)
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);
    if (error) throw error;

    const posts = (data || []).map((row) => ({
      ...row.post,
      isSaved: true,
      saved_at: row.created_at,
    }));

    res.json({ posts, page, limit, total: count ?? 0 });
  } catch (err) {
    next(err);
  }
});

// GET /saved/count -- READ how many posts the current user has saved

/**
 * @swagger
 * /saved/count:
 *   get:
 *     summary: Count the current user's saved posts
 *     description: Lightweight count used for sidebar badges.
 *     tags: [Saved]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saved count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *       401:
 *         description: Missing or invalid token
 */
savedRouter.get("/count", requireAuth, async (req, res, next) => {
  try {
    const { count, error } = await supabase
      .from("saved_posts")
      .select("user_id", { count: "exact", head: true })
      .eq("user_id", req.userId);
    if (error) throw error;
    res.json({ count: count ?? 0 });
  } catch (err) {
    next(err);
  }
});

module.exports = { savedRouter };
