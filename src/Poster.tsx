import { useState } from "react";
import { posterUrl, type Account, type Movie } from "./api";

type Props = { account: Account; movie: Movie };

// Poster tries the provider's image, then TMDB's (through our server), then shows the name
function Poster({ account, movie }: Props) {
  const [stage, setStage] = useState(movie.stream_icon ? 0 : 1);

  if (stage === 2) {
    return <div className="poster poster-fallback">{movie.name}</div>;
  }
  return (
    <img
      className="poster"
      src={stage === 0 ? movie.stream_icon : posterUrl(account, movie)}
      alt={movie.name}
      loading="lazy"
      onError={() => setStage(stage + 1)}
    />
  );
}

export default Poster;
