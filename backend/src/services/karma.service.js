const { supabase } = require("../config/db");

/**
 * Phase 1: karma is derived from upvotes on a user's posts and comments
 * (there are no session ratings yet — session booking is Phase 2).
 * Phase 2: switch the source to post-session star ratings once
 * SessionRating rows exist. See JorJek_Project_Scope.pdf, Section 3.
 *
 * Only counts upvotes (value = 1). Downvotes (-1) do not reduce karma;
 * they only affect the post/comment score.
 */
async function recalculateKarma(userId) {
  if (!userId) return null;

  const [postResult, commentResult] = await Promise.all([
    supabase
      .from("votes")
      .select("*, posts!inner(author_id)", { count: "exact", head: true })
      .eq("value", 1)
      .eq("posts.author_id", userId),
    supabase
      .from("votes")
      .select("*, comments!inner(author_id)", { count: "exact", head: true })
      .eq("value", 1)
      .eq("comments.author_id", userId),
  ]);

  if (postResult.error) throw postResult.error;
  if (commentResult.error) throw commentResult.error;

  const karma = (postResult.count ?? 0) + (commentResult.count ?? 0);

  const { error: updateError } = await supabase
    .from("users")
    .update({ karma })
    .eq("id", userId);
  if (updateError) throw updateError;

  return karma;
}

/**
 * Recalculate karma for multiple users at once (used after bulk deletes
 * like post/comment deletion where cascade removes votes).
 */
async function recalculateKarmaForUsers(userIds) {
  if (!userIds || userIds.length === 0) return;
  const uniqueIds = [...new Set(userIds)];
  await Promise.all(uniqueIds.map((id) => recalculateKarma(id).catch(() => null)));
}

module.exports = { recalculateKarma, recalculateKarmaForUsers };
