import { getSeriesInfo, type Account, type Episode, type Series } from "./api";
import { useState, useEffect } from "react";
import { episodeKey, loadProgress } from "./progress";

type Props = {
  account: Account;
  series: Series;
  onPlay: (episode: Episode, all: Episode[]) => void;
  onClose: () => void;
};

//minutes gives an episode's length as "43"min, or "" when the provider does not know it
function minutes(episode: Episode): string {
  const secs = episode.info?.duration_secs;
  return secs ? `${Math.round(secs / 60)} min` : "";
}

// lastWatched is the episode the user watched most recently (undefined when none was started)
function lastWatched(list: Episode[]): Episode | undefined {
  const progress = loadProgress();
  let last: Episode | undefined;
  for (const e of list) {
    const p = progress[episodeKey(e.id)];
    if (p && (!last || p.at > progress[episodeKey(last.id)].at)) last = e;
  }
  return last;
}

function SeriesDetails({ account, series, onPlay, onClose }: Props) {
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
          const last = lastWatched(Object.values(data.episodes).flat());
          setEpisodes(data.episodes);
          setSeason(
            last ? String(last.season) : (Object.keys(data.episodes)[0] ?? ""),
          );
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
  // playable: every episode of every season in order, without the ones a browser can't play,
  // so the next one after the last of a season is the first of the next season
  const playable = episodes
    ? Object.values(episodes)
        .flat()
        .filter((e) => e.info?.video?.codec_name !== "hevc")
    : [];
  const progress = loadProgress();
  const resume = lastWatched(playable);
  const first = resume ?? playable[0];

  const rating = Number(series.rating);
  const meta = [
    series.releaseDate?.slice(0, 4),
    series.genre,
    rating > 0 ? `★ ${rating}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className="details"
      style={{ backgroundImage: `url(${series.cover})` }}
    >
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
          {first && (
            <button className="play" onClick={() => onPlay(first, playable)}>
              ▶ {resume ? "Resume" : "Play"} S{first.season} · E
              {first.episode_num}
            </button>
          )}

          <ol className="episodes">
            {list.map((e) => (
              <li key={e.id}>
                <button
                  className="episode"
                  disabled={e.info?.video?.codec_name === "hevc"}
                  onClick={() => onPlay(e, playable)}
                >
                  <span>Episode {e.episode_num}</span>
                  <span>{minutes(e)}</span>
                  {progress[episodeKey(e.id)] && (
                    <div className="progress">
                      <div
                        style={{
                          width: `${(progress[episodeKey(e.id)].time / progress[episodeKey(e.id)].duration) * 100}%`,
                        }}
                      />
                    </div>
                  )}
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
