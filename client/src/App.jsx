import React, { useEffect, useMemo, useState } from "react";
import { AVPanel } from "./components/AVPanel.jsx";
import { useAbletonSocket } from "./useAbletonSocket.js";
import { defaultVisualMacros } from "./visualMacros.js";

const VISUAL_MACROS_STORAGE_KEY = "av-monitor.visualMacros";

export default function App() {
  const { avState } = useAbletonSocket("ws://localhost:3001");
  const [visualMacros, setVisualMacros] = useState(loadVisualMacros);
  const visualState = useMemo(
    () => ({
      ableton: avState,
      visualMacros,
    }),
    [avState, visualMacros],
  );

  useEffect(() => {
    localStorage.setItem(VISUAL_MACROS_STORAGE_KEY, JSON.stringify(visualMacros));
  }, [visualMacros]);

  return (
    <main className="av-app">
      <div className="av-visual-placeholder" aria-label="Future visual output area" />
      <AVPanel avState={visualState.ableton} visualMacros={visualState.visualMacros} onVisualMacrosChange={setVisualMacros} />
    </main>
  );
}

function loadVisualMacros() {
  try {
    const savedMacros = JSON.parse(localStorage.getItem(VISUAL_MACROS_STORAGE_KEY));
    if (!savedMacros || typeof savedMacros !== "object" || Array.isArray(savedMacros)) {
      return defaultVisualMacros;
    }

    return {
      ...defaultVisualMacros,
      ...savedMacros,
    };
  } catch {
    return defaultVisualMacros;
  }
}
