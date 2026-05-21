import { useEffect, useMemo, useState } from "react";
import { mockAvState } from "./mockAvState.js";

const RECONNECT_MS = 1000;

export function useAbletonSocket(url) {
  const [socketState, setSocketState] = useState("disconnected");
  const [liveState, setLiveState] = useState(null);

  useEffect(() => {
    let socket;
    let reconnectTimer;
    let closedByEffect = false;

    function connect() {
      setSocketState("connecting");
      socket = new WebSocket(url);

      socket.addEventListener("open", () => {
        setSocketState("active");
      });

      socket.addEventListener("message", (event) => {
        try {
          setLiveState(JSON.parse(event.data));
        } catch {
          setSocketState("invalid-message");
        }
      });

      socket.addEventListener("close", () => {
        setSocketState("disconnected");
        if (!closedByEffect) {
          reconnectTimer = window.setTimeout(connect, RECONNECT_MS);
        }
      });

      socket.addEventListener("error", () => {
        setSocketState("error");
        socket.close();
      });
    }

    connect();

    return () => {
      closedByEffect = true;
      window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [url]);

  const avState = useMemo(() => {
    if (socketState !== "active" || !liveState) {
      return {
        ...mockAvState,
        connection: {
          ...mockAvState.connection,
          connected: false,
        },
        debug: {
          ...mockAvState.debug,
          websocket: socketState,
          ableton: "mock",
        },
      };
    }

    return {
      ...mockAvState,
      ...liveState,
      connection: {
        ...mockAvState.connection,
        ...liveState.connection,
      },
      transport: {
        ...mockAvState.transport,
        ...liveState.transport,
      },
      signal: {
        ...mockAvState.signal,
        ...liveState.signal,
      },
      tracks: liveState.tracks ?? mockAvState.tracks,
      macros: {
        ...mockAvState.macros,
        ...liveState.macros,
      },
      debug: {
        ...mockAvState.debug,
        ...liveState.debug,
        websocket: socketState,
      },
    };
  }, [liveState, socketState]);

  return {
    avState,
    socketState,
  };
}
