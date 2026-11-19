import { useEffect, useState } from "react";
import { getMovieInfo, type Account, type Movie, type MovieInfo } from "./api";
import { language } from "./title";

type Props = {
  account: Account;
  movie: Movie;
  copies: Movie[];
  onPick: (copy: Movie) => void;
  onPlay: () => void;
  onClose: () => void;
};

function Details({ account, movie, copies, onPick, onPlay, onClose }: Props) {
  const [info, setInfo] = useState<MovieInfo["info"] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    getMovieInfo(account, movie)
      .then((data) => {
        if (!ignore) setInfo(data.info);
      })
      .catch((err) => {
        if (!ignore)
          setError(err instanceof Error ? err.message : "Could not load");
      });
    return () => {
      ignore = true;
    };
  }, [account, movie]);

  const backdrop = info?.backdrop_path?.[0] ?? movie.stream_icon;
  const canPlay = info?.video?.codec_name !== "hevc";
  const rating = Number(info?.rating);
  const meta = [info?.year, info?.duration, rating > 0 ? ` ★ ${rating}` : ""]
    .filter(Boolean)
    .join(".");

  return (
    <div className="details" style={{ backgroundImage: `url(${backdrop})` }}>
      <button className="details-back" onClick={onClose}>
        ← Back
      </button>
      <div className="details-body">
        <img className="poster" src={movie.stream_icon} alt={movie.name} />
        <div>
          <h1 dir="auto">{movie.name}</h1>
          <p className="details-meta">{meta}</p>
          {error && <p> {error}</p>}
          {!info && !error && <p>Loading...</p>}
          {info?.plot && <p dir="auto">{info.plot}</p>}
          {info?.cast && (
            <p dir="auto">
              <b>Cast:</b> <span dir="auto">{info.cast}</span>
            </p>
          )}
          {info?.director && (
            <p>
              <b>Director:</b> {info.director}
            </p>
          )}
          {copies.length > 1 && (
            <div className="copies">
              {copies.map((c) => (
                <button
                  key={c.stream_id}
                  className={
                    c.stream_id === movie.stream_id ? "copy current" : "copy"
                  }
                  onClick={() => onPick(c)}
                >
                  {language(c.name) || "Other"} ·{" "}
                  {c.container_extension.toUpperCase()}
                </button>
              ))}
            </div>
          )}
          <button
            className="play"
            onClick={onPlay}
            disabled={!info || !canPlay}
          >
            ▶ Play
          </button>
          {info && !canPlay && (
            <p>This movie can't play in a browser (H.265).</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Details;
