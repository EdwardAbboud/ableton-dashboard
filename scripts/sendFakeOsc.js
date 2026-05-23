const dgram = require("dgram");

const socket = dgram.createSocket("udp4");

const packets = [
  oscInt("bar", 30),
  oscInt("beat", 2),
  oscFloat("bpm", 124),
];

let pending = packets.length;

packets.forEach((packet) => {
  socket.send(packet, 7400, "127.0.0.1", (error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }

    pending -= 1;
    if (pending === 0) {
      console.log("Sent fake OSC packets to 127.0.0.1:7400");
      socket.close();
    }
  });
});

function oscInt(address, value) {
  const buffer = Buffer.alloc(oscString(address).length + oscString(",i").length + 4);
  let offset = oscString(address).copy(buffer, 0);
  offset += oscString(",i").copy(buffer, offset);
  buffer.writeInt32BE(value, offset);
  return buffer;
}

function oscFloat(address, value) {
  const buffer = Buffer.alloc(oscString(address).length + oscString(",f").length + 4);
  let offset = oscString(address).copy(buffer, 0);
  offset += oscString(",f").copy(buffer, offset);
  buffer.writeFloatBE(value, offset);
  return buffer;
}

function oscString(value) {
  const rawLength = Buffer.byteLength(value) + 1;
  const paddedLength = Math.ceil(rawLength / 4) * 4;
  const buffer = Buffer.alloc(paddedLength);
  buffer.write(value);
  return buffer;
}
