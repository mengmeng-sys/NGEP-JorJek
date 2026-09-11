const { Router } = require("express");
const { supabase } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");

const notificationsRouter = Router();

// GET /notifications -- READ user's notifications (polling endpoint)

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: List my notifications
 *     description: Returns the authenticated user's notifications, newest first. Use for polling.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *         description: Page number (1-based)
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 50 }
 *         description: Number of notifications per page (max 100)
 *     responses:
 *       200:
 *         description: Paginated list of notifications
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/NotificationList"
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
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

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Count unread notifications
 *     description: Returns the number of unread notifications for the authenticated user.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 unread:
 *                   type: integer
 *                   example: 3
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
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

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Get a single notification
 *     description: Returns one of the authenticated user's notifications (scoped to the user).
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Notification UUID
 *     responses:
 *       200:
 *         description: The requested notification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Notification"
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       404:
 *         description: Notification not found (or belongs to another user)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
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

/**
 * @swagger
 * /notifications/{id}/read:
 *   post:
 *     summary: Mark a notification as read
 *     description: Marks a single notification as read (scoped to the authenticated user).
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Notification UUID
 *     responses:
 *       204:
 *         description: Notification marked as read
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
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

/**
 * @swagger
 * /notifications/read-all:
 *   post:
 *     summary: Mark all notifications as read
 *     description: Marks every unread notification of the authenticated user as read.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: All notifications marked as read
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
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

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     description: Deletes a single notification (scoped to the authenticated user).
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Notification UUID
 *     responses:
 *       204:
 *         description: Notification deleted
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
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

/**
 * @swagger
 * /notifications:
 *   delete:
 *     summary: Delete all my notifications
 *     description: Deletes every notification belonging to the authenticated user.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: All notifications deleted
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
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
