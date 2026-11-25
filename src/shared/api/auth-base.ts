/**
 * Base de las rutas /auth que usan la cookie de sesión. En Vercel la web las
 * pide a su propio dominio (vercel.json las reenvía a Heroku): así la cookie
 * es propia y los navegadores que bloquean las de terceros (Safari, Firefox
 * estricto, Brave) no cierran la sesión (HU-71). El resto de la API sigue
 * yendo directo al servidor.
 */
export function resolveAuthBase(
  apiUrl: string | undefined,
  sameOrigin: string | undefined
): string {
  if (sameOrigin === "1") return "";
  const configured = apiUrl?.trim();
  return configured ? configured : "/api";
}

export const authBase = resolveAuthBase(
  import.meta.env.VITE_API_URL as string | undefined,
  import.meta.env.VITE_AUTH_SAME_ORIGIN as string | undefined
);
