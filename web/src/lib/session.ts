import "server-only";
import { cookies } from "next/headers";
import { apiFetch, ApiError } from "./api";
import type { User } from "./types";

const TOKEN_COOKIE = "memon_token";

export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value ?? null;
}

export async function setToken(token: string) {
  const store = await cookies();
  store.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24h, matches the JWT's own expiry
  });
}

export async function clearToken() {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    return await apiFetch<User>("/auth/me", { token, cache: "no-store" });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    return null;
  }
}
