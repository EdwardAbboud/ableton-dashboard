const dgram = require("dgram");

function createUdpReceiver({ port = 7400, host = "127.0.0.1", onState, onInvalid }) {
  const socket = dgram.createSocket("udp4");

  socket.on("message", (buffer) => {
    try {
      const message = parseUdpPayload(buffer);
      onState(message);
    } catch (error) {
      const raw = buffer.toString("utf8").replace(/\0/g, "").trim();
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

function parseUdpPayload(buffer) {
  const raw = buffer.toString("utf8").replace(/\0/g, "").trim();

  if (raw.startsWith("{")) {
    const message = JSON.parse(raw);
    if (!message || typeof message !== "object" || Array.isArray(message)) {
      throw new Error("UDP JSON payload must be an object");
    }

    return message;
  }

  const oscMessage = parseOscMessage(buffer);
  if (oscMessage) return oscMessage;

  const textMessage = parseTextMessage(raw);
  if (textMessage) return textMessage;

  throw new Error(`Unsupported UDP payload: ${raw || "<binary>"}`);
}

function parseOscMessage(buffer) {
  if (buffer.toString("utf8", 0, 7) === "#bundle") return null;

  const address = readOscString(buffer, 0);
  if (!address || !address.value) return null;

  const typeTag = readOscString(buffer, address.nextOffset);
  if (!typeTag || !typeTag.value.startsWith(",")) return null;

  let offset = typeTag.nextOffset;
  const values = [];

  for (const type of typeTag.value.slice(1)) {
    if (type === "i") {
      if (offset + 4 > buffer.length) return null;
      values.push(buffer.readInt32BE(offset));
      offset += 4;
    } else if (type === "f") {
      if (offset + 4 > buffer.length) return null;
      values.push(buffer.readFloatBE(offset));
      offset += 4;
    } else if (type === "s") {
      const stringValue = readOscString(buffer, offset);
      if (!stringValue) return null;
      values.push(stringValue.value);
      offset = stringValue.nextOffset;
    } else if (type === "T") {
      values.push(true);
    } else if (type === "F") {
      values.push(false);
    } else {
      return null;
    }
  }

  return mapFlatMessage(address.value, values.length > 1 ? values : values[0]);
}

function readOscString(buffer, offset) {
  if (offset >= buffer.length) return null;

  let end = offset;
  while (end < buffer.length && buffer[end] !== 0) end += 1;
  if (end >= buffer.length) return null;

  const value = buffer.toString("utf8", offset, end);
  const nextOffset = Math.ceil((end + 1) / 4) * 4;
  return { value, nextOffset };
}

function parseTextMessage(raw) {
  const normalizedRaw = raw.replace(/;/g, " ").trim();
  const signalTextMessage = parseSignalTextMessage(normalizedRaw);
  if (signalTextMessage) return signalTextMessage;

  const knownTextMessage = parseKnownTextMessage(normalizedRaw);
  if (knownTextMessage) return knownTextMessage;

  const match = normalizedRaw.match(/^\/?([\w./-]+)\s*[,:\s]\s*(.+)$/i);
  if (!match) return null;

  const [, key, rawValues] = match;
  const values = rawValues
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(parseTextValue);
  const value = values.length > 1 ? values : values[0];

  return mapFlatMessage(key, value);
}

function parseKnownTextMessage(raw) {
  const parts = raw.split(/[,\s]+/).filter(Boolean);
  const knownKeys = new Set([
    "bpm",
    "beat",
    "bar",
    "sixteenth",
    "position",
    "progress",
    "playing",
    "scene",
    "volume",
    "master",
    "peak",
    "rms",
    "bass",
    "mid",
    "high",
    "highs",
    "clipping",
  ]);
  const keyIndex = parts.findIndex((part) => knownKeys.has(part.replace(/^\/+/, "").replace(/:$/, "").toLowerCase()));

  if (keyIndex === -1 || parts.length <= keyIndex + 1) return null;

  const key = parts[keyIndex].replace(/^\/+/, "").replace(/:$/, "");
  const value =
    key.toLowerCase() === "scene"
      ? parts.slice(keyIndex + 1).join(" ")
      : parseTextValue(parts[keyIndex + 1]);
  return mapFlatMessage(key, value);
}

function parseSignalTextMessage(raw) {
  const parts = raw.split(/[,\s]+/).filter(Boolean);
  const signalIndex = parts.findIndex((part) => part.replace(/^\/+/, "").replace(/:$/, "").toLowerCase() === "signal");

  if (signalIndex === -1 || parts.length < signalIndex + 5) return null;

  const values = parts.slice(signalIndex + 1, signalIndex + 5).map(Number);
  if (!values.every(Number.isFinite)) return null;

  const message = mapSignalValue(values);
  console.log(
    `[udp] signal volume=${values[0].toFixed(3)} bass=${values[1].toFixed(3)} mid=${values[2].toFixed(3)} high=${values[3].toFixed(3)}`,
  );
  return message;
}

function parseTextValue(value) {
  if (/^(true|playing)$/i.test(value)) return true;
  if (/^(false|stopped)$/i.test(value)) return false;
  if (value === "1") return 1;
  if (value === "0") return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : value;
}

function mapFlatMessage(address, value) {
  const key = address.replace(/^\/+/, "").replace(/\//g, ".").toLowerCase();

  if (key === "bpm" || key === "transport.bpm") {
    return { transport: { bpm: value } };
  }

  if (key === "beat" || key === "transport.beat") {
    return { transport: { beat: value } };
  }

  if (key === "bar" || key === "transport.bar") {
    return { transport: { bar: value } };
  }

  if (key === "sixteenth" || key === "transport.sixteenth") {
    return { transport: { sixteenth: value } };
  }

  if (key === "position" || key === "transport.position") {
    return { transport: { position: value } };
  }

  if (key === "progress" || key === "transport.progress") {
    return { transport: { progress: value } };
  }

  if (key === "playing" || key === "transport.playing") {
    return { transport: { playing: value } };
  }

  if (key === "scene" || key === "transport.scene") {
    return { transport: { scene: normalizeSceneValue(value) } };
  }

  if (key === "volume" || key === "master") {
    return { signal: { master: value } };
  }

  if (key === "bass" || key === "mid" || key === "high" || key === "peak" || key === "rms") {
    return { signal: { [key]: value } };
  }

  if (key === "highs") {
    return { signal: { high: value } };
  }

  if (key === "clipping") {
    return { signal: { clipping: value } };
  }

  if (key === "signal") {
    return mapSignalValue(value);
  }

  if (key.startsWith("macro.")) {
    return { macros: { [key.slice("macro.".length)]: value } };
  }

  if (key.startsWith("macros.")) {
    return { macros: { [key.slice("macros.".length)]: value } };
  }

  if (key.startsWith("signal.")) {
    const signalKey = key.slice("signal.".length);
    return { signal: { [normalizeSignalKey(signalKey)]: value } };
  }

  throw new Error(`Unsupported UDP address: ${address}`);
}

function mapSignalValue(value) {
  if (Array.isArray(value)) {
    const [master, bass, mid, high] = value;
    return {
      signal: {
        ...(Number.isFinite(Number(master)) ? { master } : {}),
        ...(Number.isFinite(Number(bass)) ? { bass } : {}),
        ...(Number.isFinite(Number(mid)) ? { mid } : {}),
        ...(Number.isFinite(Number(high)) ? { high } : {}),
      },
    };
  }

  return Number.isFinite(Number(value)) ? { signal: { master: value } } : {};
}

function normalizeSignalKey(key) {
  if (key === "volume") return "master";
  if (key === "highs") return "high";
  return key;
}

function normalizeSceneValue(value) {
  if (Array.isArray(value)) {
    return value.join(" ");
  }

  return String(value).replace(/,/g, " ");
}

module.exports = {
  createUdpReceiver,
};
