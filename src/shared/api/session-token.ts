import { authBase } from "./auth-base";

type Listener = (token: string | null) => void;

let accessToken: string | null = null;
const listeners = new Set<Listener>();
let refreshing: Promise<string | null> | null = null;

const REFRESH_LOCK = "assessment.refresh";
const REFRESH_TIMEOUT_MS = 20_000;

function oneTabAtATime<T>(task: () => Promise<T>): Promise<T> {
  const locks = typeof navigator === "undefined" ? undefined : navigator.locks;
  return locks ? (locks.request(REFRESH_LOCK, task) as Promise<T>) : task();
}

export const sessionToken = {
  get: (): string | null => accessToken,
  set(token: string | null) {
    accessToken = token;
    listeners.forEach((l) => l(token));
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function refreshAccessToken(): Promise<string | null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      const response = await oneTabAtATime(() =>
        fetch(`${authBase}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          signal: AbortSignal.timeout(REFRESH_TIMEOUT_MS),
        })
      );
      if (!response.ok) {
        sessionToken.set(null);
        return null;
      }
      const body = (await response.json()) as { accessToken: string | null };
      sessionToken.set(body.accessToken ?? null);
      return body.accessToken ?? null;
    } catch {
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

export async function authorizedFetch(
  url: string,
  init: RequestInit = {},
  explicitToken?: string
): Promise<Response> {
  const withToken = (token: string | null | undefined): RequestInit => ({
    ...init,
    credentials: "include",
    headers: {
      ...(init.headers as Record<string, string> | undefined),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const first = await fetch(
    url,
    withToken(sessionToken.get() ?? explicitToken)
  );
  if (first.status !== 401) return first;

  const renewed = await refreshAccessToken();
  if (!renewed) return first;
  return fetch(url, withToken(renewed));
}
