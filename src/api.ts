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
