const http = require("http");
const { Server: SocketIOServer } = require("socket.io");
const { app } = require("./app");
const { env } = require("./config/env");
const { setIO } = require("./lib/socket");

const server = http.createServer(app);

// Only used when NOTIFICATION_TRANSPORT=websocket (TN1/TN2 Week 1 decision,
// task tracker #9). Harmless to leave running either way.
const io = new SocketIOServer(server, { cors: { origin: "*" } });
io.on("connection", (socket) => {
  socket.on("join", (userId) => socket.join(userId));
});
setIO(io); // makes this instance reachable from notification.service.js

server.listen(env.port, () => {
  console.log(`JorJek backend listening on http://localhost:${env.port}`);
});

module.exports = { io };
