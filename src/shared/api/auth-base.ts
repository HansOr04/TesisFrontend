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
