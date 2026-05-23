# Ableton AV Dashboard

Local UDP-to-WebSocket bridge plus a browser AV Monitor panel for Ableton / Max for Live performance data.

## Architecture

- Max for Live sends UDP/OSC-style messages to `localhost:7400`.
- Node receives UDP packets with `dgram`.
- Node parses those packets, normalizes them, and stores the latest `avState`.
- Node broadcasts `avState` to browsers over WebSocket on `ws://localhost:3001`.
- React + Vite renders the fixed right-side AV Monitor panel.

## Setup

```sh
npm install
```

## Run

Start the backend:

```sh
npm run server
```

Start the frontend in another terminal:

```sh
npm run client
```

Open the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

## Test Without Ableton

With the server running, send a fake normalized JSON packet:

```sh
npm run test:udp
```

To test Max-style OSC packets for `bar`, `beat`, and `bpm`:

```sh
npm run test:osc
```

Or send a simple text UDP message manually:

```sh
printf 'bpm 132' | nc -u -w0 localhost 7400
```

## Max for Live UDP Shape

Max for Live does not need to send JSON. Send simple OSC messages, and the Node bridge converts them into the normalized `avState` object used by the browser.

Recommended OSC addresses:

```text
/bpm        float
/bar        int
/beat       int
/sixteenth  int
/position   float raw Ableton current_song_time / beat position
/progress   float normalized 0..1, optional
/playing    int 0|1
/scene      string
```

Macro values can be sent as:

```text
/macros/intensity  float 0..1
/macros/color      float 0..1
/macros/motion     float 0..1
/macros/particles  float 0..1
/macros/glow       float 0..1
/macros/strobe     float 0..1
/macros/scene      float 0..1
/macros/manual     float 0..1
```

Signal values can be sent as:

```text
/signal          float float float float
/signal/volume   float 0..1
/signal/master   float 0..1
/signal/bass     float 0..1
/signal/mid      float 0..1
/signal/high     float 0..1
/signal/highs    float 0..1
/volume          float 0..1
/bass            float 0..1
/mid             float 0..1
/high            float 0..1
/peak            float 0..1
/rms             float 0..1
/clipping        bool
```

For `/signal`, send values in this order: `volume`, `bass`, `mid`, `high`.

Internally, the server broadcasts this normalized browser state over WebSocket:

```json
{
  "transport": {
    "playing": true,
    "bpm": 128,
    "bar": 12,
    "beat": 3,
    "sixteenth": 2,
    "timeSignature": "4/4",
    "scene": "DROP 1",
    "position": 12.375,
    "progress": 0.62
  },
  "signal": {
    "master": 0.72,
    "peak": 0.91,
    "rms": 0.64,
    "bass": 0.82,
    "mid": 0.45,
    "high": 0.31,
    "clipping": false
  },
  "tracks": [
    {
      "name": "Kick",
      "meter": 0.91,
      "muted": false,
      "soloed": false,
      "armed": false,
      "clip": "Drop Kick Loop"
    }
  ],
  "macros": {
    "intensity": 0.75,
    "color": 0.2,
    "motion": 0.5,
    "particles": 0.9,
    "glow": 0.4,
    "strobe": 0.1,
    "scene": 0.6,
    "manual": 0
  },
  "sentAt": 1716300000000
}
```

JSON packets are still accepted for local testing or custom tools, but Max for Live should send OSC/simple UDP values and let the Node bridge normalize them.
