const { Router } = require("express");
const { supabase } = require("../config/db");
const { requireAuth, optionalAuth } = require("../middleware/auth.middleware");
const { requireVerifiedEmail } = require("../middleware/verifiedEmail.middleware");
const { getIO } = require("../lib/socket");

const postsRouter = Router();

const USER_SAFE = "id,email,display_name,role,bio,avatar_url,karma,created_at";

// The posts.allow_mentoring column is introduced by a migration. The app
// gracefully supports running before that migration exists: we detect the
// column on each write and only persist the flag when the column is actually
// present, so post creation/update never 400s on a missing column.
async function canStoreAllowMentoring() {
  const { error } = await supabase.from("posts").select("allow_mentoring").limit(1);
  return !error;
}

// Same pattern for posts.image_url — added by a migration that may not have
// run yet on every environment, so we detect it rather than assume it exists.
async function canStoreImageUrl() {
  const { error } = await supabase.from("posts").select("image_url").limit(1);
  return !error;
}

// Fetch the set of post ids the current user has saved (empty when anonymous).
async function savedIdsFor(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("saved_posts")
    .select("post_id")
    .eq("user_id", userId);
  if (error) throw error;
  return data ? data.map((row) => row.post_id) : [];
}

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
postsRouter.get("/", optionalAuth, async (req, res, next) => {
  try {
    const { tag } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const from = (page - 1) * limit;

    let query = supabase
      .from("posts")
      .select(`*, author:users!posts_author_id_fkey(${USER_SAFE}), tags:post_tags(tag:skill_tags(*)), comments:comments(id), votes(*), saved_posts:saved_posts(post_id)`, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    if (tag) {
      query = supabase
        .from("posts")
        .select(`*, author:users!posts_author_id_fkey(${USER_SAFE}), tags:post_tags!inner(tag:skill_tags!inner(*)), comments:comments(id), votes(*), saved_posts:saved_posts(post_id)`, { count: "exact" })
        .eq("tags.tag.name", String(tag))
        .order("created_at", { ascending: false })
        .range(from, from + limit - 1);
    }

    const { data: posts, error, count } = await query;
    if (error) throw error;

    const saved = await savedIdsFor(req.userId);
    res.json({
      posts: posts.map((p) => ({ ...p, isSaved: saved.includes(p.id) })),
      page,
      limit,
      total: count,
    });
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
postsRouter.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const { data: post, error } = await supabase
      .from("posts")
      .select(
        `*, author:users!posts_author_id_fkey(${USER_SAFE}), tags:post_tags(tag:skill_tags(*)), comments(*, author:users(${USER_SAFE}), votes(*)), votes(*), saved_posts:saved_posts(post_id)`
      )
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!post) return res.status(404).json({ error: "Post not found" });

    const saved = await savedIdsFor(req.userId);
    res.json({ ...post, isSaved: saved.includes(post.id) });
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
postsRouter.post("/", requireAuth, requireVerifiedEmail, async (req, res, next) => {
  try {
    const { type, title, body, tagNames, allowMentoring, image_url: imageUrl } = req.body;

    const insertPayload = {
      author_id: req.userId,
      type: (type ?? "question").toLowerCase(),
      title,
      body,
    };
    if (req.body.allowMentoring !== undefined && (await canStoreAllowMentoring())) {
      insertPayload.allow_mentoring = Boolean(allowMentoring);
    }
    if (imageUrl !== undefined && (await canStoreImageUrl())) {
      insertPayload.image_url = imageUrl || null;
    }

    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert(insertPayload)
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
      .select(`*, author:users!posts_author_id_fkey(${USER_SAFE}), tags:post_tags(tag:skill_tags(*)), comments:comments(id), votes(*), saved_posts:saved_posts(post_id)`)
      .eq("id", post.id)
      .single();
    if (fetchError) throw fetchError;

    const io = getIO();
    if (io) {
      io.emit("new_post", postWithTags);
    }

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
postsRouter.patch("/:id", requireAuth, requireVerifiedEmail, async (req, res, next) => {
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

    const { title, body, type, tagNames, allowMentoring, image_url: imageUrl } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (body !== undefined) updates.body = body;
    if (type !== undefined) updates.type = type.toLowerCase();
    if (req.body.allowMentoring !== undefined && (await canStoreAllowMentoring())) {
      updates.allow_mentoring = Boolean(allowMentoring);
    }
    if (imageUrl !== undefined && (await canStoreImageUrl())) {
      updates.image_url = imageUrl || null;
    }

    if (Object.keys(updates).length === 0 && tagNames === undefined) {
      return res.status(400).json({ error: "No fields to update" });
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from("posts")
        .update(updates)
        .eq("id", req.params.id)
        .select("id");
      if (error) throw error;
    }

    if (Array.isArray(tagNames)) {
      const names = tagNames.map((n) => String(n).trim().replace(/^#/, "")).filter(Boolean);
      await supabase.from("post_tags").delete().eq("post_id", req.params.id);
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
          .insert(tags.map((tag) => ({ post_id: req.params.id, tag_id: tag.id })));
        if (joinError) throw joinError;
      }
    }

    const { data: post, error } = await supabase
      .from("posts")
      .select(`*, author:users!posts_author_id_fkey(${USER_SAFE}), tags:post_tags(tag:skill_tags(*)), comments:comments(id), votes(*)`)
      .eq("id", req.params.id)
      .single();
    if (error) throw error;

    const io = getIO();
    if (io) {
      io.emit("post_updated", post);
    }

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
postsRouter.delete("/:id", requireAuth, requireVerifiedEmail, async (req, res, next) => {
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

    const io = getIO();
    if (io) {
      io.emit("post_deleted", { id: req.params.id });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST /posts/:id/save -- SAVE a post to the current user's bookmarks

/**
 * @swagger
 * /posts/{id}/save:
 *   post:
 *     summary: Save a post to bookmarks
 *     description: Adds the post to the current user's saved list (idempotent upsert).
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
 *         description: Post saved
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Email not verified
 *       404:
 *         description: Post not found
 */
postsRouter.post("/:id/save", requireAuth, requireVerifiedEmail, async (req, res, next) => {
  try {
    const { data: post } = await supabase
      .from("posts")
      .select("id")
      .eq("id", req.params.id)
      .maybeSingle();
    if (!post) return res.status(404).json({ error: "Post not found" });

    const { error } = await supabase
      .from("saved_posts")
      .upsert({ user_id: req.userId, post_id: post.id }, { onConflict: "user_id, post_id" });
    if (error) throw error;

    const { count } = await supabase
      .from("saved_posts")
      .select("id", { count: "exact", head: true })
      .eq("post_id", post.id);

    const io = getIO();
    if (io) {
      io.to(`post:${post.id}`).emit("save_update", { postId: post.id, saves: count ?? 0, saved: true });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// DELETE /posts/:id/save -- UN-SAVE a post from the current user's bookmarks

/**
 * @swagger
 * /posts/{id}/save:
 *   delete:
 *     summary: Remove a post from bookmarks
 *     description: Removes the post from the current user's saved list (idempotent).
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
 *         description: Post removed from bookmarks
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Email not verified
 */
postsRouter.delete("/:id/save", requireAuth, requireVerifiedEmail, async (req, res, next) => {
  try {
    const { error } = await supabase
      .from("saved_posts")
      .delete()
      .eq("user_id", req.userId)
      .eq("post_id", req.params.id);
    if (error) throw error;

    const { count } = await supabase
      .from("saved_posts")
      .select("id", { count: "exact", head: true })
      .eq("post_id", req.params.id);

    const io = getIO();
    if (io) {
      io.to(`post:${req.params.id}`).emit("save_update", { postId: req.params.id, saves: count ?? 0, saved: false });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = { postsRouter };
