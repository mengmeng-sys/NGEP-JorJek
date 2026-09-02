const { supabase } = require("../config/db");
const { env } = require("../config/env");

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
    // TODO(TN2): emit over the socket.io room for this userId.
    // io.to(userId).emit("notification", notification)
  }

  return notification;
}

module.exports = { notify };
