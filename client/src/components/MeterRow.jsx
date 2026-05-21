import React from "react";

export function MeterRow({ label, value, format = "ratio" }) {
  const safeValue = clamp01(value);
  const displayValue = format === "percent" ? `${Math.round(safeValue * 100)}%` : safeValue.toFixed(2);

  return (
    <div className="av-meter-row">
      <div className="av-meter-label">{label}</div>
      <div className="av-meter-bar">
        <div className="av-meter-fill" style={{ "--av-value": safeValue }} />
      </div>
      <div className="av-meter-value">{displayValue}</div>
    </div>
  );
}

export function clamp01(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(1, number));
}
