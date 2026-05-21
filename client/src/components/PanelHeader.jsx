import React from "react";

export function PanelHeader({ avState, onMinimize }) {
  const connected = Boolean(avState.connection.connected);

  return (
    <header className="av-panel-header">
      <div className="av-header-copy">
        <h1 className="av-title">AV Monitor</h1>
        <div className="av-connection">
          <span className={`av-status-dot${connected ? " av-is-connected" : ""}`} />
          <span>{connected ? "Connected" : "Offline"}</span>
        </div>
      </div>
      <button className="av-icon-button" type="button" aria-label="Minimize AV Monitor" onClick={onMinimize}>
        -
      </button>
    </header>
  );
}
