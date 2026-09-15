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

module.exports = { io };

server.listen(env.port, () => {
  console.log(`JorJek backend listening on http://localhost:${env.port}`);
});

module.exports = { io };
