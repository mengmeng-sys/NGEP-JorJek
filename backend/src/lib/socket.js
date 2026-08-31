// Tiny shared holder for the socket.io instance. Keeping this separate from
// server.js avoids a circular require (server.js -> app.js -> routes ->
// notification.service.js -> server.js would be circular; this way
// notification.service.js only ever imports this small file).
let ioInstance = null;

function setIO(io) {
  ioInstance = io;
}

function getIO() {
  return ioInstance;
}

module.exports = { setIO, getIO };
