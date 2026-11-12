const ACCESS_TOKEN_KEY = "rotate_access_token";
const REFRESH_TOKEN_KEY = "rotate_refresh_token";
const USER_NAME_KEY = "rotate_user_name";
export const AUTH_CHANGED_EVENT = "rotate-auth-changed";

export type AuthTokens = {
  access: string;
  refresh: string;
};

function read(key: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

export function getAccessToken() {
  return read(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return read(REFRESH_TOKEN_KEY);
}

export function setAccessToken(access: string) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, access);
}

export function setRefreshToken(refresh: string) {
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function startSession(tokens: AuthTokens, userName: string) {
  setAccessToken(tokens.access);
  setRefreshToken(tokens.refresh);
  window.localStorage.setItem(USER_NAME_KEY, userName);
  notifyAuthChanged();
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_NAME_KEY);
  notifyAuthChanged();
}

function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function getCurrentUserName() {
  return read(USER_NAME_KEY) ?? (getAccessToken() ? "Account" : null);
}
