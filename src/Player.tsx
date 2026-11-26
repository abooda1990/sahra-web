import { useRef, useState } from "react";
import { loadProgress, saveProgress } from "./progress";

type Props = {
  url: (start: number) => string;
  direct: boolean;
  duration: number;
  progressKey: string;
  series?: number;
  onEnded?: () => void;
  onClose: () => void;
};

// clock turns seconds into "1:05:09"
function clock(sec: number): string {
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600);
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  return `${h}:${m}:${String(s % 60).padStart(2, "0")}`;
}

// Player plays a movie or an episode from where the user stopped, and remembers where they are
// (every 5 seconds). It does not know which: url gives the link from a second, direct says the
// browser can seek in it (an mp4), duration is the length for our own bar (0 when not known).
// Anything else comes from ffmpeg with no length and no seeking, so a jump asks url for a new
// stream from that second.
function Player({ url, direct, duration, progressKey, series, onEnded, onClose }: Props) {
  const saved = loadProgress()[progressKey];
  const [offset, setOffset] = useState(direct ? 0 : Math.floor(saved?.time ?? 0));
  const [now, setNow] = useState(offset);
  const lastSave = useRef(0);
  const dragging = useRef(false);
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  // jump starts a new stream at `to`. The same offset means the same link, so load() asks again.
  function jump(to: number) {
    dragging.current = false;
    if (to === offset) video.current?.load();
    else setOffset(to);
  }

  function mute() {
    const v = video.current;
    if (v) v.muted = !v.muted;
  }

  function changeVolume(value: number) {
    const v = video.current;
    if (!v) return;
    v.volume = value;
    v.muted = value === 0;
  }

  function toggle() {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  }

  // fullscreen on the whole player (not only the video) so our bar stays visible
  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else box.current?.requestFullscreen();
  }

  function save(video: HTMLVideoElement, at: boolean) {
    const real = offset + video.currentTime;
    if (!dragging.current) setNow(real);

    if (!at && Date.now() - lastSave.current < 5000) return;
    lastSave.current = Date.now();
    saveProgress(progressKey, real, direct ? video.duration : duration, series);
  }

  function resume(video: HTMLVideoElement) {
    if (direct && saved) video.currentTime = saved.time;
  }

  return (
    <div className="player" ref={box}>
      <button className="player-back" onClick={onClose}>
        ← Back
      </button>
      <video
        ref={video}
        src={url(offset)}
        controls={direct}
        autoPlay
        onClick={direct ? undefined : toggle}
        onLoadedMetadata={(e) => resume(e.currentTarget)}
        onTimeUpdate={(e) => save(e.currentTarget, false)}
        onPlay={() => setPaused(false)}
        onPause={(e) => {
          setPaused(true);
          save(e.currentTarget, true);
        }}
        onEnded={onEnded}
        onVolumeChange={(e) => {
          setVolume(e.currentTarget.volume);
          setMuted(e.currentTarget.muted);
        }}
      />
      {!direct && (
        <div className="seek">
          <button onClick={toggle}>{paused ? "▶" : "❚❚"}</button>
          <span>{clock(now)}</span>
          {duration > 0 && (
            <>
              <input
                type="range"
                min={0}
                max={duration}
                value={now}
                onChange={(e) => setNow(Number(e.target.value))}
                onPointerDown={() => (dragging.current = true)}
                onPointerUp={() => jump(Math.floor(now))}
                onKeyUp={() => jump(Math.floor(now))}
              />
              <span>{clock(duration)}</span>
            </>
          )}
          <button onClick={mute}>{muted || volume === 0 ? "🔇" : "🔊"}</button>
          <input
            className="volume"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
          />
          <button onClick={fullscreen}>⛶</button>
        </div>
      )}
    </div>
  );
}

export default Player;
