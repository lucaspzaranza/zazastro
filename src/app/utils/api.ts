export const API_BASE = (() => {
  if (typeof window !== "undefined") {
    // rodando no navegador
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      // PC: usar localhost
      return "http://localhost:3001";
    } else {
      // celular / outros dispositivos: usar IP da rede
      return "http://192.168.18.104:3001";
    }
  } else {
    // server-side (Next SSR ou Node): usar variável de ambiente ou fallback
    return (
      process.env.NEXT_PUBLIC_API_URL ?? "https://zazastro-api.onrender.com"
    );
  }
})();

export async function apiFetch(path: string, init?: RequestInit) {
  const url = `${API_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API fetch error ${res.status}: ${text}`);
  }
  return res.json();
}
