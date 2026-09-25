import { HttpResponseError } from "@/shared/lib/http-response-error";
import { authorizedFetch } from "./session-token";

export { authorizedFetch, sessionToken } from "./session-token";

// Cliente HTTP mínimo. Toda la app habla con el backend a través de estas
// funciones: una sola forma de construir URLs, cabeceras y errores. El token
// de acceso vive en memoria (session-token.ts) y se renueva solo ante un 401.
const configured = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
export const baseURL =
  configured && configured.length > 0 ? configured : "/api";

export const endpoint = (organisation: string): string =>
  `${baseURL}/${organisation}`;

export const getHeaders = (token?: string): Record<string, string> =>
  token ? { Authorization: `Bearer ${token}` } : {};

function messageFromErrorBody(
  text: string,
  fallback: string
): { message: string; errorCode?: string } {
  if (!text?.trim()) return { message: fallback };
  try {
    const body = JSON.parse(text) as {
      error?: { message?: string; errorCode?: string };
      message?: string | string[];
    };
    const msg = body?.error?.message ?? body?.message ?? fallback;
    return {
      message: Array.isArray(msg) ? msg.join(", ") : msg,
      errorCode: body?.error?.errorCode,
    };
  } catch {
    return { message: text.substring(0, 200) };
  }
}

async function throwIfNotOk(response: Response, fallback: string) {
  if (response.ok) return;
  const { message, errorCode } = messageFromErrorBody(
    await response.text(),
    fallback
  );
  throw new HttpResponseError(response.status, message, errorCode);
}

function requireOrganisation(organisation: string, where: string) {
  if (!organisation) {
    throw new Error(`${where} attempted without organisation`);
  }
}

/** GET /:org/<path> */
export const genericGet = async <T>(
  organisation: string,
  path: string,
  token?: string
): Promise<T> => {
  requireOrganisation(organisation, "genericGet");
  const response = await authorizedFetch(
    `${endpoint(organisation)}${path}`,
    {},
    token
  );
  await throwIfNotOk(response, `GET ${path} failed`);
  return (await response.json()) as T;
};

/** GET /:org/<controller>/<id> */
export const genericSingleFetch = async <T>(
  organisation: string,
  controller: string,
  id = "",
  token?: string
): Promise<T> => {
  const controllerPath = controller.startsWith("/")
    ? controller
    : `/${controller}`;
  return genericGet<T>(
    organisation,
    `${controllerPath}${id ? `/${id}` : ""}`,
    token
  );
};

/** GET <controller>/<id> sin prefijo de organización (rutas globales). */
export const genericSingleFetchWithoutOrganisation = async <T>(
  controller: string,
  id = "",
  token?: string
): Promise<T> => {
  const response = await authorizedFetch(
    `${baseURL}${controller}${id ? `/${id}` : ""}`,
    {},
    token
  );
  await throwIfNotOk(response, `GET ${controller} failed`);
  return (await response.json()) as T;
};

/** POST/PUT/PATCH/DELETE /:org/<controller> con cuerpo JSON. */
export const genericPostPutPatch = async <T, R = T>(
  organisation: string,
  controller: string,
  methodType: "POST" | "PUT" | "PATCH" | "DELETE",
  data: T,
  token?: string
): Promise<R> => {
  requireOrganisation(organisation, "genericPostPutPatch");
  const response = await authorizedFetch(
    `${endpoint(organisation)}${controller}`,
    {
      method: methodType,
      headers: { "Content-Type": "application/json" },
      body:
        data === undefined || data === null ? undefined : JSON.stringify(data),
    },
    token
  );
  await throwIfNotOk(response, `${methodType} ${controller} failed`);
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as R;
};

/** Descarga un blob de respuesta como archivo en el navegador. */
export async function downloadBlobResponse(
  response: Response,
  filename: string
): Promise<void> {
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Descargas (Excel/PPTX): devuelve la Response para leer el blob. */
export const genericFetchForBlob = async (
  organisation: string,
  controller: string,
  methodType: "GET" | "POST",
  data?: Record<string, unknown>,
  token?: string
): Promise<Response> => {
  requireOrganisation(organisation, "genericFetchForBlob");
  const response = await authorizedFetch(
    `${endpoint(organisation)}${controller}`,
    {
      method: methodType,
      headers: { "Content-Type": "application/json" },
      body: methodType === "POST" ? JSON.stringify(data ?? {}) : undefined,
    },
    token
  );
  await throwIfNotOk(response, `${methodType} ${controller} failed`);
  return response;
};
