const { prisma } = require("../config/db");

/**
 * Phase 1: karma is derived from upvotes on a user's posts and comments
 * (there are no session ratings yet — session booking is Phase 2).
 * Phase 2: switch the source to post-session star ratings once
 * SessionRating rows exist. See JorJek_Project_Scope.pdf, Section 3.
 */
async function recalculateKarma(userId) {
  const [postUpvotes, commentUpvotes] = await Promise.all([
    prisma.vote.count({ where: { value: "UP", post: { authorId: userId } } }),
    prisma.vote.count({ where: { value: "UP", comment: { authorId: userId } } }),
  ]);

  const karma = postUpvotes + commentUpvotes;
  await prisma.user.update({ where: { id: userId }, data: { karma } });
  return karma;
}

module.exports = { recalculateKarma };
