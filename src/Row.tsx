import { type Movie } from "./api";
import Poster from "./Poster";
import { useRef } from "react";
import { type Account } from "./api";
import { loadProgress } from "./progress";


type Props = {
  account: Account;
  title: string;
  movies: Movie[];
  onSelect: (movie: Movie) => void;
};


//Row is one category: its name, then its posters side by side

function Row({ account, title, movies, onSelect }: Props) {

  const postersRef = useRef<HTMLDivElement>(null);

    const progress = loadProgress();


  function scroll(direction: 1 | -1) {
    const posters = postersRef.current;
    if (!posters) return;
    posters.scrollBy({ left: direction * posters.clientWidth * 0.8 });
  }

  return (
    <section className="row">
      <h2 dir="auto">{title}</h2>
      <div className="row-body">
        <button
          className="row-arrow left"
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
        >
      
          ‹
        </button>
        <div className="row-posters" ref ={postersRef}>
          {movies.map((movie) => (
            <button
              key={movie.stream_id}
              className="poster-button"
              onClick={() => onSelect(movie)}
            >
             <Poster account={account} movie={movie} />
              {progress[movie.stream_id] && (

                <div className="progress">
                  <div 
                    style={ { width : `${(progress[movie.stream_id].time / progress[movie.stream_id].duration * 100)}%`,
                  }}
                  
                  />

                </div>
              )
              }
            </button>
          ))}
        </div>
        <button
          className="row-arrow right"
          onClick={() => scroll(1)}
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </section>
  );
}

export default Row;
