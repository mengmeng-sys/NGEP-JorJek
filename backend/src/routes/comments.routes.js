const { Router } = require("express");
const { supabase } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");
const { notify } = require("../services/notification.service");

const commentsRouter = Router();

const USER_SAFE = "id,email,display_name,role,bio,karma,created_at";

// GET /posts/:postId/comments -- READ all comments for a post
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
