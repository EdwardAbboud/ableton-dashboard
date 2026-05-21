const { createUdpReceiver } = require("./udpReceiver");
const { createWebSocketServer } = require("./websocketServer");
const {
  getState,
  markInvalidPacket,
  mergeIncomingState,
  setWebSocketStatus,
} = require("./state");

const UDP_PORT = Number(process.env.UDP_PORT || 7400);
const WS_PORT = Number(process.env.WS_PORT || 3001);

const websocketServer = createWebSocketServer({
  port: WS_PORT,
  getState,
  onClientCountChange(count) {
    setWebSocketStatus(count > 0 ? "active" : "listening");
  },
});

createUdpReceiver({
  port: UDP_PORT,
  onState(message) {
    const state = mergeIncomingState(message);
    websocketServer.broadcast(state);
  },
  onInvalid(error) {
    console.warn("[udp] invalid packet:", error.message);
    websocketServer.broadcast(markInvalidPacket());
  },
});

setInterval(() => {
  websocketServer.broadcast(getState());
}, 1000);
