const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

const REFRESH_TOKEN_DAYS = 30;

function signAccessToken(userId, tokenVersion) {
  return jwt.sign({ sub: userId, ver: tokenVersion }, env.jwtSecret, { expiresIn: "7d" });
}

function signRefreshToken(userId, tokenVersion) {
  return jwt.sign({ sub: userId, ver: tokenVersion }, env.jwtRefreshSecret, { expiresIn: `${REFRESH_TOKEN_DAYS}d` });
}

function userSafe(row) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    bio: row.bio || null,
    gen: row.gen ?? null,
    department: row.department || null,
    specialization: row.specialization || null,
    avatarUrl: row.avatar_url || null,
    emailVerified: row.email_verified,
    showProfileToGuests: row.show_profile_to_guests ?? true,
    allowDirectRequests: row.allow_direct_requests ?? true,
    showOnlineStatus: row.show_online_status ?? false,
    receiveEmailNotifications: row.receive_email_notifications ?? true,
  };
}

module.exports = { signAccessToken, signRefreshToken, userSafe };
