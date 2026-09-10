const { Router } = require("express");
const { supabase } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");

const postsRouter = Router();

const USER_SAFE = "id,email,display_name,role,bio,karma,created_at";

// GET /posts -- READ list (optional ?tag= filter, pagination)
postsRouter.get("/", async (req, res, next) => {
  try {
    const { tag } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const from = (page - 1) * limit;

    let query = supabase
      .from("posts")
      .select(`*, author:users(${USER_SAFE}), tags:post_tags(tag:skill_tags(*)), votes(*)`, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + limit - 1);

    if (tag) {
      query = supabase
        .from("posts")
        .select(`*, author:users(${USER_SAFE}), tags:post_tags!inner(tag:skill_tags!inner(*)), votes(*)`, { count: "exact" })
        .eq("tags.tag.name", String(tag))
        .order("created_at", { ascending: false })
        .range(from, from + limit - 1);
    }

    const { data: posts, error, count } = await query;
    if (error) throw error;

    res.json({ posts, page, limit, total: count });
  } catch (err) {
    next(err);
  }
});

// GET /posts/:id -- READ single post (with author, tags, comments, votes)
postsRouter.get("/:id", async (req, res, next) => {
  try {
    const { data: post, error } = await supabase
      .from("posts")
      .select(
        `*, author:users(${USER_SAFE}), tags:post_tags(tag:skill_tags(*)), comments(*, author:users(${USER_SAFE}), votes(*)), votes(*)`
      )
      .eq("id", req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!post) return res.status(404).json({ error: "Post not found" });

    res.json(post);
  } catch (err) {
    next(err);
  }
});

// POST /posts -- CREATE post (with tag upsert + join)
postsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const { type, title, body, tagNames } = req.body;

    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({ author_id: req.userId, type: (type ?? "question").toLowerCase(), title, body })
      .select()
      .single();
    if (postError) throw postError;

    const names = tagNames || [];
    if (names.length > 0) {
      const { data: tags, error: tagsError } = await supabase
        .from("skill_tags")
        .upsert(
          names.map((name) => ({ slug: name.toLowerCase().replace(/\s+/g, "-"), name })),
          { onConflict: "slug" }
        )
        .select();
      if (tagsError) throw tagsError;

      const { error: joinError } = await supabase
        .from("post_tags")
        .insert(tags.map((tag) => ({ post_id: post.id, tag_id: tag.id })));
      if (joinError) throw joinError;
    }

    const { data: postWithTags, error: fetchError } = await supabase
      .from("posts")
      .select(`*, author:users(${USER_SAFE}), tags:post_tags(tag:skill_tags(*))`)
      .eq("id", post.id)
      .single();
    if (fetchError) throw fetchError;

    res.status(201).json(postWithTags);
  } catch (err) {
    next(err);
  }
});

// PATCH /posts/:id -- UPDATE post (author only)
postsRouter.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const { data: existing, error: findError } = await supabase
      .from("posts")
      .select("id, author_id")
      .eq("id", req.params.id)
      .maybeSingle();
    if (findError) throw findError;
    if (!existing) return res.status(404).json({ error: "Post not found" });
    if (existing.author_id !== req.userId) {
      return res.status(403).json({ error: "You can only edit your own posts" });
    }

    const { title, body, type } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (body !== undefined) updates.body = body;
    if (type !== undefined) updates.type = type.toLowerCase();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const { data: post, error } = await supabase
      .from("posts")
      .update(updates)
      .eq("id", req.params.id)
      .select(`*, author:users(${USER_SAFE}), tags:post_tags(tag:skill_tags(*))`)
      .single();
    if (error) throw error;

    res.json(post);
  } catch (err) {
    next(err);
  }
});

// DELETE /posts/:id -- DELETE post (author only)
postsRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const { data: existing, error: findError } = await supabase
      .from("posts")
      .select("id, author_id")
      .eq("id", req.params.id)
      .maybeSingle();
    if (findError) throw findError;
    if (!existing) return res.status(404).json({ error: "Post not found" });
    if (existing.author_id !== req.userId) {
      return res.status(403).json({ error: "You can only delete your own posts" });
    }

    const { error } = await supabase.from("posts").delete().eq("id", req.params.id);
    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = { postsRouter };
