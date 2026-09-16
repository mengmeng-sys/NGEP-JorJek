const http = require("http");
const { Server: SocketIOServer } = require("socket.io");
const { app } = require("./app");
const { env } = require("./config/env");
const { setIO } = require("./lib/socket");

const server = http.createServer(app);

const io = new SocketIOServer(server, { cors: { origin: "*" } });
io.on("connection", (socket) => {
  socket.on("join", (userId) => socket.join(userId));
  socket.on("join_post", (postId) => socket.join(`post:${postId}`));
  socket.on("leave_post", (postId) => socket.leave(`post:${postId}`));
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
