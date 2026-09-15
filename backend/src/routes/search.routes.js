const { Router } = require("express");
const { supabase } = require("../config/db");

// Owner: CS2 (frontend consumer) / CS3 (query)

/**
 * @swagger
*  /search:
 *   get:
 *     summary: Search posts
 *     description: |
 *       Case-insensitive search over post title, body, author display name, and
 *       skill tags (`ilike`). Returns up to 20 matching posts, newest first.
 *       An empty `q` returns an empty array.
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *         description: Search query (matches title, body, author name, or skill tag)
 *         example: sql
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
    const q = String(req.query.q ?? "").trim();
    if (!q) return res.json([]);

    const select = `*, author:users!posts_author_id_fkey(id,display_name,role,karma), tags:post_tags(tag:skill_tags(*)), comments:comments(id), votes(*)`;

    // 1) Posts whose title or body match (or() supports top-level columns only)
    const { data: direct, error: directError } = await supabase
      .from("posts")
      .select(select)
      .or(`title.ilike.%${q}%,body.ilike.%${q}%`)
      .order("created_at", { ascending: false })
      .limit(20)
    if (directError) throw directError;

    // 2) Posts whose author display name matches
    const { data: authors, error: authorError } = await supabase
      .from("users")
      .select("id")
      .ilike("display_name", `%${q}%`)
    if (authorError) throw authorError;

    // 3) Posts whose skill tag matches (top-level filters only)
    const { data: tags, error: tagsError } = await supabase
      .from("skill_tags")
      .select("id")
      .ilike("name", `%${q}%`)
    if (tagsError) throw tagsError;

    const tagIds = (tags || []).map((t) => t.id);
    let tagPostIds = [];
    if (tagIds.length > 0) {
      const { data: postTags, error: postTagsError } = await supabase
        .from("post_tags")
        .select("post_id")
        .in("tag_id", tagIds)
      if (postTagsError) throw postTagsError;
      tagPostIds = (postTags || []).map((r) => r.post_id);
    }

    const authorIds = (authors || []).map((u) => u.id);

    let byAuthor = [];
    if (authorIds.length > 0) {
      const { data, error } = await supabase
        .from("posts")
        .select(select)
        .in("author_id", authorIds)
        .order("created_at", { ascending: false })
      if (error) throw error;
      byAuthor = data || [];
    }

    let byTag = [];
    if (tagPostIds.length > 0) {
      const { data, error } = await supabase
        .from("posts")
        .select(select)
        .in("id", tagPostIds)
        .order("created_at", { ascending: false })
      if (error) throw error;
      byTag = data || [];
    }

    // Merge, de-duplicate, newest first
    const byId = new Map();
    for (const p of [...direct, ...byAuthor, ...byTag]) {
      if (!byId.has(p.id)) byId.set(p.id, p);
    }
    const merged = [...byId.values()]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 20);

    res.json(merged)
  } catch (err) {
    next (err);
  }
});

module.exports = { searchRouter };
