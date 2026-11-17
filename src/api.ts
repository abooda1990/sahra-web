export type Account = { username: string; password: string };

type LoginAnswer = {
  user_info?: { auth: number };
  error?: { message: string };
};
// login asks the server whether the account is valid (player_api.php with no action)
export async function login(account: Account): Promise<void> {
  const params = new URLSearchParams(account);
  const res = await fetch(`/player_api.php?${params}`);
  const data: LoginAnswer = await res.json();
  if (data.user_info?.auth !== 1) {
    throw new Error(data.error?.message ?? "Login failed");
  }
}

export type Movie = {
  stream_id: number;
  name: string;
  stream_icon: string;
  container_extension: string;
  category_id: string;
  rating: number;
};

export type Category = {
  category_id: string;
  category_name: string;
};

async function list<T>(account: Account, action: string): Promise<T[]> {
  const params = new URLSearchParams({ ...account, action });
  const res = await fetch(`/player_api.php?${params}`);
  if (!res.ok) {
    throw new Error(`Could not load ${action} (${res.status})`);
  }
  return res.json();
}

export function getMovies(account: Account): Promise<Movie[]> {
  return list<Movie>(account, "get_vod_streams");
}

export function getCategories(account: Account): Promise<Category[]> {
  return list<Category>(account, "get_vod_categories");
}
// Genres maps a movie's stream_id to its TMDB genre ids: {"57641": [35, 18]}
export type Genres = Record<string, number[]>;

// getGenres gives {} when the server has no genres, so the site falls back to the categories
export async function getGenres(account: Account): Promise<Genres> {
  const params = new URLSearchParams(account);
  try {
    const res = await fetch(`/web/genres?${params}`);
    if (!res.ok) {
      return {};
    }
    return await res.json();
  } catch {
    return {};
  }
}

export type MovieInfo = {
  info: {
    plot?: string;
    cast?: string;
    director?: string;
    genre?: string;
    duration?: string;
    year?: string;
    rating?: number | string;

    backdrop_path?: string[];
    video?: { codec_name: string };
  };
};

export async function getMovieInfo(
  account: Account,
  movie: Movie,
): Promise<MovieInfo> {
  const params = new URLSearchParams({
    ...account,
    action: "get_vod_info",
    vod_id: String(movie.stream_id),
  });

  const res = await fetch(`/player_api.php?${params}`);

  if (!res.ok) {
    throw new Error(`Could not load the movie (${res.status})`);
  }
  return res.json();
}

export function movieUrl(account: Account, movie: Movie): string {
  const user = encodeURIComponent(account.username);
  const pass = encodeURIComponent(account.password);
  if (movie.container_extension === "mp4") {
    return `/movie/${user}/${pass}/${movie.stream_id}.mp4`;
  }

  return `/web/movie/${user}/${pass}/${movie.stream_id}.mp4?ext=${movie.container_extension}`;
}


// posterUrl asks our server for the movie's TMDB poster (it redirects to the image, or 404)
export function posterUrl(account: Account, movie: Movie): string {
  const params = new URLSearchParams(account);
  return `/web/poster/${movie.stream_id}?${params}`;
}
