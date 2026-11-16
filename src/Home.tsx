import { useEffect, useMemo, useState } from "react";
import {
  getCategories,
  getMovies,
  type Account,
  type Category,
  type Movie,
} from "./api";
import Row from "./Row";
import Details from "./Details";
import Player from "./Player";

type Props = { account: Account };

function Home({ account }: Props) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<Movie | null>(null);
  const [playing , setPlaying]= useState<Movie | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    Promise.all([getMovies(account), getCategories(account)])
      .then(([m, c]) => {
        if (!ignore) {
          setMovies(m);
          setCategories(c);
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

  const byCategory = useMemo(() => {
    const groups = new Map<string, Movie[]>();
    for (const m of movies) {
      const group = groups.get(m.category_id);
      if (group) {
        group.push(m);
      } else {
        groups.set(m.category_id, [m]);
      }
    }
    return groups;
  }, [movies]);

  if (playing) {
    return <Player account={account} movie={playing} onClose={()=>setPlaying(null)}/>
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

  return (
    <main>
      {categories.map((c) => {
        const inCategory = byCategory.get(c.category_id);
        if (!inCategory) return null;
        return (
          <Row
            key={c.category_id}
            title={c.category_name}
            movies={inCategory.slice(0, 20)}
            onSelect={setSelected}
          />
        );
      })}
    </main>
  );
}

export default Home;
