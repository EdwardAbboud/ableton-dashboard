import React from "react";
import { AVPanel } from "./components/AVPanel.jsx";
import { useAbletonSocket } from "./useAbletonSocket.js";

export default function App() {
  const { avState } = useAbletonSocket("ws://localhost:3001");

  return (
    <main className="av-app">
      <div className="av-visual-placeholder" aria-label="Future visual output area" />
      <AVPanel avState={avState} />
    </main>
  );
}
