const { Router } = require("express");
const { supabase } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");

// Owner: TN2 — task tracker #23, #38
const notificationsRouter = Router();

// Frontend polls this on an interval when NOTIFICATION_TRANSPORT=polling.
notificationsRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const { data: notification, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", req.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;

    res.json(notification);
  } catch (err) {
    next(err);
  }
});

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

module.exports = { notificationsRouter };
