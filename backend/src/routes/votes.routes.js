const { Router } = require("express");
const { supabase } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");
const { recalculateKarma } = require("../services/karma.service");
const { notify } = require("../services/notification.service");

const votesRouter = Router();

// GET /vote/post/:postId -- READ all votes for a post

/**
 * @swagger
 * /vote/post/{postId}:
 *   get:
 *     summary: List votes for a post
 *     description: Returns all votes on a post (newest first) plus the computed score.
 *     tags: [Votes]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Post UUID
 *     responses:
 *       200:
 *         description: Votes + computed score
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/VoteScore"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
votesRouter.get("/vote/post/:postId", async (req, res, next) => {
  try {
    const { data: votes, error } = await supabase
      .from("votes")
      .select("*, user:users(id,display_name)")
      .eq("post_id", req.params.postId)
      .is("comment_id", null)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const score = votes.reduce((sum, v) => sum + v.value, 0);
    res.json({ votes, score });
  } catch (err) {
    next(err);
  }
});

// GET /vote/comment/:commentId -- READ all votes for a comment

/**
 * @swagger
 * /vote/comment/{commentId}:
 *   get:
 *     summary: List votes for a comment
 *     description: Returns all votes on a comment (newest first) plus the computed score.
 *     tags: [Votes]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Comment UUID
 *     responses:
 *       200:
 *         description: Votes + computed score
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/VoteScore"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
votesRouter.get("/vote/comment/:commentId", async (req, res, next) => {
  try {
    const { data: votes, error } = await supabase
      .from("votes")
      .select("*, user:users(id,display_name)")
      .eq("comment_id", req.params.commentId)
      .is("post_id", null)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const score = votes.reduce((sum, v) => sum + v.value, 0);
    res.json({ votes, score });
  } catch (err) {
    next(err);
  }
});

// GET /vote/me -- READ current user's vote on a post or comment

/**
 * @swagger
 * /vote/me:
 *   get:
 *     summary: Get my vote on a target
 *     description: |
 *       Returns the current user's vote for a post or comment. Pass exactly one of `postId` or `commentId`.
 *       Returns `null` if the user hasn't voted on the target.
 *     tags: [Votes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: postId
 *         schema: { type: string, format: uuid }
 *         description: Post UUID (mutually exclusive with `commentId`)
 *       - in: query
 *         name: commentId
 *         schema: { type: string, format: uuid }
 *         description: Comment UUID (mutually exclusive with `postId`)
 *     responses:
 *       200:
 *         description: The user's vote, or null
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: "#/components/schemas/Vote"
 *                 - type: "null"
 *       400:
 *         description: Provide postId or commentId query param
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
votesRouter.get("/vote/me", requireAuth, async (req, res, next) => {
  try {
    const { postId, commentId } = req.query;

    let query = supabase.from("votes").select("*").eq("user_id", req.userId);
    if (postId) {
      query = query.eq("post_id", postId).is("comment_id", null);
    } else if (commentId) {
      query = query.eq("comment_id", commentId).is("post_id", null);
    } else {
      return res.status(400).json({ error: "Provide postId or commentId query param" });
    }

    const { data: vote, error } = await query.maybeSingle();
    if (error) throw error;

    res.json(vote ?? null);
  } catch (err) {
    next(err);
  }
});

// POST /vote -- CREATE/UPDATE vote (upsert), triggers karma recalc + notification

/**
 * @swagger
 * /vote:
 *   post:
 *     summary: Cast or change a vote
 *     description: |
 *       Creates a vote, or updates the value if the user already voted on that target (upsert).
 *       Passing `value: "DOWN"` stores `-1`, otherwise `1`. Recalculates the target author's karma,
 *       and sends an "upvote" notification when someone else upvotes your content.
 *     tags: [Votes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [value]
 *             properties:
 *               postId:
 *                 type: string
 *                 format: uuid
 *                 description: Target post (mutually exclusive with `commentId`)
 *                 example: 9f2c7a1d-4b6e-4f88-9f19-4f3723b3e1a0
 *               commentId:
 *                 type: string
 *                 format: uuid
 *                 description: Target comment (mutually exclusive with `postId`)
 *                 example: 4f8e0c1a-9b2c-4d5e-8f67-1234567890ab
 *               value:
 *                 type: string
 *                 enum: [UP, DOWN]
 *                 description: Vote direction
 *                 example: UP
 *     responses:
 *       200:
 *         description: The created/updated vote
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Vote"
 *       400:
 *         description: Invalid request (no target specified)
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
votesRouter.post("/vote", requireAuth, async (req, res, next) => {
  try {
    const { postId, commentId, value } = req.body;
    const voteValue = value === "DOWN" ? -1 : 1;
    const isUpvote = voteValue === 1;

    const base = supabase.from("votes").select("id").eq("user_id", req.userId);
    const existingQuery = postId
      ? base.eq("post_id", postId).is("comment_id", null).maybeSingle()
      : base.eq("comment_id", commentId).is("post_id", null).maybeSingle();

    const { data: existing, error: findError } = await existingQuery;
    if (findError) throw findError;

    const voteRow = postId
      ? { user_id: req.userId, post_id: postId, comment_id: null, value: voteValue }
      : { user_id: req.userId, comment_id: commentId, post_id: null, value: voteValue };

    let vote;
    if (existing) {
      const { data, error } = await supabase
        .from("votes")
        .update({ value: voteValue })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      vote = data;
    } else {
      const { data, error } = await supabase
        .from("votes")
        .insert(voteRow)
        .select()
        .single();
      if (error) throw error;
      vote = data;
    }

    let authorId = null;

    if (postId) {
      const { data: post, error } = await supabase.from("posts").select("author_id").eq("id", postId).maybeSingle();
      if (error) throw error;
      authorId = post?.author_id ?? null;
    } else {
      const { data: comment, error } = await supabase.from("comments").select("author_id").eq("id", commentId).maybeSingle();
      if (error) throw error;
      authorId = comment?.author_id ?? null;
    }

    if (authorId) {
      await recalculateKarma(authorId);
      if (isUpvote && authorId !== req.userId) {
        await notify(authorId, "upvote", { postId, commentId });
      }
    }

    res.json(vote);
  } catch (err) {
    next(err);
  }
});

// DELETE /vote -- DELETE a vote (unvote)

/**
 * @swagger
 * /vote:
 *   delete:
 *     summary: Remove my vote (unvote)
 *     description: Deletes the current user's vote on a post or comment. Recalculates the target author's karma.
 *     tags: [Votes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *                 format: uuid
 *                 description: Target post (mutually exclusive with `commentId`)
 *               commentId:
 *                 type: string
 *                 format: uuid
 *                 description: Target comment (mutually exclusive with `postId`)
 *     responses:
 *       204:
 *         description: Vote removed
 *       400:
 *         description: Provide postId or commentId
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
votesRouter.delete("/vote", requireAuth, async (req, res, next) => {
  try {
    const { postId, commentId } = req.body;

    let query = supabase.from("votes").delete().eq("user_id", req.userId);
    if (postId) {
      query = query.eq("post_id", postId).is("comment_id", null);
    } else if (commentId) {
      query = query.eq("comment_id", commentId).is("post_id", null);
    } else {
      return res.status(400).json({ error: "Provide postId or commentId" });
    }

    const { error } = await query;
    if (error) throw error;

    // Recalculate karma for the author
    let authorId = null;
    if (postId) {
      const { data: post } = await supabase.from("posts").select("author_id").eq("id", postId).maybeSingle();
      authorId = post?.author_id ?? null;
    } else {
      const { data: comment } = await supabase.from("comments").select("author_id").eq("id", commentId).maybeSingle();
      authorId = comment?.author_id ?? null;
    }
    if (authorId) await recalculateKarma(authorId);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = { votesRouter };
