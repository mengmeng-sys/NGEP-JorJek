import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

/** Axios instance used for all JorJek API calls. */
export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT on every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jorjek_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, try to swap the refresh token for a new access token once, then retry.
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const refreshToken = localStorage.getItem("jorjek_refresh_token");

    if (error.response?.status === 401 && refreshToken && !original._retry && !original.url.includes("/auth/")) {
      original._retry = true;

      const doRefresh = async () => {
        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem("jorjek_token", res.data.token);
        localStorage.setItem("jorjek_refresh_token", res.data.refreshToken);
        return res.data.token;
      };

      try {
        refreshPromise = refreshPromise || doRefresh();
        const token = await refreshPromise;
        refreshPromise = null;
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (refreshError) {
        refreshPromise = null;
        localStorage.removeItem("jorjek_token");
        localStorage.removeItem("jorjek_refresh_token");
        localStorage.removeItem("jorjek_auth_user");
        window.dispatchEvent(new Event("jorjek:session-expired"));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/** Extract a readable error message from any axios/API failure. */
export function getApiErrorMessage(err) {
  return err?.response?.data?.error || err?.message || "Something went wrong";
}

/**
 * Compatibility helper — same signature as the old one so existing callers
 * keep working, now powered by axios.
 */
export async function apiFetch(path, options = {}) {
  const { method = "GET", body, headers, params } = options;

  let data = body;
  if (body && typeof body === "string") {
    try {
      data = JSON.parse(body);
    } catch {
      data = body;
    }
  }

  try {
    const res = await api.request({ url: path, method, data, params, headers });
    return res.status === 204 ? null : res.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
}

export async function mfaApiFetch(mfaToken, path, options = {}) {
  const { method = "GET", body, headers, params } = options;

  let data = body;
  if (body && typeof body === "string") {
    try {
      data = JSON.parse(body);
    } catch {
      data = body;
    }
  }

  try {
    const res = await axios.request({
      baseURL: API_URL,
      url: path,
      method,
      data,
      params,
      headers: { ...headers, Authorization: `Bearer ${mfaToken}` },
    });
    return res.status === 204 ? null : res.data;
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
}