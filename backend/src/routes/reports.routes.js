const { Router } = require("express");
const { supabase } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");

const reportsRouter = Router();

// GET /reports -- READ all reports (paginated)
reportsRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const from = (page - 1) * limit;

    const { data: reports, error, count } = await supabase
      .from("reports")
      .select(`*, reporter:users!reporter_id(id,display_name), post:posts!post_id(id,title), comment:comments!comment_id(id,body), target:users!target_user_id(id,display_name)`, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);
    if (error) throw error;

    res.json({ reports, page, limit, total: count });
  } catch (err) {
    next(err);
  }
});

// GET /reports/:id -- READ single report
reportsRouter.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const { data: report, error } = await supabase
      .from("reports")
      .select(`*, reporter:users!reporter_id(id,display_name), post:posts!post_id(id,title), comment:comments!comment_id(id,body), target:users!target_user_id(id,display_name)`)
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!report) return res.status(404).json({ error: "Report not found" });

    res.json(report);
  } catch (err) {
    next(err);
  }
});

// POST /reports -- CREATE report
reportsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const { postId, commentId, targetUserId, reason } = req.body;

    const { data: report, error } = await supabase
      .from("reports")
      .insert({
        reporter_id: req.userId,
        post_id: postId ?? null,
        comment_id: commentId ?? null,
        target_user_id: targetUserId ?? null,
        reason,
      })
      .select()
      .single();
    if (error) throw error;

    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
});

// PATCH /reports/:id -- UPDATE report status
reportsRouter.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "status is required" });

    const { data: report, error } = await supabase
      .from("reports")
      .update({ status })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;

    res.json(report);
  } catch (err) {
    next(err);
  }
});

// DELETE /reports/:id -- DELETE a report
reportsRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const { error } = await supabase.from("reports").delete().eq("id", req.params.id);
    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = { reportsRouter };
