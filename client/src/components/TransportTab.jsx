import React from "react";
import { MeterRow, clamp01 } from "./MeterRow.jsx";

export function TransportTab({ transport }) {
  const rows = [
    ["Status", transport.playing ? "Playing" : "Stopped"],
    ["BPM", transport.bpm],
    ["Bar", transport.bar],
    ["Beat", transport.beat],
    ["Sixteenth", transport.sixteenth],
    ["Signature", transport.timeSignature],
    ["Scene", transport.scene],
    ["Progress", `${Math.round(clamp01(transport.progress) * 100)}%`],
  ];

  return (
    <div className="av-section">
      {rows.map(([label, value]) => (
        <div className="av-data-row" key={label}>
          <span className="av-data-label">{label}</span>
          <span className="av-data-value">{value}</span>
        </div>
      ))}
      <MeterRow label="Progress" value={transport.progress} format="percent" />
    </div>
  );
}
