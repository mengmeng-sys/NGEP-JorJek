const { Router } = require("express");
const { supabase } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");

const postsRouter = Router();

const USER_SAFE = "id,email,display_name,role,bio,karma,created_at";

// GET /posts -- READ list (optional ?tag= filter, pagination)

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: List posts (paginated)
 *     description: |
 *       Returns a paginated list of posts, newest first. Each post includes author, tags, and votes.
 *       Pass `?tag=<name>` to filter posts by tag name.
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *         description: Page number (1-based)
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 20 }
 *         description: Number of posts per page (max 50)
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *         description: Filter posts by skill-tag name (e.g. `JavaScript`)
 *     responses:
 *       200:
 *         description: Paginated list of posts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PostList"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
postsRouter.get("/", async (req, res, next) => {
  try {
    const { tag } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const from = (page - 1) * limit;

    let query = supabase
      .from("posts")
      .select(`*, author:users(${USER_SAFE}), tags:post_tags(tag:skill_tags(*)), votes(*)`, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    if (tag) {
      query = supabase
        .from("posts")
        .select(`*, author:users(${USER_SAFE}), tags:post_tags!inner(tag:skill_tags!inner(*)), votes(*)`, { count: "exact" })
        .eq("tags.tag.name", String(tag))
        .order("created_at", { ascending: false })
        .range(from, from + limit - 1);
    }

    const { data: posts, error, count } = await query;
    if (error) throw error;

    res.json({ posts, page, limit, total: count });
  } catch (err) {
    next(err);
  }
});

// GET /posts/:id -- READ single post (with author, tags, comments, votes)

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a single post
 *     description: Returns one post with its author, tags, comments (incl. comment authors + votes), and votes.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Post UUID
 *     responses:
 *       200:
 *         description: The requested post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Post"
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
postsRouter.get("/:id", async (req, res, next) => {
  try {
    const { data: post, error } = await supabase
      .from("posts")
      .select(
        `*, author:users(${USER_SAFE}), tags:post_tags(tag:skill_tags(*)), comments(*, author:users(${USER_SAFE}), votes(*)), votes(*)`
      )
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!post) return res.status(404).json({ error: "Post not found" });

    res.json(post);
  } catch (err) {
    next(err);
  }
});

// POST /posts -- CREATE post (with tag upsert + join)

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a post
 *     description: |
 *       Creates a new post. `type` defaults to `question`. Tag names are upserted (created if missing, by slug)
 *       and linked to the post via the join table.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, body]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [question, article, discussion]
 *                 default: question
 *                 example: question
 *               title:
 *                 type: string
 *                 example: How do I paginate in PostgreSQL?
 *               body:
 *                 type: string
 *                 example: I'm running a query that returns too many rows...
 *               tagNames:
 *                 type: array
 *                 items: { type: string }
 *                 description: Tag names to attach (case-insensitive, created on the fly)
 *                 example: ["PostgreSQL", "SQL"]
 *     responses:
 *       201:
 *         description: Post created (with author + tags)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Post"
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
postsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const { type, title, body, tagNames } = req.body;

    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({ author_id: req.userId, type: (type ?? "question").toLowerCase(), title, body })
      .select()
      .single();
    if (postError) throw postError;

    const names = tagNames || [];
    if (names.length > 0) {
      const { data: tags, error: tagsError } = await supabase
        .from("skill_tags")
        .upsert(
          names.map((name) => ({ slug: name.toLowerCase().replace(/\s+/g, "-"), name })),
          { onConflict: "slug" }
        )
        .select();
      if (tagsError) throw tagsError;

      const { error: joinError } = await supabase
        .from("post_tags")
        .insert(tags.map((tag) => ({ post_id: post.id, tag_id: tag.id })));
      if (joinError) throw joinError;
    }

    const { data: postWithTags, error: fetchError } = await supabase
      .from("posts")
      .select(`*, author:users(${USER_SAFE}), tags:post_tags(tag:skill_tags(*))`)
      .eq("id", post.id)
      .single();
    if (fetchError) throw fetchError;

    res.status(201).json(postWithTags);
  } catch (err) {
    next(err);
  }
});

// PATCH /posts/:id -- UPDATE post (author only)

/**
 * @swagger
 * /posts/{id}:
 *   patch:
 *     summary: Update a post (author only)
 *     description: Updates editable fields of the post. Only the original author can update it.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Post UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated post title
 *               body:
 *                 type: string
 *                 example: Updated body text
 *               type:
 *                 type: string
 *                 enum: [question, article, discussion]
 *                 example: article
 *     responses:
 *       200:
 *         description: Updated post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Post"
 *       400:
 *         description: No fields to update
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       403:
 *         description: You can only edit your own posts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
postsRouter.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const { data: existing, error: findError } = await supabase
      .from("posts")
      .select("id, author_id")
      .eq("id", req.params.id)
      .maybeSingle();
    if (findError) throw findError;
    if (!existing) return res.status(404).json({ error: "Post not found" });
    if (existing.author_id !== req.userId) {
      return res.status(403).json({ error: "You can only edit your own posts" });
    }

    const { title, body, type } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (body !== undefined) updates.body = body;
    if (type !== undefined) updates.type = type.toLowerCase();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const { data: post, error } = await supabase
      .from("posts")
      .update(updates)
      .eq("id", req.params.id)
      .select(`*, author:users(${USER_SAFE}), tags:post_tags(tag:skill_tags(*))`)
      .single();
    if (error) throw error;

    res.json(post);
  } catch (err) {
    next(err);
  }
});

// DELETE /posts/:id -- DELETE post (author only)

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post (author only)
 *     description: Permanently deletes a post. Only the original author can delete it.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Post UUID
 *     responses:
 *       204:
 *         description: Post deleted
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       403:
 *         description: You can only delete your own posts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
postsRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const { data: existing, error: findError } = await supabase
      .from("posts")
      .select("id, author_id")
      .eq("id", req.params.id)
      .maybeSingle();
    if (findError) throw findError;
    if (!existing) return res.status(404).json({ error: "Post not found" });
    if (existing.author_id !== req.userId) {
      return res.status(403).json({ error: "You can only delete your own posts" });
    }

    const { error } = await supabase.from("posts").delete().eq("id", req.params.id);
    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = { postsRouter };
