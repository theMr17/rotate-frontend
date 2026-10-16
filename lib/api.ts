const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const ACCESS_TOKEN_KEY = "rotate_access_token";
const REFRESH_TOKEN_KEY = "rotate_refresh_token";
const USER_NAME_KEY = "rotate_user_name";
export const AUTH_CHANGED_EVENT = "rotate-auth-changed";

export type AuthTokens = {
  access: string;
  refresh: string;
};

export type UserProfile = {
  name: string;
  email: string;
  phone: string;
  location: string;
  role?: string;
};

type ApiErrorPayload = {
  detail?: string;
  [key: string]: string | string[] | undefined;
};

function getStoredToken(key: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function storeTokens(tokens: AuthTokens) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
}

function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function getCurrentUserName() {
  return getStoredToken(USER_NAME_KEY) ?? (getStoredToken(ACCESS_TOKEN_KEY) ? "Account" : null);
}

function setLoggedInUser(email: string) {
  window.localStorage.setItem(USER_NAME_KEY, email);
  notifyAuthChanged();
}

export async function logout() {
  const refresh = getStoredToken(REFRESH_TOKEN_KEY);
  const access = getStoredToken(ACCESS_TOKEN_KEY);

  try {
    if (refresh) {
      await request("/logout", {
        method: "POST",
        headers: access ? { Authorization: `Bearer ${access}` } : undefined,
        body: JSON.stringify({ refresh }),
      });
    }
  } catch {}

  clearTokens();
  window.localStorage.removeItem(USER_NAME_KEY);
  notifyAuthChanged();
}

function clearTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function getErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    if (payload.detail) return payload.detail;

    const firstError = Object.values(payload).flat()[0];
    if (typeof firstError === "string") return firstError;
  } catch {}

  return `Request failed (${response.status})`;
}

async function request<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  const tokens = await request<AuthTokens>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  storeTokens(tokens);
  setLoggedInUser(email);
  return tokens;
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
}) {
  await request<AuthTokens>("/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async function refreshAccessToken() {
  const refresh = getStoredToken(REFRESH_TOKEN_KEY);
  if (!refresh) return null;

  try {
    const tokens = await request<{ access: string }>("/token/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh }),
    });
    window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
    return tokens.access;
  } catch {
    clearTokens();
    return null;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const access = getStoredToken(ACCESS_TOKEN_KEY);
  let response = await fetch(`${API_URL}${path}`, {
    headers: access ? { Authorization: `Bearer ${access}` } : undefined,
    credentials: "include",
  });

  if (response.status === 401) {
    const refreshedAccess = await refreshAccessToken();
    if (refreshedAccess) {
      response = await fetch(`${API_URL}${path}`, {
        headers: { Authorization: `Bearer ${refreshedAccess}` },
        credentials: "include",
      });
    }
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Please log in to continue.");
    }
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}