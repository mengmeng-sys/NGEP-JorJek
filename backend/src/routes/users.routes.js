const { Router } = require("express");
const { supabase } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");

const usersRouter = Router();

const USER_SAFE = "id,email,display_name,role,bio,karma,email_verified,created_at";

// GET /users -- READ all users (paginated)
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
