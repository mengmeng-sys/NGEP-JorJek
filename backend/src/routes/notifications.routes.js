const { Router } = require("express");
const { supabase } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");

const notificationsRouter = Router();

// GET /notifications -- READ user's notifications (polling endpoint)
notificationsRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const from = (page - 1) * limit;

    const { data: notifications, error, count } = await supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", req.userId)
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);
    if (error) throw error;

    res.json({ notifications, page, limit, total: count });
  } catch (err) {
    next(err);
  }
});

// GET /notifications/unread-count -- READ count of unread notifications
notificationsRouter.get("/unread-count", requireAuth, async (req, res, next) => {
  try {
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", req.userId)
      .eq("read", false);
    if (error) throw error;

    res.json({ unread: count ?? 0 });
  } catch (err) {
    next(err);
  }
});

// GET /notifications/:id -- READ single notification
notificationsRouter.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const { data: notification, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("id", req.params.id)
      .eq("user_id", req.userId)
      .maybeSingle();
    if (error) throw error;
    if (!notification) return res.status(404).json({ error: "Notification not found" });

    res.json(notification);
  } catch (err) {
    next(err);
  }
});

// POST /notifications/:id/read -- UPDATE notification read status
notificationsRouter.post("/:id/read", requireAuth, async (req, res, next) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", req.params.id)
      .eq("user_id", req.userId);
    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST /notifications/read-all -- UPDATE all notifications as read
notificationsRouter.post("/read-all", requireAuth, async (req, res, next) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", req.userId)
      .eq("read", false);
    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// DELETE /notifications/:id -- DELETE a single notification
notificationsRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.userId);
    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// DELETE /notifications -- DELETE all user's notifications
notificationsRouter.delete("/", requireAuth, async (req, res, next) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", req.userId);
    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = { notificationsRouter };
