const dgram = require("dgram");

function createUdpReceiver({ port = 7400, host = "127.0.0.1", onState, onInvalid }) {
  const socket = dgram.createSocket("udp4");

  socket.on("message", (buffer) => {
    const raw = buffer.toString("utf8").trim();

    try {
      const message = JSON.parse(raw);
      if (!message || typeof message !== "object" || Array.isArray(message)) {
        throw new Error("UDP payload must be a JSON object");
      }

      onState(message);
    } catch (error) {
      onInvalid(error, raw);
    }
  });

  socket.on("error", (error) => {
    console.error("[udp] error:", error.message);
  });

  socket.bind(port, host, () => {
    console.log(`[udp] listening on ${host}:${port}`);
  });

  return socket;
}

module.exports = {
  createUdpReceiver,
};
