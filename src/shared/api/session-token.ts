// Token de acceso en memoria (nunca en localStorage): la sesión persiste con
// el refresh token que el backend guarda en una cookie HttpOnly y rota en
// cada renovación. Este módulo es la única fuente del token para la capa HTTP.

type Listener = (token: string | null) => void;

let accessToken: string | null = null;
const listeners = new Set<Listener>();
let refreshing: Promise<string | null> | null = null;

const configured = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const apiBase = configured && configured.length > 0 ? configured : "/api";

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

/**
 * Pide un token de acceso nuevo con la cookie de refresh. Varias llamadas
 * concurrentes (p. ej. 3 peticiones que reciben 401 a la vez) comparten la
 * misma renovación. Devuelve null si no hay sesión.
 */
export function refreshAccessToken(): Promise<string | null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      const response = await fetch(`${apiBase}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
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

/**
 * fetch con Authorization y un reintento transparente tras renovar el token
 * cuando el backend responde 401 (token de acceso vencido).
 */
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
