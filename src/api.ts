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
