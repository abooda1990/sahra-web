import { getSeriesInfo, type Account, type Episode, type Series } from "./api";
import { useState, useEffect } from "react";

type Props = { account: Account; series: Series; onClose: () => void };

//minutes gives an episode's length as "43"min, or "" when the provider does not know it
function minutes(episode: Episode): string {
  const secs = episode.info?.duration_secs;
  return secs ? `${Math.round(secs / 60)} min` : "";
}

function SeriesDetails({ account, series, onClose }: Props) {
  const [episodes, setEpisodes] = useState<Record<string, Episode[]> | null>(
    null,
  );
  const [season, setSeason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    getSeriesInfo(account, series)
      .then((data) => {
        if (!ignore) {
          setEpisodes(data.episodes);
          setSeason(Object.keys(data.episodes)[0] ?? "");
        }
      })

      .catch((err) => {
        if (!ignore)
          setError(err instanceof Error ? err.message : "Could not load");
      });
    return () => {
      ignore = true;
    };
  }, [account, series]);

  // the keys are season numbers, and JavaScript keeps number-like keys in order: "1", "2", ..., "10"
  const seasons = episodes ? Object.keys(episodes) : [];
  const list = episodes?.[season] ?? [];
  const rating = Number(series.rating);
  const meta = [
    series.releaseDate?.slice(0, 4),
    series.genre,
    rating > 0 ? `★ ${rating}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

      return (
    <div className="details" style={{ backgroundImage: `url(${series.cover})` }}>
      <button className="details-back" onClick={onClose}>
        ← Back
      </button>
      <div className="details-body">
        <img className="poster" src={series.cover} alt={series.name} />
        <div>
          <h1 dir="auto">{series.name}</h1>
          <p className="details-meta">{meta}</p>
          {series.plot && <p dir="auto">{series.plot}</p>}
          {series.cast && (
            <p dir="auto">
              <b>Cast:</b> {series.cast}
            </p>
          )}
          {error && <p>{error}</p>}
          {!episodes && !error && <p>Loading...</p>}
          {seasons.length > 1 && (
            <div className="copies">
              {seasons.map((n) => (
                <button
                  key={n}
                  className={n === season ? "copy current" : "copy"}
                  onClick={() => setSeason(n)}
                >
                  Season {n}
                </button>
              ))}
            </div>
          )}
          <ol className="episodes">
            {list.map((e) => (
              <li key={e.id}>
                <button className="episode" disabled={e.info?.video?.codec_name === "hevc"}>
                  <span>Episode {e.episode_num}</span>
                  <span>{minutes(e)}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );


}
export default SeriesDetails;