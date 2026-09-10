const { Router } = require("express");
const { supabase } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");
const { recalculateKarma } = require("../services/karma.service");
const { notify } = require("../services/notification.service");

const votesRouter = Router();

// GET /vote/post/:postId -- READ all votes for a post
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
