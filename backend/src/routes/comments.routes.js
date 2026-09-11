const { Router } = require("express");
const { supabase } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");
const { notify } = require("../services/notification.service");

const commentsRouter = Router();

const USER_SAFE = "id,email,display_name,role,bio,karma,created_at";

// GET /posts/:postId/comments -- READ all comments for a post

/**
 * @swagger
 * /posts/{postId}/comments:
 *   get:
 *     summary: List comments for a post
 *     description: Returns a paginated list of comments for a post, oldest first. Each includes author + votes.
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Post UUID
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *         description: Page number (1-based)
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 20 }
 *         description: Number of comments per page (max 50)
 *     responses:
 *       200:
 *         description: Paginated list of comments
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CommentList"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
commentsRouter.get("/posts/:postId/comments", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const from = (page - 1) * limit;

    const { data: comments, error, count } = await supabase
      .from("comments")
      .select(`*, author:users(${USER_SAFE}), votes(*)`, { count: "exact" })
      .eq("post_id", req.params.postId)
      .order("created_at", { ascending: true })
      .range(from, from + limit - 1);
    if (error) throw error;

    res.json({ comments, page, limit, total: count });
  } catch (err) {
    next(err);
  }
});

// GET /comments/:id -- READ single comment

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get a single comment
 *     description: Returns one comment with its author and votes.
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Comment UUID
 *     responses:
 *       200:
 *         description: The requested comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Comment"
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
commentsRouter.get("/comments/:id", async (req, res, next) => {
  try {
    const { data: comment, error } = await supabase
      .from("comments")
      .select(`*, author:users(${USER_SAFE}), votes(*)`)
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    res.json(comment);
  } catch (err) {
    next(err);
  }
});

// POST /posts/:postId/comments -- CREATE comment (with notification)

/**
 * @swagger
 * /posts/{postId}/comments:
 *   post:
 *     summary: Create a comment on a post
 *     description: |
 *       Adds a comment to the post. Pass `parentId` to reply to an existing comment.
 *       If the post author is not the commenter, a "reply" notification is sent to the post author.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Post UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [body]
 *             properties:
 *               body:
 *                 type: string
 *                 example: Great explanation, thanks!
 *               parentId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the comment being replied to (for nested replies)
 *                 example: 4f8e0c1a-9b2c-4d5e-8f67-1234567890ab
 *     responses:
 *       201:
 *         description: Comment created (with author)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Comment"
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
commentsRouter.post("/posts/:postId/comments", requireAuth, async (req, res, next) => {
  try {
    const { body, parentId } = req.body;

    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .insert({
        post_id: req.params.postId,
        author_id: req.userId,
        body,
        parent_comment_id: parentId ?? null,
      })
      .select(`*, author:users(${USER_SAFE})`)
      .single();
    if (commentError) throw commentError;

    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, author_id")
      .eq("id", req.params.postId)
      .maybeSingle();
    if (postError) throw postError;

    if (post && post.author_id !== req.userId) {
      await notify(post.author_id, "reply", { postId: post.id, commentId: comment.id });
    }
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

// PATCH /comments/:id -- UPDATE comment (author only)

/**
 * @swagger
 * /comments/{id}:
 *   patch:
 *     summary: Update a comment (author only)
 *     description: Updates the body of a comment. Only the original author can edit it.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Comment UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [body]
 *             properties:
 *               body:
 *                 type: string
 *                 example: Updated comment text
 *     responses:
 *       200:
 *         description: Updated comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Comment"
 *       400:
 *         description: body is required
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
 *         description: You can only edit your own comments
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
commentsRouter.patch("/comments/:id", requireAuth, async (req, res, next) => {
  try {
    const { data: existing, error: findError } = await supabase
      .from("comments")
      .select("id, author_id")
      .eq("id", req.params.id)
      .maybeSingle();
    if (findError) throw findError;
    if (!existing) return res.status(404).json({ error: "Comment not found" });
    if (existing.author_id !== req.userId) {
      return res.status(403).json({ error: "You can only edit your own comments" });
    }

    const { body } = req.body;
    if (!body) return res.status(400).json({ error: "body is required" });

    const { data: comment, error } = await supabase
      .from("comments")
      .update({ body })
      .eq("id", req.params.id)
      .select(`*, author:users(${USER_SAFE})`)
      .single();
    if (error) throw error;

    res.json(comment);
  } catch (err) {
    next(err);
  }
});

// DELETE /comments/:id -- DELETE comment (author only)

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment (author only)
 *     description: Permanently deletes a comment. Only the original author can delete it.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Comment UUID
 *     responses:
 *       204:
 *         description: Comment deleted
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       403:
 *         description: You can only delete your own comments
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
commentsRouter.delete("/comments/:id", requireAuth, async (req, res, next) => {
  try {
    const { data: existing, error: findError } = await supabase
      .from("comments")
      .select("id, author_id")
      .eq("id", req.params.id)
      .maybeSingle();
    if (findError) throw findError;
    if (!existing) return res.status(404).json({ error: "Comment not found" });
    if (existing.author_id !== req.userId) {
      return res.status(403).json({ error: "You can only delete your own comments" });
    }

    const { error } = await supabase.from("comments").delete().eq("id", req.params.id);
    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = { commentsRouter };
