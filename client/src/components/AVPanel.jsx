import React, { useEffect, useState } from "react";
import { TransportTab } from "./TransportTab.jsx";
import { SignalTab } from "./SignalTab.jsx";
import { MacrosTab } from "./MacrosTab.jsx";
import { DebugTab } from "./DebugTab.jsx";
import { PanelHeader } from "./PanelHeader.jsx";
import { TabNav } from "./TabNav.jsx";
import { CollapsedHandle } from "./CollapsedHandle.jsx";
import { mockAvState } from "../mockAvState.js";
import { useLiveStopwatch } from "../useLiveStopwatch.js";

export function AVPanel({ avState, visualMacros, onVisualMacrosChange }) {
  const state = normalizePanelState(avState);
  const [activeTab, setActiveTab] = useState("Transport");
  const [minimized, setMinimized] = useState(false);
  const [panelWidth, setPanelWidth] = useState(324);
  const [resizing, setResizing] = useState(false);
  const liveTimeMs = useLiveStopwatch(Boolean(state.transport.playing));

  useEffect(() => {
    if (!resizing) return undefined;

    function handlePointerMove(event) {
      const nextWidth = window.innerWidth - event.clientX;
      setPanelWidth(Math.max(324, Math.min(window.innerWidth, nextWidth)));
    }

    function handlePointerUp() {
      setResizing(false);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [resizing]);

  if (minimized) {
    return <CollapsedHandle avState={state} onOpen={() => setMinimized(false)} />;
  }

  return (
    <aside className={`av-panel${resizing ? " av-is-resizing" : ""}`} style={{ "--av-panel-width": `${panelWidth}px` }} aria-label="AV Monitor">
      <div
        className="av-resize-handle"
        role="separator"
        aria-label="Resize AV Monitor"
        aria-orientation="vertical"
        onPointerDown={(event) => {
          event.preventDefault();
          setResizing(true);
        }}
      />
      <PanelHeader avState={state} onMinimize={() => setMinimized(true)} />
      <TabNav activeTab={activeTab} onChange={setActiveTab} />
      <section className="av-panel-body">{renderTab(activeTab, state, liveTimeMs, visualMacros, onVisualMacrosChange)}</section>
    </aside>
  );
}

function renderTab(activeTab, avState, liveTimeMs, visualMacros, onVisualMacrosChange) {
  switch (activeTab) {
    case "Signal":
      return <SignalTab signal={avState.signal} />;
    case "Macros":
      return <MacrosTab visualMacros={visualMacros} onChange={onVisualMacrosChange} />;
    case "Debug":
      return <DebugTab avState={avState} />;
    case "Transport":
    default:
      return <TransportTab transport={avState.transport} liveTimeMs={liveTimeMs} />;
  }
}

function normalizePanelState(avState = {}) {
  const nextState = avState && typeof avState === "object" ? avState : {};

  return {
    ...mockAvState,
    ...nextState,
    connection: {
      ...mockAvState.connection,
      ...nextState.connection,
    },
    transport: {
      ...mockAvState.transport,
      ...nextState.transport,
    },
    signal: {
      ...mockAvState.signal,
      ...nextState.signal,
    },
    tracks: Array.isArray(nextState.tracks) ? nextState.tracks : mockAvState.tracks,
    macros: {
      ...mockAvState.macros,
      ...nextState.macros,
    },
    debug: {
      ...mockAvState.debug,
      ...nextState.debug,
    },
  };
}
