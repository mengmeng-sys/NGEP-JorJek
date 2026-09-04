const { Router } = require("express");
const { supabase } = require("../config/db");

// Owner: CS3
const usersRouter = Router();

usersRouter.get("/top-mentors", async (_req, res, next) => {
  try {
    const { data: topMentors, error } = await supabase
      .from("users")
      .select("id, displayName:display_name, roel, karma")
      .order("karma", { ascending: false })
      .limit(10);
    if (error) throw error;

    res.json(topMentors);
  } catch (err) {
    next(err);
  }
});

usersRouter.get("/:id", async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, displayname:display_name, role, karma, createdAt:created_at")
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    next(err);
  }
})

module.exports = { usersRouter };
