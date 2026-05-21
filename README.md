# Ableton AV Dashboard

Local UDP-to-WebSocket bridge plus a browser AV Monitor panel for Ableton / Max for Live performance data.

## Architecture

- Max for Live sends JSON over UDP to `localhost:7400`.
- Node receives UDP packets with `dgram`.
- Node normalizes and stores the latest `avState`.
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

With the server running, send a fake UDP packet:

```sh
npm run test:udp
```

Or send JSON manually:

```sh
printf '{"transport":{"playing":true,"bpm":132,"scene":"TEST"},"signal":{"master":0.7,"peak":0.9},"sentAt":%s}' "$(date +%s000)" | nc -u -w0 localhost 7400
```

## Max for Live UDP Shape

Send JSON objects containing any partial Ableton state fields. The backend merges partial updates into the latest state.

Example:

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

`sentAt`, `timestamp`, or `timestampMs` can be included as epoch milliseconds so the server can estimate latency.
