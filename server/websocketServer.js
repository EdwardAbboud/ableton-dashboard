const http = require("http");
const { WebSocketServer, WebSocket } = require("ws");

function createWebSocketServer({ port = 3001, getState, onClientCountChange }) {
  const server = http.createServer();
  const wss = new WebSocketServer({ server });

  function emitClientCount() {
    onClientCountChange(wss.clients.size);
  }

  function send(socket, state) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(state));
    }
  }

  function broadcast(state = getState()) {
    wss.clients.forEach((client) => send(client, state));
  }

  wss.on("connection", (socket) => {
    emitClientCount();
    send(socket, getState());

    socket.on("close", emitClientCount);
    socket.on("error", (error) => {
      console.error("[ws] client error:", error.message);
    });
  });

  server.listen(port, () => {
    console.log(`[ws] listening on ws://localhost:${port}`);
    emitClientCount();
  });

  return {
    broadcast,
    close: () => server.close(),
  };
}

module.exports = {
  createWebSocketServer,
};
