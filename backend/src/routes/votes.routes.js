const { Router } = require("express");
const { supabase } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");
const { recalculateKarma } = require("../services/karma.service");
const { notify } = require("../services/notification.service");

// Owner: CS3 + TN2
const votesRouter = Router();

votesRouter.post("/vote", requireAuth, async (req, res, next) => {
  try {
    const { postId, commentId, value } = req.body;

    const { data: vote, error: voteError } = postId
      ? await supabase
        .from("votes")
        .upsert(
          { user_id: req.userId, post_id: postId, comment_id: null, value },
          { onConflict: "user_id, post_id"}
        )
        .select()
        .single()
      : await supabase
        .from("votes")
        .upsert(
          { user_id: req.userId, comment_id: commentId, post_id: null, value },
          { onConflict: "user_id, comment_id" }
        )
        .select()
        .single();
      if (voteError) throw voteError;

      let authorId = null;

      if (postid) {
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
        if (value === "UP" && authorId !== req.userId) {
          await notify(authorId, "upvote", { postId, commentId });
        }
      }

      res.json(vote);
  } catch (err) {
    next(err);
  }
});

module.exports = { votesRouter };
