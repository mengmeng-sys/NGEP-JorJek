const { Router } = require("express");
const { supabase } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");

const tagsRouter = Router();

// GET /tags -- READ all skill tags (paginated)

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: List skill tags (paginated)
 *     description: Returns a paginated list of skill tags sorted alphabetically by name.
 *     tags: [Tags]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *         description: Page number (1-based)
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 50 }
 *         description: Number of tags per page (max 100)
 *     responses:
 *       200:
 *         description: Paginated list of tags
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tags:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Tag"
 *                 page: { type: integer, example: 1 }
 *                 limit: { type: integer, example: 50 }
 *                 total: { type: integer, example: 30 }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
tagsRouter.get("/", async (_req, res, next) => {
  try {
    const page = Math.max(1, Number(_req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(_req.query.limit) || 50));
    const from = (page - 1) * limit;

    const { data: tags, error, count } = await supabase
      .from("skill_tags")
      .select("*", { count: "exact" })
      .order("name", { ascending: true })
      .range(from, from + limit - 1);
    if (error) throw error;

    res.json({ tags, page, limit, total: count });
  } catch (err) {
    next(err);
  }
});

// GET /tags/:id -- READ single tag with follower count

/**
 * @swagger
 * /tags/{id}:
 *   get:
 *     summary: Get a single tag
 *     description: Returns a tag with its computed `followerCount`.
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Tag UUID
 *     responses:
 *       200:
 *         description: The requested tag
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/Tag"
 *                 - type: object
 *                   properties:
 *                     followerCount:
 *                       type: integer
 *                       example: 12
 *       404:
 *         description: Tag not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
tagsRouter.get("/:id", async (req, res, next) => {
  try {
    const { data: tag, error } = await supabase
      .from("skill_tags")
      .select("*, followers:tag_follows(user_id)")
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!tag) return res.status(404).json({ error: "Tag not found" });

    const { count: followerCount } = await supabase
      .from("tag_follows")
      .select("user_id", { count: "exact", head: true })
      .eq("tag_id", req.params.id);

    res.json({ ...tag, followerCount: followerCount ?? 0, followers: undefined });
  } catch (err) {
    next(err);
  }
});

// GET /tags/:id/followers -- READ followers of a tag

/**
 * @swagger
 * /tags/{id}/followers:
 *   get:
 *     summary: List followers of a tag
 *     description: Returns the users following a tag (id, display name, role, karma).
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Tag UUID
 *     responses:
 *       200:
 *         description: Array of follower users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string, format: uuid }
 *                   display_name: { type: string, example: "Dara Chan" }
 *                   role: { type: string, enum: [STUDENT, MENTOR, ADMIN] }
 *                   karma: { type: integer, example: 42 }
 */
tagsRouter.get("/:id/followers", async (req, res, next) => {
  try {
    const { data: followers, error } = await supabase
      .from("tag_follows")
      .select("user:users(id,display_name,role,karma)")
      .eq("tag_id", req.params.id);
    if (error) throw error;

    res.json(followers.map((f) => f.user));
  } catch (err) {
    next(err);
  }
});

// GET /tags/:id/posts -- READ posts with this tag

