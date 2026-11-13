import type { Movie } from "./api";

type Props = { title: string; movies: Movie[] };

//Row is one category: its name, then its posters side by side

function Row({ title, movies }: Props) {
  return (
    <section className="row">
      <h2>{title}</h2>
      {movies.map((movie) => (
        <img 
        key={movie.stream_id} 
        className="poster"
        src ={movie.stream_icon}
        alt={movie.name}
        loading="lazy"
        />
      ))}
    </section>
  );
}

export default Row;
