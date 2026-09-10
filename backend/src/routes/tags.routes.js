const { Router } = require("express");
const { supabase } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");

const tagsRouter = Router();

// GET /tags -- READ all skill tags (paginated)
tagsRouter.get("/", async (_req, res, next) => {
  try {
    const page = Math.max(1, Number(_req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(_req.query.limit) || 50));
    const from = (page - 1) * limit;

    const { data: tags, error, count } = await supabase
      .from("skill_tags")
      .select("*", { count: "exact" })
      .order("name", { ascending: true })
      .range(from, from + limit - 1);
    if (error) throw error;

    res.json({ tags, page, limit, total: count });
  } catch (err) {
    next(err);
  }
});

// GET /tags/:id -- READ single tag with follower count
tagsRouter.get("/:id", async (req, res, next) => {
  try {
    const { data: tag, error } = await supabase
      .from("skill_tags")
      .select("*, followers:tag_follows(user_id)")
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!tag) return res.status(404).json({ error: "Tag not found" });

    const { count: followerCount } = await supabase
      .from("tag_follows")
      .select("user_id", { count: "exact", head: true })
      .eq("tag_id", req.params.id);

    res.json({ ...tag, followerCount: followerCount ?? 0, followers: undefined });
  } catch (err) {
    next(err);
  }
});

// GET /tags/:id/followers -- READ followers of a tag
tagsRouter.get("/:id/followers", async (req, res, next) => {
  try {
    const { data: followers, error } = await supabase
      .from("tag_follows")
      .select("user:users(id,display_name,role,karma)")
      .eq("tag_id", req.params.id);
    if (error) throw error;

    res.json(followers.map((f) => f.user));
  } catch (err) {
    next(err);
  }
});

// GET /tags/:id/posts -- READ posts with this tag
tagsRouter.get("/:id/posts", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const from = (page - 1) * limit;

    const { data: tag, error: tagError } = await supabase
      .from("skill_tags")
      .select("id")
      .eq("id", req.params.id)
      .maybeSingle();
    if (tagError) throw tagError;
    if (!tag) return res.status(404).json({ error: "Tag not found" });

    const { data: posts, error } = await supabase
      .from("posts")
      .select(`*, author:users(id,display_name,role,karma)`)
      .in("id", supabase.rpc ? [] : [])
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    // Use join table to find posts with this tag
    const { data: postTags, error: ptError } = await supabase
      .from("post_tags")
      .select("post_id")
      .eq("tag_id", req.params.id)
      .range(from, from + limit - 1);
    if (ptError) throw ptError;

    if (!postTags || postTags.length === 0) return res.json([]);

    const postIds = postTags.map((pt) => pt.post_id);
    const { data: tagPosts, error: postsError } = await supabase
      .from("posts")
      .select(`*, author:users(id,display_name,role,karma), votes(*)`)
      .in("id", postIds)
      .order("created_at", { ascending: false });
    if (postsError) throw postsError;

    res.json(tagPosts);
  } catch (err) {
    next(err);
  }
});

// POST /tags -- CREATE a new tag
tagsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    const slug = name.toLowerCase().replace(/\s+/g, "-");

    const { data: tag, error } = await supabase
      .from("skill_tags")
      .upsert({ slug, name }, { onConflict: "slug" })
      .select()
      .single();
    if (error) throw error;

    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
});

// PATCH /tags/:id -- UPDATE tag name (admin only)
tagsRouter.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    const slug = name.toLowerCase().replace(/\s+/g, "-");

    const { data: tag, error } = await supabase
      .from("skill_tags")
      .update({ name, slug })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;

    res.json(tag);
  } catch (err) {
    next(err);
  }
});

// DELETE /tags/:id -- DELETE a tag (admin only)
tagsRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const { error } = await supabase.from("skill_tags").delete().eq("id", req.params.id);
    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST /tags/:tagName/follow -- CREATE follow relationship (upsert)
tagsRouter.post("/:tagName/follow", requireAuth, async (req, res, next) => {
  try {
    const { data: tag, error: tagError } = await supabase
      .from("skill_tags")
      .upsert(
        { slug: req.params.tagName.toLowerCase().replace(/\s+/g, "-"), name: req.params.tagName },
        { onConflict: "slug" }
      )
      .select()
      .single();
    if (tagError) throw tagError;

    const { error: followError } = await supabase
      .from("tag_follows")
      .upsert({ user_id: req.userId, tag_id: tag.id }, { onConflict: "user_id, tag_id" });
    if (followError) throw followError;

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// DELETE /tags/:tagName/unfollow -- DELETE follow relationship
tagsRouter.delete("/:tagName/unfollow", requireAuth, async (req, res, next) => {
  try {
    const { data: tag, error: tagError } = await supabase
      .from("skill_tags")
      .select("id")
      .eq("slug", req.params.tagName.toLowerCase().replace(/\s+/g, "-"))
      .maybeSingle();
    if (tagError) throw tagError;
    if (!tag) return res.status(404).json({ error: "Tag not found" });

    const { error } = await supabase
      .from("tag_follows")
      .delete()
      .eq("user_id", req.userId)
      .eq("tag_id", tag.id);
    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = { tagsRouter };
