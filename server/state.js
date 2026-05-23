const ABLETON_TIMEOUT_MS = 3000;

const initialAvState = {
  connection: {
    connected: false,
    lastPacketMs: 0,
    droppedPackets: 0,
    latencyMs: 0,
  },
  transport: {
    playing: true,
    bpm: 128,
    bar: 12,
    beat: 3,
    sixteenth: 2,
    timeSignature: "4/4",
    scene: "DROP 1",
    position: 0,
    progress: null,
  },
  signal: {
    master: 0.72,
    peak: 0.91,
    rms: 0.64,
    bass: 0.82,
    mid: 0.45,
    high: 0.31,
    clipping: false,
  },
  tracks: [],
  macros: {
    intensity: 0.75,
    color: 0.2,
    motion: 0.5,
    particles: 0.9,
    glow: 0.4,
    strobe: 0.1,
    scene: 0.6,
    manual: 0,
  },
  debug: {
    fps: 60,
    websocket: "inactive",
    ableton: "disconnected",
  },
};

let avState = clone(initialAvState);
let lastPacketAt = 0;

function getState() {
  refreshConnectionStatus();
  return clone(avState);
}

function mergeIncomingState(message) {
  const now = Date.now();
  lastPacketAt = now;

  const latencyMs = getLatencyMs(message, now);
  const nextConnection = sanitizeObject(message.connection);

  avState = {
    ...avState,
    connection: {
      ...avState.connection,
      ...pickKnown(nextConnection, ["droppedPackets"]),
      connected: true,
      lastPacketMs: 0,
      latencyMs:
        latencyMs ??
        (nextConnection.latencyMs === undefined
          ? avState.connection.latencyMs
          : normalizeValue("latencyMs", nextConnection.latencyMs)),
    },
    transport: {
      ...avState.transport,
      ...pickKnown(sanitizeObject(message.transport), [
        "playing",
        "bpm",
        "bar",
        "beat",
        "sixteenth",
        "timeSignature",
        "scene",
        "position",
        "progress",
      ]),
    },
    signal: {
      ...avState.signal,
      ...pickKnown(sanitizeObject(message.signal), [
        "master",
        "peak",
        "rms",
        "bass",
        "mid",
        "high",
        "clipping",
      ]),
    },
    tracks: Array.isArray(message.tracks) ? message.tracks.map(normalizeTrack) : avState.tracks,
    macros: {
      ...avState.macros,
      ...pickKnown(sanitizeObject(message.macros), [
        "intensity",
        "color",
        "motion",
        "particles",
        "glow",
        "strobe",
        "scene",
        "manual",
      ]),
    },
    debug: {
      ...avState.debug,
      ...pickKnown(sanitizeObject(message.debug), ["fps", "websocket", "ableton"]),
      ableton: "connected",
    },
  };

  return getState();
}

function markInvalidPacket() {
  avState = {
    ...avState,
    connection: {
      ...avState.connection,
      droppedPackets: avState.connection.droppedPackets + 1,
    },
  };

  return getState();
}

function setWebSocketStatus(status) {
  avState = {
    ...avState,
    debug: {
      ...avState.debug,
      websocket: status,
    },
  };
}

function refreshConnectionStatus() {
  if (!lastPacketAt) {
    avState.connection.connected = false;
    avState.debug.ableton = "disconnected";
    return;
  }

  const lastPacketMs = Date.now() - lastPacketAt;
  const connected = lastPacketMs <= ABLETON_TIMEOUT_MS;
  avState.connection.lastPacketMs = lastPacketMs;
  avState.connection.connected = connected;
  avState.debug.ableton = connected ? "connected" : "stale";
}

function getLatencyMs(message, now) {
  const sentAt = message.sentAt ?? message.timestampMs ?? message.timestamp;
  const numericSentAt = Number(sentAt);

  if (Number.isFinite(numericSentAt) && numericSentAt > 0) {
    return Math.max(0, now - numericSentAt);
  }

  if (Number.isFinite(Number(message.latencyMs))) {
    return Math.max(0, Number(message.latencyMs));
  }

  return null;
}

function normalizeTrack(track) {
  const safeTrack = sanitizeObject(track);
  return {
    name: String(safeTrack.name ?? "Track"),
    meter: clamp01(safeTrack.meter),
    muted: Boolean(safeTrack.muted),
    soloed: Boolean(safeTrack.soloed),
    armed: Boolean(safeTrack.armed),
    clip: safeTrack.clip === undefined ? "" : String(safeTrack.clip),
  };
}

function sanitizeObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value;
}

function pickKnown(source, keys) {
  return keys.reduce((picked, key) => {
    if (source[key] !== undefined) {
      picked[key] = normalizeValue(key, source[key]);
    }

    return picked;
  }, {});
}

function normalizeValue(key, value) {
  if (key === "scene" && Number.isFinite(Number(value))) {
    return clamp01(value);
  }

  if (["master", "peak", "rms", "bass", "mid", "high", "intensity", "color", "motion", "particles", "glow", "strobe", "manual"].includes(key)) {
    return clamp01(value);
  }

  if (["bpm", "bar", "beat", "sixteenth", "position", "progress", "fps", "latencyMs", "lastPacketMs", "droppedPackets"].includes(key)) {
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  if (["playing", "clipping"].includes(key)) {
    if (value === 1 || value === "1") return true;
    if (value === 0 || value === "0") return false;
    return Boolean(value);
  }

  return String(value);
}

function clamp01(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(1, number));
}

module.exports = {
  getState,
  mergeIncomingState,
  markInvalidPacket,
  setWebSocketStatus,
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
