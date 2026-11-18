import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  getCategories,
  getGenres,
  getMovies,
  type Account,
  type Category,
  type Genres,
  type Movie,
} from "./api";
import Row from "./Row";
import Details from "./Details";
import Player from "./Player";
import { genreName, lastGenres } from "./genres";
import Poster from "./Poster";
import { loadProgress } from "./progress";
import Grid from "./Grid";

type Props = { account: Account; query: string };

function Home({ account, query }: Props) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [genres, setGenres] = useState<Genres>({});
  const [selected, setSelected] = useState<Movie | null>(null);
  const [playing, setPlaying] = useState<Movie | null>(null);
  const [error, setError] = useState("");
  const searched = useDeferredValue(query);
  const [expanded, setExpanded] = useState<{
    title: string;
    movies: Movie[];
  } | null>(null);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      getMovies(account),
      getCategories(account),
      getGenres(account),
    ])
      .then(([m, c, g]) => {
        if (!ignore) {
          setMovies(m);
          setCategories(c);
          setGenres(g);
        }
      })
      .catch((err) => {
        if (!ignore)
          setError(err instanceof Error ? err.message : "Could not load");
      });
    return () => {
      ignore = true;
    };
  }, [account]);

  const newest = useMemo(
    () => [...movies].sort((a, b) => Number(b.added) - Number(a.added)),
    [movies],
  );

  // movieById finds a movie by its stream_id fast (for the movies in progress)
  const movieById = useMemo(
    () => new Map(movies.map((m) => [m.stream_id, m])),
    [movies],
  );

  const byCategory = useMemo(() => {
    const groups = new Map<string, Movie[]>();
    for (const m of newest) {
      const group = groups.get(m.category_id);
      if (group) {
        group.push(m);
      } else {
        groups.set(m.category_id, [m]);
      }
    }
    return groups;
  }, [newest]);
  // byGenre: one row per genre, the biggest first. A movie with two genres is in both rows;
  // one with none (or newer than genres.json) is in "Other" (id 0). Empty when there are no genres.

  const byGenre = useMemo(() => {
    const groups = new Map<number, Movie[]>();
    if (Object.keys(genres).length === 0) return [];
    for (const m of newest) {
      const ids = genres[String(m.stream_id)] ?? [];
      for (const id of ids.length > 0 ? ids : [0]) {
        const group = groups.get(id);
        if (group) {
          group.push(m);
        } else {
          groups.set(id, [m]);
        }
      }
    }
    return [...groups].sort((a, b) => {
      const lastA = lastGenres.indexOf(a[0]);
      const lastB = lastGenres.indexOf(b[0]);
      if (lastA !== lastB) return lastA - lastB;
      return b[1].length - a[1].length;
    });
  }, [newest, genres]);

  const results = useMemo(() => {
    const q = searched.trim().toLocaleLowerCase();
    if (q === "") return [];
    return newest
      .filter((m) => m.name.toLocaleLowerCase().includes(q))
      .slice(0, 60);
  }, [newest, searched]);

  if (playing) {
    return (
      <Player
        account={account}
        movie={playing}
        onClose={() => setPlaying(null)}
      />
    );
  }

  if (selected) {
    return (
      <Details
        account={account}
        movie={selected}
        onPlay={() => setPlaying(selected)}
        onClose={() => setSelected(null)}
      />
    );
  }

  if (error) return <p>{error}</p>;
  if (categories.length === 0) return <p>Loading...</p>;

    if (expanded && query.trim() === "") {
    return (
      <Grid
        account={account}
        title={expanded.title}
        movies={expanded.movies}
        onSelect={setSelected}
        onClose={() => setExpanded(null)}
      />
    );
  }


  const watching = Object.entries(loadProgress())
    .sort((a, b) => b[1].at - a[1].at)
    .map(([id]) => movieById.get(Number(id)))
    .filter((m) => m !== undefined);

  // seeAll opens one row as a full grid, from the top of the page
  function seeAll(title: string, list: Movie[]) {
    setExpanded({ title, movies: list });
    window.scrollTo(0, 0);
  }

  const rows =
    byGenre.length > 0
      ? byGenre.map(([id, inGenre]) => (
          <Row
            account={account}
            key={id}
            title={genreName(id)}
            movies={inGenre.slice(0, 20)}
            onSelect={setSelected}
            onSeeAll={() => seeAll(genreName(id), inGenre)}
          />
        ))
      : categories.map((c) => {
          const inCategory = byCategory.get(c.category_id);
          if (!inCategory) return null;
          return (
            <Row
              account={account}
              key={c.category_id}
              title={c.category_name}
              movies={inCategory.slice(0, 20)}
              onSelect={setSelected}
              onSeeAll={() => seeAll(c.category_name, inCategory)}
            />
          );
        });

  return (
    <main>
      {query.trim() === "" ? (
        <>
          {watching.length > 0 && (
            <Row
              account={account}
              title="Continue watching"
              movies={watching}
              onSelect={setPlaying}
            />
          )}
          {rows}
        </>
      ) : (
        <div className="results">
          {results.map((m) => (
            <button
              key={m.stream_id}
              className="poster-button"
              onClick={() => setSelected(m)}
            >
              <Poster account={account} movie={m} />
            </button>
          ))}
          {results.length === 0 && <p>No movies found</p>}
        </div>
      )}
    </main>
  );
}

export default Home;
