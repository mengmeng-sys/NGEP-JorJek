const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("jorjek_token");
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}
