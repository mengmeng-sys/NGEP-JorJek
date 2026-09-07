const { Router } = require("express");
const { supabase } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");

// Owner: CS3
const tagsRouter = Router();

tagsRouter.get("/", async (_req, res, next) => {
  try {
    const { data: tags, error } = await supabase.from("tags").select("*");
    if (error) throw error;
    res.json(tags);
  } catch (err) {
    next(err);
  }
});

tagsRouter.post("/:tagName/follow", requireAuth, async (req, res, next) => {
  try {
    const { data: tag, error: tagError } = await supabase
      .from("tags")
      .upsert({ name: req.params.tagName }, { onConflict: "name" })
      .select()
      .single();
    if (tagError) throw tagError;

    const { error: followError } = await supabase
      .from("tag_follows")
      .upsert({ user_id: req.userId, tag_id: tag.id }, { onConflict: "user_id,tag_id" });
    if (followError) throw followError;

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = { tagsRouter };
