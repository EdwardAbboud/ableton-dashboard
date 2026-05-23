import { useEffect, useRef, useState } from "react";

export function useLiveStopwatch(playing) {
  const startTimeRef = useRef(null);
  const frameRef = useRef(null);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!playing) {
      startTimeRef.current = null;
      setElapsedMs(0);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      return undefined;
    }

    startTimeRef.current = performance.now();

    function update() {
      setElapsedMs(performance.now() - startTimeRef.current);
      frameRef.current = requestAnimationFrame(update);
    }

    frameRef.current = requestAnimationFrame(update);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [playing]);

  return elapsedMs;
}
