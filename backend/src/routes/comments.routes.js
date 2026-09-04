const { Router } = require("express");
const { supabase } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");
const { notify } = require("../services/notification.service");

// Owner: CS3 + TN2
const commentsRouter = Router();

commentsRouter.post("/posts/:postId/comments", requireAuth, async (req, res, next) => {
  try {
    const { body, parentId } = req.body;

    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .insert({
        post_id: req.params.postId,
        author_id: req.userId,
        body,
        parent_id: parentId ?? null,
      })
      .select("*, users(*)")
      .single();
    if (commentError) throw commentError;

    const { data: post, error, postError } = await supabase
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

module.exports = { commentsRouter };
