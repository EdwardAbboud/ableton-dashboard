import React from "react";
import { MeterRow } from "./MeterRow.jsx";

export function SignalTab({ signal }) {
  const rows = [
    ["Master", signal.master],
    ["Peak", signal.peak],
    ["RMS", signal.rms],
    ["Bass", signal.bass],
    ["Mid", signal.mid],
    ["High", signal.high],
  ];

  return (
    <div className="av-section">
      {rows.map(([label, value]) => (
        <MeterRow key={label} label={label} value={value} />
      ))}
      {signal.clipping ? <div className="av-warning">Clipping</div> : null}
    </div>
  );
}
