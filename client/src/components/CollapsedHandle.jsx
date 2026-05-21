import React from "react";

export function CollapsedHandle({ avState, onOpen }) {
  return (
    <button className="av-collapsed-handle" type="button" aria-label="Open AV Monitor" onClick={onOpen}>
      <span className="av-handle-label">AV</span>
      <span className={`av-status-dot${avState.connection.connected ? " av-is-connected" : ""}`} />
      <span className="av-handle-bpm">{avState.transport.bpm} BPM</span>
    </button>
  );
}
