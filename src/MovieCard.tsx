import { posterUrl, type Account, type Movie } from "./api";
import Poster from "./Poster";
import type { Progress } from "./progress";

type Props = {
  account: Account;
  movie: Movie;
  progress?: Progress;
  onSelect: (movie: Movie) => void;
};

// MovieCard is a movie's poster as a button, with a bar for how much of it was watched
function MovieCard({ account, movie, progress, onSelect }: Props) {
  return (
    <button className="poster-button" onClick={() => onSelect(movie)}>
      <Poster
        name={movie.name}
        sources= {[movie.stream_icon, posterUrl(account, movie)]}
      />
      {progress && (
        <div className="progress">
          <div style={{ width: `${(progress.time / progress.duration) * 100}%` }} />
        </div>
      )}
    </button>
  );
}

export default MovieCard;
