import React from "react";

const tabs = ["Transport", "Signal", "Tracks", "Macros", "Debug"];

export function TabNav({ activeTab, onChange }) {
  return (
    <nav className="av-tab-nav" aria-label="AV Monitor sections">
      {tabs.map((tab) => (
        <button
          className={`av-tab${tab === activeTab ? " av-is-active" : ""}`}
          type="button"
          key={tab}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}
