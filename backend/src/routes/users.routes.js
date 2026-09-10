const { Router } = require("express");
const { supabase } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");

const usersRouter = Router();

const USER_SAFE = "id,email,display_name,role,bio,karma,email_verified,created_at";

// GET /users -- READ all users (paginated)

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List users (paginated)
 *     description: Returns a paginated list of users (safe fields only), newest account first.
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *         description: Page number (1-based)
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 20 }
 *         description: Number of users per page (max 50)
 *     responses:
 *       200:
 *         description: Paginated list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/UserSafe"
 *                 page: { type: integer, example: 1 }
 *                 limit: { type: integer, example: 20 }
 *                 total: { type: integer, example: 150 }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
usersRouter.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const from = (page - 1) * limit;

    const { data: users, error, count } = await supabase
      .from("users")
      .select(USER_SAFE, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);
    if (error) throw error;

    res.json({ users, page, limit, total: count });
  } catch (err) {
    next(err);
  }
});

// GET /users/top-mentors -- READ top 10 users by karma

/**
 * @swagger
 * /users/top-mentors:
 *   get:
 *     summary: Get top mentors
 *     description: Returns the top 10 users with the highest karma (their display name, role, and karma).
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Top 10 users by karma
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string, format: uuid }
 *                   displayName: { type: string, example: "Mentor One" }
 *                   role: { type: string, enum: [STUDENT, MENTOR, ADMIN] }
 *                   karma: { type: integer, example: 120 }
 */
usersRouter.get("/top-mentors", async (_req, res, next) => {
  try {
    const { data: topMentors, error } = await supabase
      .from("users")
      .select("id, displayName:display_name, role, karma")
      .order("karma", { ascending: false })
      .limit(10);
    if (error) throw error;

    res.json(topMentors);
  } catch (err) {
    next(err);
  }
});

// GET /users/:id -- READ single user by id

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a single user
 *     description: Returns a user's public profile (id, display name, role, karma, bio, created date).
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: User UUID
 *     responses:
 *       200:
 *         description: Public user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string, format: uuid }
 *                 displayName: { type: string, example: "Dara Chan" }
 *                 role: { type: string, enum: [STUDENT, MENTOR, ADMIN] }
 *                 karma: { type: integer, example: 42 }
 *                 bio: { type: string, nullable: true }
 *                 createdAt: { type: string, format: date-time }
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
usersRouter.get("/:id", async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, displayName:display_name, role, karma, bio, createdAt:created_at")
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PATCH /users/:id -- UPDATE own profile (or admin)

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update own profile
 *     description: Updates the authenticated user's own profile (`displayName`, `bio`, `role`). Only the account owner can update it.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: User UUID (must match the authenticated user)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *                 example: Dara Chan New
 *               bio:
 *                 type: string
 *                 example: Full-stack developer at CADT
 *               role:
 *                 type: string
 *                 enum: [STUDENT, MENTOR, ADMIN]
 *                 example: MENTOR
 *     responses:
 *       200:
 *         description: Updated user (safe fields)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UserSafe"
 *       400:
 *         description: No fields to update
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
 *       403:
 *         description: You can only update your own profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
usersRouter.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    if (req.userId !== req.params.id) {
      return res.status(403).json({ error: "You can only update your own profile" });
    }

    const { displayName, bio, role } = req.body;
    const updates = {};
    if (displayName !== undefined) updates.display_name = displayName;
    if (bio !== undefined) updates.bio = bio;
    if (role !== undefined) updates.role = role;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", req.params.id)
      .select(USER_SAFE)
      .single();
    if (error) throw error;

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// DELETE /users/:id -- DELETE own account (or admin)

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete own account
 *     description: Permanently deletes the authenticated user's own account. Only the account owner can delete it.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: User UUID (must match the authenticated user)
 *     responses:
 *       204:
 *         description: Account deleted
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       403:
 *         description: You can only delete your own account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
usersRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    if (req.userId !== req.params.id) {
      return res.status(403).json({ error: "You can only delete your own account" });
    }

    const { error } = await supabase.from("users").delete().eq("id", req.params.id);
    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = { usersRouter };
