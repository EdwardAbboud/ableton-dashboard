import React from "react";

const macroRows = [
  ["intensity", "Intensity"],
  ["color", "Color"],
  ["motion", "Motion"],
  ["particles", "Particles"],
  ["glow", "Glow"],
  ["strobe", "Strobe"],
  ["sceneBlend", "Scene Blend"],
  ["manual", "Manual"],
];

export function MacrosTab({ visualMacros, onChange }) {
  return (
    <div className="av-section">
      {macroRows.map(([name, label]) => (
        <MacroSlider
          key={name}
          label={label}
          value={visualMacros[name]}
          onChange={(value) => {
            onChange((current) => ({
              ...current,
              [name]: value,
            }));
          }}
        />
      ))}
    </div>
  );
}

function MacroSlider({ label, value, onChange }) {
  const safeValue = clamp01(value);

  return (
    <label className="av-macro-control">
      <span className="av-macro-top">
        <span className="av-macro-label">{label}</span>
        <span className="av-macro-value">{Math.round(safeValue * 100)}%</span>
      </span>
      <input
        className="av-macro-slider"
        type="range"
        min="0"
        max="1"
        step="0.001"
        value={safeValue}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function clamp01(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(1, number));
}
