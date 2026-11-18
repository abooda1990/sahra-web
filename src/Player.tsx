import { useRef } from "react";
import { movieUrl, type Account, type Movie } from "./api";
import { loadProgress, saveProgress } from "./progress";

type Props = { account: Account; movie: Movie; onClose: () => void };

// Player plays a movie from where the user stopped, and remembers where they are (every 5 seconds)
function Player({ account, movie, onClose }: Props) {
  const lastSave = useRef(0);

  function resume(video: HTMLVideoElement) {
    const saved = loadProgress()[movie.stream_id];
    if (saved) video.currentTime = saved.time;
  }

  function save(video: HTMLVideoElement, now: boolean) {
    if (!now && Date.now() - lastSave.current < 5000) return;
    lastSave.current = Date.now();
    saveProgress(movie.stream_id, video.currentTime, video.duration);
  }

  return (
    <div className="player">
      <button className="player-back" onClick={onClose}>
        ← Back
      </button>
      <video
        src={movieUrl(account, movie)}
        controls
        autoPlay
        onLoadedMetadata={(e) => resume(e.currentTarget)}
        onTimeUpdate={(e) => save(e.currentTarget, false)}
        onPause={(e) => save(e.currentTarget, true)}
      />
    </div>
  );
}

export default Player;
