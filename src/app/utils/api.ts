export const API_BASE = (() => {
  if (process.env.NODE_ENV === "production") {
    // Produção: sempre usar a URL da variável de ambiente
    return process.env.NEXT_PUBLIC_API_URL!;
  } else {
    // Desenvolvimento: decidir com base no host do navegador
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;

      if (hostname === "localhost" || hostname === "127.0.0.1") {
        // PC local
        return "http://localhost:3001";
      } else {
        // celular na mesma rede local (acessa seu IP da rede)
        return "http://192.168.18.104:3001";
      }
    } else {
      // Server-side em dev: fallback
      return process.env.API_URL!;
    }
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
