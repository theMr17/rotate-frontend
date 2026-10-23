import { ApiError } from "./errors";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "./session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiFetchOptions = {
  auth?: boolean;
  signal?: AbortSignal;
  headers?: HeadersInit;
};

export async function apiFetch<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { auth = true, signal, headers: extraHeaders } = options;
  const url = /^https?:\/\//.test(path) ? path : `${API_URL}${path}`;
  const isMultipart = typeof FormData !== "undefined" && body instanceof FormData;

  const send = async (token: string | null) => {
    const headers = new Headers(extraHeaders);
    headers.set("Accept", "application/json");
    if (body !== undefined && !isMultipart) headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    try {
      return await fetch(url, {
        method,
        headers,
        signal,
        credentials: "include",
        body: body === undefined ? undefined : isMultipart ? (body as FormData) : JSON.stringify(body),
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") throw err;
      throw new ApiError(0, null);
    }
  };

  const token = auth ? getAccessToken() : null;
  let response = await send(token);

  if (response.status === 401 && auth && getRefreshToken()) {
    const current = getAccessToken();
    const fresh = current && current !== token ? current : await refreshAccessToken();
    if (fresh) response = await send(fresh);
  }

  if (!response.ok) throw await ApiError.fromResponse(response);

  return parseBody<T>(response);
}

async function parseBody<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  if (!text) return undefined as T;
  const contentType = response.headers.get("Content-Type") ?? "";
  return (contentType.includes("json") ? JSON.parse(text) : text) as T;
}

export const api = {
  get: <T>(path: string, options?: ApiFetchOptions) => apiFetch<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>("POST", path, body, options),
  put: <T>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>("PUT", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>("PATCH", path, body, options),
  delete: <T = void>(path: string, options?: ApiFetchOptions) =>
    apiFetch<T>("DELETE", path, undefined, options),
};

// shared so concurrent 401s only trigger one refresh
let refreshInFlight: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
  refreshInFlight ??= doRefresh().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

async function doRefresh(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const tokens = await api.post<{ access: string; refresh?: string }>(
      "/user/token/refresh",
      { refresh },
      { auth: false },
    );
    setAccessToken(tokens.access);
    if (tokens.refresh) setRefreshToken(tokens.refresh);
    return tokens.access;
  } catch (err) {
    if (err instanceof ApiError && !err.isNetworkError && err.status < 500) {
      clearSession();
    }
    return null;
  }
}
