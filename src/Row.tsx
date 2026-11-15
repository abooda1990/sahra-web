import { type Movie } from "./api";

type Props = { title: string; movies: Movie[] ; onSelect : (movie: Movie) => void};

//Row is one category: its name, then its posters side by side

function Row({ title, movies , onSelect}: Props) {
  return (
    <section className="row">
      <h2>{title}</h2>

      <div className="row-posters">
        {movies.map((movie) => (
          <button key={movie.stream_id} className="poster-button" onClick={()=> onSelect(movie)}>
            <img
              className="poster"
              src={movie.stream_icon}
              alt={movie.name}
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </section>
  ); 
}

export default Row;