/**
 * @swagger
 * /tags/{id}/posts:
 *   get:
 *     summary: List posts with a tag
 *     description: Returns the posts tagged with the given tag (via the join table), with author + votes. Returns an empty array if no posts.
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Tag UUID
 *     responses:
 *       200:
 *         description: Array of tagged posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Post"
 *       404:
 *         description: Tag not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
tagsRouter.get("/:id/posts", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const from = (page - 1) * limit;

    const { data: tag, error: tagError } = await supabase
      .from("skill_tags")
      .select("id")
      .eq("id", req.params.id)
      .maybeSingle();
    if (tagError) throw tagError;
    if (!tag) return res.status(404).json({ error: "Tag not found" });

    const { data: posts, error } = await supabase
      .from("posts")
      .select(`*, author:users(id,display_name,role,karma)`)
      .in("id", supabase.rpc ? [] : [])
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    // Use join table to find posts with this tag
    const { data: postTags, error: ptError } = await supabase
      .from("post_tags")
      .select("post_id")
      .eq("tag_id", req.params.id)
      .range(from, from + limit - 1);
    if (ptError) throw ptError;

    if (!postTags || postTags.length === 0) return res.json([]);

    const postIds = postTags.map((pt) => pt.post_id);
    const { data: tagPosts, error: postsError } = await supabase
      .from("posts")
      .select(`*, author:users(id,display_name,role,karma), votes(*)`)
      .in("id", postIds)
      .order("created_at", { ascending: false });
    if (postsError) throw postsError;

    res.json(tagPosts);
  } catch (err) {
    next(err);
  }
});

// POST /tags -- CREATE a new tag

/**
 * @swagger
 * /tags:
 *   post:
 *     summary: Create a skill tag
 *     description: Creates a tag by name. Upserts by slug, so requesting an existing tag returns it.
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: PostgreSQL
 *     responses:
 *       201:
 *         description: Tag created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Tag"
 *       400:
 *         description: name is required
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
tagsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    const slug = name.toLowerCase().replace(/\s+/g, "-");

    const { data: tag, error } = await supabase
      .from("skill_tags")
      .upsert({ slug, name }, { onConflict: "slug" })
      .select()
      .single();
    if (error) throw error;

    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
});

// PATCH /tags/:id -- UPDATE tag name (admin only)

/**
 * @swagger
 * /tags/{id}:
 *   patch:
 *     summary: Update a tag (admin only)
 *     description: Updates a tag's name and slug (role-based auth is not enforced in the current implementation).
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Tag UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: PostgreSQL 16
 *     responses:
 *       200:
 *         description: Updated tag
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Tag"
 *       400:
 *         description: name is required
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
tagsRouter.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    const slug = name.toLowerCase().replace(/\s+/g, "-");

    const { data: tag, error } = await supabase
      .from("skill_tags")
      .update({ name, slug })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;

    res.json(tag);
  } catch (err) {
    next(err);
  }
});

// DELETE /tags/:id -- DELETE a tag (admin only)

/**
 * @swagger
 * /tags/{id}:
 *   delete:
 *     summary: Delete a tag (admin only)
 *     description: Permanently deletes a tag (role-based auth is not enforced in the current implementation).
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Tag UUID
 *     responses:
 *       204:
 *         description: Tag deleted
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
tagsRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const { error } = await supabase.from("skill_tags").delete().eq("id", req.params.id);
    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST /tags/:tagName/follow -- CREATE follow relationship (upsert)

/**
 * @swagger
 * /tags/{tagName}/follow:
 *   post:
 *     summary: Follow a tag
 *     description: |
 *       Creates a follow relationship between the current user and a tag. The tag is upserted by slug,
 *       so following by name also creates the tag if it doesn't exist yet.
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagName
 *         required: true
 *         schema: { type: string }
 *         description: Tag name (case-insensitive) — e.g. `javascript`
 *     responses:
 *       204:
 *         description: Tag followed
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
tagsRouter.post("/:tagName/follow", requireAuth, async (req, res, next) => {
  try {
    const { data: tag, error: tagError } = await supabase
      .from("skill_tags")
      .upsert(
        { slug: req.params.tagName.toLowerCase().replace(/\s+/g, "-"), name: req.params.tagName },
        { onConflict: "slug" }
      )
      .select()
      .single();
    if (tagError) throw tagError;

    const { error: followError } = await supabase
      .from("tag_follows")
      .upsert({ user_id: req.userId, tag_id: tag.id }, { onConflict: "user_id, tag_id" });
    if (followError) throw followError;

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// DELETE /tags/:tagName/unfollow -- DELETE follow relationship

/**
 * @swagger
 * /tags/{tagName}/unfollow:
 *   delete:
 *     summary: Unfollow a tag
 *     description: Removes the current user's follow relationship with a tag.
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagName
 *         required: true
 *         schema: { type: string }
 *         description: Tag name (case-insensitive) — e.g. `javascript`
 *     responses:
 *       204:
 *         description: Tag unfollowed
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       404:
 *         description: Tag not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
tagsRouter.delete("/:tagName/unfollow", requireAuth, async (req, res, next) => {
  try {
    const { data: tag, error: tagError } = await supabase
      .from("skill_tags")
      .select("id")
      .eq("slug", req.params.tagName.toLowerCase().replace(/\s+/g, "-"))
      .maybeSingle();
    if (tagError) throw tagError;
    if (!tag) return res.status(404).json({ error: "Tag not found" });

    const { error } = await supabase
      .from("tag_follows")
      .delete()
      .eq("user_id", req.userId)
      .eq("tag_id", tag.id);
    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = { tagsRouter };
