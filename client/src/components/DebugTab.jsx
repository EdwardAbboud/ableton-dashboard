import React from "react";

export function DebugTab({ avState }) {
  const rows = [
    ["Ableton", avState.debug.ableton],
    ["WebSocket", avState.debug.websocket],
    ["Last Packet", `${Math.round(avState.connection.lastPacketMs)} ms`],
    ["Dropped", avState.connection.droppedPackets],
    ["Latency", `${Math.round(avState.connection.latencyMs)} ms`],
    ["FPS", avState.debug.fps],
  ];

  return (
    <div className="av-section">
      {rows.map(([label, value]) => (
        <div className="av-debug-row" key={label}>
          <div className="av-debug-label">{label}</div>
          <div className="av-debug-value">{value}</div>
        </div>
      ))}
    </div>
  );
}
