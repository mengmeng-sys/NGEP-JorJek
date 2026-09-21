const crypto = require("crypto");
const { supabase } = require("../config/db");

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function storeRefreshToken(userId, token) {
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await supabase.from("refresh_tokens").insert({
    token_hash: tokenHash,
    user_id: userId,
    expires_at: expiresAt.toISOString(),
  });
}

module.exports = { hashToken, storeRefreshToken };
