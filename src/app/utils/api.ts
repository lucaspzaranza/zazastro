export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://zazastro-api.onrender.com";

export async function apiFetch(path: string, init?: RequestInit) {
  const url = `${API_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API fetch error ${res.status}: ${text}`);
  }
  return res.json();
}
