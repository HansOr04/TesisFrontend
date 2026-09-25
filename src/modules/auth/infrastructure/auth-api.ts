import { authorizedFetch, baseURL } from "@/shared/api/http-client";
import { HttpResponseError } from "@/shared/lib/http-response-error";
import type { AuthSession, OrganisationRoles } from "../domain/auth.types";

async function parse<T>(response: Response, fallback: string): Promise<T> {
  if (!response.ok) {
    let message = fallback;
    try {
      const body = (await response.json()) as { message?: string | string[] };
      const m = body.message;
      message = Array.isArray(m) ? m.join(", ") : (m ?? fallback);
    } catch {
      /* cuerpo vacío */
    }
    throw new HttpResponseError(response.status, message);
  }
  return (await response.json()) as T;
}

export async function loginWithPassword(
  email: string,
  password: string
): Promise<AuthSession> {
  const response = await fetch(`${baseURL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parse<AuthSession>(response, "Credenciales inválidas");
}

export async function loginWithGoogle(idToken: string): Promise<AuthSession> {
  const response = await fetch(`${baseURL}/auth/google`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  return parse<AuthSession>(response, "No se pudo iniciar sesión con Google");
}

export interface MeResponse {
  id: string;
  email: string;
  name: string | null;
  isSuperAdmin: boolean;
  organisations: OrganisationRoles[];
}

export async function fetchMe(token: string): Promise<MeResponse> {
  const response = await authorizedFetch(`${baseURL}/auth/me`, {}, token);
  return parse<MeResponse>(response, "Sesión inválida");
}

/** Cierra la sesión en el servidor (revoca el refresh token de la cookie). */
export async function logoutSession(): Promise<void> {
  try {
    await fetch(`${baseURL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    /* sin red: la sesión local se cierra igual */
  }
}

export async function fetchAuthProviders(): Promise<{
  password: boolean;
  oauth: { provider: string; enabled: boolean }[];
}> {
  const response = await fetch(`${baseURL}/auth/providers`);
  return parse(response, "No se pudo consultar los proveedores");
}
