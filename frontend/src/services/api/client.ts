export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const response = await fetch(path, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  return response.json() as Promise<T>;
}
