// api.ts is everything the site asks our server.

/* ==========================================================================
   Account
   ========================================================================== */

export type Account = { username: string; password: string };

type LoginAnswer = {
  user_info?: { auth: number };
  error?: { message: string };
};

// login asks the server whether the account is valid (player_api.php with no action)
export async function login(account: Account): Promise<void> {
  const data = await request<LoginAnswer>(account, {}, "the account");
  if (data.user_info?.auth !== 1) {
    throw new Error(data.error?.message ?? "Login failed");
  }
}

/* ==========================================================================
   Requests
   ========================================================================== */

// request asks the server with the account and params. what names the thing in the error,
// "Could not load the movie (502)".
async function request<T>(
  account: Account,
  params: Record<string, string>,
  what: string,
): Promise<T> {
  const query = new URLSearchParams({ ...account, ...params });
  const res = await fetch(`/player_api.php?${query}`);
  if (!res.ok) {
    throw new Error(`Could not load ${what} (${res.status})`);
  }
  return res.json();
}

// list asks for one of the provider's full lists (movies, series, categories)
function list<T>(account: Account, action: string): Promise<T[]> {
  return request<T[]>(account, { action }, action);
}

export type Category = {
  category_id: string;
  category_name: string;
};

/* ==========================================================================
   Movies
   ========================================================================== */

export type Movie = {
  stream_id: number;
  name: string;
  stream_icon: string;
  container_extension: string;
  category_id: string;
  added: string; // seconds since 1970, as text
};

export type MovieInfo = {
  info: {
    plot?: string;
    cast?: string;
    director?: string;
    duration?: string; // "01:52:10"
    duration_secs?: number;
    year?: string;
    rating?: number | string;
    backdrop_path?: string[];
    video?: { codec_name: string };
  };
};

export function getMovies(account: Account): Promise<Movie[]> {
  return list<Movie>(account, "get_vod_streams");
}

export function getCategories(account: Account): Promise<Category[]> {
  return list<Category>(account, "get_vod_categories");
}

export function getMovieInfo(account: Account, movie: Movie): Promise<MovieInfo> {
  return request<MovieInfo>(
    account,
    { action: "get_vod_info", vod_id: String(movie.stream_id) },
    "the movie",
  );
}

// Genres maps a movie's stream_id to its TMDB genre ids: {"57641": [35, 18]}
export type Genres = Record<string, number[]>;

// getGenres gives {} when the server has no genres, so the site falls back to the categories
export async function getGenres(account: Account): Promise<Genres> {
  const params = new URLSearchParams(account);
  try {
    const res = await fetch(`/web/genres?${params}`);
    return res.ok ? await res.json() : {};
  } catch {
    return {};
  }
}

// posterUrl asks our server for the movie's TMDB poster (it redirects to the image, or 404)
export function posterUrl(account: Account, movie: Movie): string {
  const params = new URLSearchParams(account);
  return `/web/poster/${movie.stream_id}?${params}`;
}

/* ==========================================================================
   Series
   ========================================================================== */

export type Series = {
  series_id: number;
  name: string;
  cover: string;
  category_id: string;
  rating: string;
  last_modified: string; // seconds since 1970, as text
  plot?: string;
  cast?: string;
  genre?: string; // "Crime, Drama"
  releaseDate?: string; // "2020-03-23"
};

export type Episode = {
  id: string;
  episode_num: number;
  season: number;
  container_extension: string;
  info?: { duration_secs?: number; video?: { codec_name: string } };
};

// SeriesInfo is one series' episodes, by season number: {"1": [e1, e2], "2": [...]}.
// The provider's own seasons list is often empty, so the site reads only this.
export type SeriesInfo = {
  episodes: Record<string, Episode[]>;
};

export function getSeries(account: Account): Promise<Series[]> {
  return list<Series>(account, "get_series");
}

export function getSeriesCategories(account: Account): Promise<Category[]> {
  return list<Category>(account, "get_series_categories");
}

export function getSeriesInfo(account: Account, series: Series): Promise<SeriesInfo> {
  return request<SeriesInfo>(
    account,
    { action: "get_series_info", series_id: String(series.series_id) },
    "the series",
  );
}

/* ==========================================================================
   Links to play
   ========================================================================== */

// vodUrl gives the link to play a movie or an episode. An mp4 is played as is (the browser seeks);
// anything else goes through ffmpeg on /web/, which starts at `start` seconds.
function vodUrl(
  account: Account,
  kind: "movie" | "series",
  id: number | string,
  ext: string,
  start: number,
): string {
  const user = encodeURIComponent(account.username);
  const pass = encodeURIComponent(account.password);
  if (ext === "mp4") {
    return `/${kind}/${user}/${pass}/${id}.mp4`;
  }
  const t = start > 0 ? `&t=${start}` : "";
  return `/web/${kind}/${user}/${pass}/${id}.mp4?ext=${ext}${t}`;
}

export function movieUrl(account: Account, movie: Movie, start = 0): string {
  return vodUrl(account, "movie", movie.stream_id, movie.container_extension, start);
}

export function episodeUrl(account: Account, episode: Episode, start = 0): string {
  return vodUrl(account, "series", episode.id, episode.container_extension, start);
}
