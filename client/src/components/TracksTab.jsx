import React from "react";
import { MeterRow, clamp01 } from "./MeterRow.jsx";

export function TracksTab({ tracks }) {
  return (
    <div className="av-section">
      {tracks.length ? (
        tracks.map((track) => <TrackRow key={`${track.name}-${track.clip}`} track={track} />)
      ) : (
        <div className="av-empty">No tracks received</div>
      )}
    </div>
  );
}

function TrackRow({ track }) {
  return (
    <article className="av-track-row">
      <div className="av-track-top">
        <div className="av-track-name">{track.name}</div>
        <div className="av-track-value">{clamp01(track.meter).toFixed(2)}</div>
      </div>
      <div className="av-track-meter">
        <MeterRow label="" value={track.meter} />
      </div>
      <div className="av-track-meta">
        {track.muted ? <span className="av-status-label">Muted</span> : null}
        {track.soloed ? <span className="av-status-label">Solo</span> : null}
        {track.armed ? <span className="av-status-label">Armed</span> : null}
        {track.clip ? <span className="av-clip">{track.clip}</span> : null}
      </div>
    </article>
  );
}
