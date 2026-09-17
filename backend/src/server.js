const http = require("http");
const { Server: SocketIOServer } = require("socket.io");
const { app } = require("./app");
const { env } = require("./config/env");
const { setIO } = require("./lib/socket");

const server = http.createServer(app);

const io = new SocketIOServer(server, { cors: { origin: "*" } });

const { supabase } = require("./config/db");

const onlineUsers = new Map();

async function getOnlineStatusVisibility(userId) {
  const { data } = await supabase
    .from("users")
    .select("show_online_status")
    .eq("id", userId)
    .maybeSingle();
  return data?.show_online_status ?? false;
}

io.on("connection", (socket) => {
  socket.on("join", async (userId) => {
    socket.join(userId);
    socket._userId = userId;
    const sockets = onlineUsers.get(userId) || new Set();
    const wasOnline = sockets.size > 0;
    sockets.add(socket.id);
    onlineUsers.set(userId, sockets);
    if (!wasOnline) {
      const visible = await getOnlineStatusVisibility(userId);
      if (visible) {
        io.emit("user_online", { userId });
      } else {
        io.emit("user_hidden_online", { userId });
      }
    }
    const allOnlineIds = [...onlineUsers.keys()];
    const visibleOnlineIds = [];
    for (const uid of allOnlineIds) {
      const isVisible = await getOnlineStatusVisibility(uid);
      if (isVisible) visibleOnlineIds.push(uid);
    }
    socket.emit("users_online", { userIds: visibleOnlineIds });
  });
  socket.on("join_post", (postId) => socket.join(`post:${postId}`));
  socket.on("leave_post", (postId) => socket.leave(`post:${postId}`));
  socket.on("disconnect", async () => {
    const userId = socket._userId;
    if (userId) {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          const visible = await getOnlineStatusVisibility(userId);
          if (visible) {
            io.emit("user_offline", { userId });
          } else {
            io.emit("user_hidden_offline", { userId });
          }
        }
      }
    }
  });
});

setIO(io);

// ─── Startup email-config warning ─────────────────────────────────────
const hasResend = Boolean(env.resendApiKey);
const hasSmtp = Boolean(env.smtpUser && env.smtpPass);
if (!hasResend && !hasSmtp) {
  console.warn(
    "[MAIL] ⚠️ No mailing configured — OTP/reset emails will NOT be sent. " +
      "Add RESEND_API_KEY (HTTPS port 443 — works on Render free) or SMTP_* vars."
  );
} else if (hasResend) {
  console.log(
    `[MAIL] Using Resend HTTPS API (443). from="${env.resendFrom || env.smtpFrom || "JorJek <onboarding@resend.dev>"}" — ` +
      "note: onboarding@resend.dev only delivers to your OWN inbox until you verify a domain."
  );
} else {
  console.log(
    `[MAIL] Using SMTP ${env.smtpHost}:${env.smtpPort} — outbound SMTP is blocked on Render's free tier; use RESEND_API_KEY there.`
  );
}

server.listen(env.port, () => {
  console.log(`JorJek backend listening on http://localhost:${env.port}`);
});

module.exports = { io };
