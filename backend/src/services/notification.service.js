const { supabase } = require("../config/db");
const { env } = require("../config/env");
const { getIO } = require("../lib/socket");

/**
 * TN2 — task tracker #9 "Decide + scaffold notification delivery approach
 * (polling vs websockets)" and #23/#38.
 *
 * Delivery transport is chosen once, via NOTIFICATION_TRANSPORT in .env:
 *   - "polling": the frontend calls GET /notifications on an interval.
 *   - "websocket": push notify() results down the socket.io connection
 *     set up in src/server.js instead of relying on polling.
 * Either way, notifications are always persisted below so the polling
 * fallback keeps working even once websockets are added.
 */
async function notify(userId, type, payload) {
  const { data: notification, error } = await supabase
    .from("notifications")
    .insert({ user_id: userId, type, payload })
    .select()
    .single();
  if (error) throw error;

  if (env.notificationTransport === "websocket") {
    const io = getIO();
    // io can be null very briefly during server startup, or if this runs
    // in a test/script context with no server booted — guard rather than crash.
    if (io) {
      io.to(userId).emit("notification", notification);
    }
  }

  return notification;
}

module.exports = { notify };
