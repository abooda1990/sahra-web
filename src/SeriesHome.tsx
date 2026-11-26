import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { getSeries, getSeriesCategories, type Account, type Category, type Series } from "./api";
import Grid from "./Grid";
import Row from "./Row";
import SeriesCard from "./SeriesCard";
import SeriesDetails from "./SeriesDetails";

type View = "genre" | "category" | "year";

const views: { id: View; label: string }[] = [
  { id: "genre", label: "Genre" },
  { id: "category", label: "Category" },
  { id: "year", label: "Year" },
];

// groupBy puts each series in every group keysOf gives it, keeping the order of the list
function groupBy(list: Series[], keysOf: (series: Series) => string[]): Map<string, Series[]> {
  const groups = new Map<string, Series[]>();
  for (const s of list) {
    for (const key of keysOf(s)) {
      const group = groups.get(key);
      if (group) {
        group.push(s);
      } else {
        groups.set(key, [s]);
      }
    }
  }
  return groups;
}

// genresOf splits the provider's genre text ("Crime, Drama") into names; none gives "Other"
function genresOf(series: Series): string[] {
  const names = (series.genre ?? "")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);
  return names.length > 0 ? names : ["Other"];
}

// yearOf gives the year the series started ("2020-03-23" -> "2020"), or "Other"
function yearOf(series: Series): string[] {
  return [series.releaseDate?.match(/^\d{4}/)?.[0] ?? "Other"];
}

// otherLast is 1 for the "Other" row, so sorting by it puts that row at the bottom
function otherLast(title: string): number {
  return title === "Other" ? 1 : 0;
}

type Props = { account: Account; query: string };

// SeriesHome shows the series in rows (by genre, category or year, the user picks), the newest
// first in each row, and searches them by name
function SeriesHome({ account, query }: Props) {
  const [series, setSeries] = useState<Series[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [view, setView] = useState<View>("genre");
  const [selected,setSelected]= useState<Series | null>(null);
  const [expanded, setExpanded] = useState<{ title: string; series: Series[] } | null>(null);
  const searched = useDeferredValue(query);

  useEffect(() => {
    let ignore = false;
    Promise.all([getSeries(account), getSeriesCategories(account)])
      .then(([s, c]) => {
        if (!ignore) {
          setSeries(s);
          setCategories(c);
        }
      })
      .catch((err) => {
        if (!ignore) setError(err instanceof Error ? err.message : "Could not load");
      });
    return () => {
      ignore = true;
    };
  }, [account]);

  const newest = useMemo(
    () => [...series].sort((a, b) => Number(b.last_modified) - Number(a.last_modified)),
    [series],
  );
  


  // rows: [title, series] for each row, in the order to show them
  const rows = useMemo((): [string, Series[]][] => {
    if (view === "category") {
      const groups = groupBy(newest, (s) => [s.category_id]);
      return categories.flatMap((c): [string, Series[]][] => {
        const list = groups.get(c.category_id);
        return list ? [[c.category_name, list]] : [];
      });
    }
    if (view === "year") {
      return [...groupBy(newest, yearOf)].sort(
        (a, b) => otherLast(a[0]) - otherLast(b[0]) || Number(b[0]) - Number(a[0]),
      );
    }
    return [...groupBy(newest, genresOf)].sort(
      (a, b) => otherLast(a[0]) - otherLast(b[0]) || b[1].length - a[1].length,
    );
  }, [view, newest, categories]);

  const results = useMemo(() => {
    const q = searched.trim().toLocaleLowerCase();
    if (q === "") return [];
    return newest.filter((s) => s.name.toLocaleLowerCase().includes(q)).slice(0, 60);
  }, [newest, searched]);

  function cards(list: Series[]) {
    return list.map((s) => <SeriesCard key={s.series_id} series={s} onSelect={setSelected} />);
  }

  if (selected) {
  return (
    <SeriesDetails
      key={selected.series_id}
      account={account}
      series={selected}
      onClose={() => setSelected(null)}
    />
  );
}


  if (error) return <p>{error}</p>;
  if (categories.length === 0) return <p>Loading...</p>;

  if (expanded && query.trim() === "") {
    return (
      <Grid
        title={expanded.title}
        items={expanded.series}
        render={cards}
        onClose={() => setExpanded(null)}
      />
    );
  }

  if (query.trim() !== "") {
    return (
      <main>
        <div className="results">
          {cards(results)}
          {results.length === 0 && <p>No series found</p>}
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="views">
        {views.map((v) => (
          <button
            key={v.id}
            className={v.id === view ? "copy current" : "copy"}
            onClick={() => setView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>
      {rows.map(([title, list]) => (
        <Row
          key={title}
          title={title}
          onSeeAll={() => {
            setExpanded({ title, series: list });
            window.scrollTo(0, 0);
          }}
        >
          {cards(list.slice(0, 20))}
        </Row>
      ))}
    </main>
  );
}

export default SeriesHome;
