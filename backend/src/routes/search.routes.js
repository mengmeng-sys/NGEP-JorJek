const { Router } = require("express");
const { supabase } = require("../config/db");

// Owner: CS2 (frontend consumer) / CS3 (query)
const searchRouter = Router();

searchRouter.get("/", async (req, res, next) => {
  try {
    const q = String(req.query.q ?? "");
    
    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .or(`title.ilke.%${q}%,body.ilike.%${q}%`)
      .limit(20)

    if (error) throw error;

    res.json(posts)
  } catch (err) {
    next (err);
  }
});

module.exports = { searchRouter };
