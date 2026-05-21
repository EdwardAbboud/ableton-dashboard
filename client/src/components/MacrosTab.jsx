import React from "react";
import { MeterRow } from "./MeterRow.jsx";

const macroNames = ["intensity", "color", "motion", "particles", "glow", "strobe", "scene", "manual"];

export function MacrosTab({ macros }) {
  return (
    <div className="av-section">
      {macroNames.map((name) => (
        <MeterRow key={name} label={toTitleCase(name)} value={macros[name]} format="percent" />
      ))}
    </div>
  );
}

function toTitleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
