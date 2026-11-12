import { api } from "./client";
import { clearSession, getRefreshToken, startSession, type AuthTokens } from "./session";

export async function login(email: string, password: string) {
  const tokens = await api.post<AuthTokens>("/user/login", { email, password }, { auth: false });
  startSession(tokens, email);
  return tokens;
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
}) {
  await api.post("/user/register", data, { auth: false });
}

export async function logout() {
  const refresh = getRefreshToken();
  try {
    if (refresh) await api.post("/user/logout", { refresh });
  } catch {}
  clearSession();
}
