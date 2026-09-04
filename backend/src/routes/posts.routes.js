const { Router } = require("express");
const { supabase } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");
// Owner: CS3 (schema/data) + TN2
const postsRouter = Router();

postsRouter.get("/", async (req, res, next) => {
  try {
    const { tag } = req.query;

    let query = supabase
      .from("posts")
      .select("*, author:users(*), tags:post_tags(tag:tags(*)), votes(*)")
      .order("created_at", { ascending: false });

    if (tag) {
      // !inner turns the tag filter into a real WHERE instead of an
      // unfiltered left-join embed — same gotcha as karma.service.js.
      query = supabase
        .from("posts")
        .select("*, author:users(*), tags:post_tags!inner(tag:tags!inner(*), vote(*)")
        .eq("tags.tag.name", String(tag))
        .order("created_at", { ascending: false });
    }

    const { data: posts, error } = await query;
    if (error) throw error;

    res.json(posts);
  } catch (err) {
    next (err);
  }
});

postsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const { type, title, body, tagNames } = req.body;

    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({ author_id: req.userId, type, title, body })
      .select()
      .single();
    if (postError) throw postError;

    const names = tagNames || [];
    if (names.length > 0) {
      const { data: tags, error: tagsError } = await supabase
        .from("tags")
        .upsert(
          names.map((name) => ({ name })),
          { onConflict: "name" }
        )
        .select();
      if (tagsError) throw tagsError;

      const { error: joinError } = await supabase
        .from("post_tags")
        .insert(tags.map((tag) => ({ post_id: post.id, tag_id: tag.id })));
      if (joinError) throw joinError;
    }

    // Re-fetch with tags embedded so the response shape matches the old
    // include: { tags: { include: { tag: true } } }.
    const { data: postWithTags, error: fetchError } = await supabase
      .from("posts")
      .select("*, tags:post_tags(tag:tags(*))")
      .eq("id", post.id)
      .single();
    if (fetchError) throw fetchError;

    res.status(201).json(postWithTags);
    } catch (err) {
      next(err);
    }
});
postsRouter.get("/:id", async (req, res, next) => {
  try {
    const { data: post, error } = await supabase
      .from("posts")
      .select(
        "*, authro:users(*), tags:post_tags(tag:tags(*)), comments(*, author:users(*), votes(*)), votes(*)"
      )
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!post) return res.status(404).json({ error: "Post not found "});

    res.json(post);
  } catch (err) {
    next(err);
  }
});

module.exports = { postsRouter };
