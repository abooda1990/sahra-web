import { useEffect, useState } from "react";
import { getMovieInfo, movieUrl, type Account, type Movie } from "./api";
import Player from "./Player";

type Props = { account: Account; movie: Movie; onClose: () => void };

// MoviePlayer plays a movie. For one that is not an mp4 it asks the provider for its length,
// which the browser cannot know from a stream out of ffmpeg.
function MoviePlayer({ account, movie, onClose }: Props) {
  const direct = movie.container_extension === "mp4";
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (direct) return;
    let ignore = false;
    getMovieInfo(account, movie)
      .then((data) => {
        if (!ignore) setDuration(Number(data.info.duration_secs) || 0);
      })
      .catch(() => {}); // no length: the bar is not shown
    return () => {
      ignore = true;
    };
  }, [account, movie, direct]);

  return (
    <Player
      url={(start) => movieUrl(account, movie, start)}
      direct={direct}
      duration={duration}
      progressKey={String(movie.stream_id)}
      onClose={onClose}
    />
  );
}

export default MoviePlayer;
