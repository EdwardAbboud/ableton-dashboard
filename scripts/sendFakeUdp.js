const dgram = require("dgram");

const socket = dgram.createSocket("udp4");

const packet = {
  sentAt: Date.now(),
  transport: {
    playing: true,
    bpm: 132,
    bar: 24,
    beat: 2,
    sixteenth: 4,
    timeSignature: "4/4",
    scene: "FAKE UDP TEST",
    progress: 0.78,
  },
  signal: {
    master: 0.68,
    peak: 0.88,
    rms: 0.58,
    bass: 0.74,
    mid: 0.46,
    high: 0.34,
    clipping: false,
  },
  tracks: [
    { name: "Kick", meter: 0.9, muted: false, soloed: false, armed: false, clip: "Drop Kick Loop" },
    { name: "Bass", meter: 0.7, muted: false, soloed: false, armed: false, clip: "Bass A" },
    { name: "Vocal", meter: 0.48, muted: false, soloed: false, armed: true, clip: "Vocal Chop" },
  ],
  macros: {
    intensity: 0.82,
    color: 0.35,
    motion: 0.64,
    particles: 0.92,
    glow: 0.54,
    strobe: 0.16,
    scene: 0.72,
    manual: 0,
  },
  debug: {
    fps: 60,
  },
};

const message = Buffer.from(JSON.stringify(packet));

socket.send(message, 7400, "127.0.0.1", (error) => {
  if (error) {
    console.error(error);
    process.exitCode = 1;
  } else {
    console.log("Sent fake UDP packet to 127.0.0.1:7400");
  }

  socket.close();
});
