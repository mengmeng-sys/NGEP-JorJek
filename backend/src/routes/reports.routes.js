const { Router } = require("express");
const { supabase } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");

const reportsRouter = Router();

// GET /reports -- READ all reports (paginated)

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: List reports (paginated)
 *     description: |
 *       Returns a paginated list of reports, newest first. Each includes the reporter, the target post/comment, and the target user.
 *       Any authenticated user can see all reports in the current implementation (no role check).
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *         description: Page number (1-based)
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 20 }
 *         description: Number of reports per page (max 50)
 *     responses:
 *       200:
 *         description: Paginated list of reports
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ReportList"
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
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

/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     summary: Get a single report
 *     description: Returns one report with its reporter, target post/comment, and target user.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Report UUID
 *     responses:
 *       200:
 *         description: The requested report
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Report"
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       404:
 *         description: Report not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
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

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Create a report
 *     description: |
 *       Files a report against a post, comment, and/or target user. At least one target is expected.
 *       `reason` describes the issue (e.g. spam, harassment).
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               postId:
 *                 type: string
 *                 format: uuid
 *                 description: Post being reported
 *                 example: 9f2c7a1d-4b6e-4f88-9f19-4f3723b3e1a0
 *               commentId:
 *                 type: string
 *                 format: uuid
 *                 description: Comment being reported
 *                 example: 4f8e0c1a-9b2c-4d5e-8f67-1234567890ab
 *               targetUserId:
 *                 type: string
 *                 format: uuid
 *                 description: User being reported
 *                 example: b7e4d6f1-2c8a-4e0f-9c3d-5a1b2c3d4e5f
 *               reason:
 *                 type: string
 *                 example: Spam content
 *     responses:
 *       201:
 *         description: Report created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Report"
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
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

/**
 * @swagger
 * /reports/{id}:
 *   patch:
 *     summary: Update report status
 *     description: |
 *       Updates the status of a report (role-based admin auth is not enforced in the current implementation).
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Report UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 example: approved
 *     responses:
 *       200:
 *         description: Updated report
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Report"
 *       400:
 *         description: status is required
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

/**
 * @swagger
 * /reports/{id}:
 *   delete:
 *     summary: Delete a report
 *     description: Permanently deletes a report.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Report UUID
 *     responses:
 *       204:
 *         description: Report deleted
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
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
