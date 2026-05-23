import React from "react";
export function TransportTab({ transport, liveTimeMs = 0 }) {
  const rows = [
    ["Status", transport.playing ? "Playing" : "Stopped"],
    ["Live Time", formatLiveTime(liveTimeMs)],
    ["BPM", transport.bpm],
    ["Bar", transport.bar],
    ["Beat", transport.beat],
    ["Scene", transport.scene],
  ];

  return (
    <div className="av-section">
      {rows.map(([label, value]) => (
        <div className="av-data-row" key={label}>
          <span className="av-data-label">{label}</span>
          <span className="av-data-value">{value}</span>
        </div>
      ))}
    </div>
  );
}

function formatLiveTime(milliseconds) {
  const safeMilliseconds = Math.max(0, Number(milliseconds) || 0);
  const minutes = Math.floor(safeMilliseconds / 60000);
  const seconds = Math.floor((safeMilliseconds % 60000) / 1000);
  const ms = Math.floor(safeMilliseconds % 1000);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}
