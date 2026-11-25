import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveAuthBase } from "./auth-base";

const respond = (accessToken: string | null, status = 200) =>
  new Response(JSON.stringify({ accessToken }), { status });

/** Cada carga del módulo hace de una pestaña distinta. */
async function openTab() {
  vi.resetModules();
  return import("./session-token");
}

function stubLocks() {
  let queue: Promise<unknown> = Promise.resolve();
  const request = vi.fn((_name: string, task: () => Promise<unknown>) => {
    const run = queue.then(task);
    queue = run.catch(() => undefined);
    return run;
  });
  vi.stubGlobal("navigator", { locks: { request } });
  return request;
}

describe("renovación de la sesión", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("dos pestañas se turnan para renovar (CA-71.1)", async () => {
    stubLocks();
    let active = 0;
    let maxActive = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        maxActive = Math.max(maxActive, ++active);
        await new Promise((r) => setTimeout(r, 5));
        active--;
        return respond("token");
      })
    );
    const first = await openTab();
    const second = await openTab();

    const tokens = await Promise.all([
      first.refreshAccessToken(),
      second.refreshAccessToken(),
    ]);

    expect(tokens).toEqual(["token", "token"]);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(maxActive).toBe(1);
  });

  it("renueva aunque el navegador no tenga Web Locks", async () => {
    vi.stubGlobal("navigator", {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond("token")));
    const tab = await openTab();
    expect(await tab.refreshAccessToken()).toBe("token");
  });

  it("varias peticiones de una pestaña comparten la misma renovación", async () => {
    stubLocks();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond("token")));
    const tab = await openTab();
    await Promise.all([tab.refreshAccessToken(), tab.refreshAccessToken()]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("si el servidor rechaza la renovación, la sesión queda sin token", async () => {
    stubLocks();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(respond(null, 401)));
    const tab = await openTab();
    tab.sessionToken.set("viejo");
    expect(await tab.refreshAccessToken()).toBeNull();
    expect(tab.sessionToken.get()).toBeNull();
  });
});

describe("base de las rutas de sesión (CA-71.2)", () => {
  it("en Vercel usa el dominio de la propia web", () => {
    expect(resolveAuthBase("https://api.example.com", "1")).toBe("");
  });
  it("en los demás entornos usa la API configurada o el proxy", () => {
    expect(resolveAuthBase("https://api.example.com", undefined)).toBe(
      "https://api.example.com"
    );
    expect(resolveAuthBase(" ", undefined)).toBe("/api");
  });
});
