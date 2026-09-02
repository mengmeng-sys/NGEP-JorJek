const { supabase } = require("../config/db");

/**
 * Phase 1: karma is derived from upvotes on a user's posts and comments
 * (there are no session ratings yet — session booking is Phase 2).
 * Phase 2: switch the source to post-session star ratings once
 * SessionRating rows exist. See JorJek_Project_Scope.pdf, Section 3.
 */
async function recalculateKarma(userId) {
  const [postResult, commentResult] = await Promise.all([
    supabase
      .from("votes")
      .select("*, post!inner(author_id", { count: "exact", head: true })
      .eq("value", "UP")
      .eq("posts.author_id", userId),
    supabase
      .from("votes")
      .select("*, comments!inner(author_id", { count: "exact", head: true })
      .eq("value", "UP")
      .eq("comments.author_id", userId),
  ]);
  if (postResult.error) throw postResult.error;
  if (commentResult.error) throw commentResult.error;

  const karma = (postResult.count ?? 0) + (commentResult.count ?? 0);

  const { error: updateError } = await supabase.from("users").update({ karma }).eq("id", userId);
  if (updateError) throw updateError;

  return karma;
}

module.exports = { recalculateKarma };
