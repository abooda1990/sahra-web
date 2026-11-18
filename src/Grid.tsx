import { useEffect, useRef, useState } from "react";
import type { Account, Movie } from "./api";
import Poster from "./Poster";

type Props = {
  account: Account;
  title: string;
  movies: Movie[];
  onSelect: (movie: Movie) => void;
  onClose: () => void;
};

const page = 40;

function Grid({ account, title, movies, onSelect, onClose }: Props) {
  const [shown, setShown] = useState(page);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const end = endRef.current;
    if (!end) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setShown((n) => n + page);
      },
      { rootMargin: "400px" },
    );
    observer.observe(end);
    return () => observer.disconnect();
  }, [shown]);

  return (
    <main>
     <div className="grid-head">
        <button className="grid-back" onClick={onClose}>
          ← Back
        </button>
        <h2 dir="auto">{title}</h2>
        <span className="grid-count">{movies.length} movies</span>
      </div>
        <div className="results">
          {movies.slice(0, shown).map((m) => (
            <button
              key={m.stream_id}
              className="poster-button"
              onClick={() => onSelect(m)}
            >
              <Poster account={account} movie={m} />
            </button>
          ))}
        </div>
        {shown < movies.length && <div ref={endRef} />}
      
    </main>
  );
}

export default Grid;
