import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpResponseError } from "@/shared/lib/http-response-error";

// IndexedDB no existe en jsdom: idb-keyval se reemplaza por un almacén en memoria.
const memory = new Map<IDBValidKey, unknown>();
vi.mock("idb-keyval", () => ({
  createStore: () => "store",
  set: async (key: IDBValidKey, value: unknown) => {
    memory.set(key, value);
  },
  get: async (key: IDBValidKey) => memory.get(key),
  del: async (key: IDBValidKey) => {
    memory.delete(key);
  },
  keys: async () => [...memory.keys()],
}));

const {
  enqueueAssessmentSave,
  flushAssessmentQueue,
  getPendingAssessmentSaves,
  shouldQueueOffline,
} = await import("./offline-queue");

const save = (evaluationId: string, score: number) => ({
  tool: "organizational" as const,
  org: "demo",
  evaluationId,
  responses: [{ indicatorId: "i1", score, observation: "obs" }],
  token: "token",
});

describe("offline queue (RNF-03, HU-42)", () => {
  beforeEach(() => memory.clear());

  it("queues a save made without network and keeps it per evaluation", async () => {
    await enqueueAssessmentSave(save("ev-1", 7));
    await enqueueAssessmentSave(save("ev-2", 4));

    const pending =
      await getPendingAssessmentSaves<{ score: number }[]>("ev-1");
    expect(pending).toHaveLength(1);
    expect(pending[0].responses[0].score).toBe(7);
    expect(pending[0].createdAt).toBeTypeOf("number");
  });

  it("sends the pending saves when the network comes back and empties the queue", async () => {
    await enqueueAssessmentSave(save("ev-1", 7));
    await enqueueAssessmentSave(save("ev-1", 8));
    const send = vi.fn().mockResolvedValue(undefined);

    const result = await flushAssessmentQueue("ev-1", send);

    expect(send).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ succeeded: 2, remaining: 0 });
    expect(await getPendingAssessmentSaves("ev-1")).toHaveLength(0);
  });

  it("keeps in the queue what still fails and does not touch other evaluations", async () => {
    await enqueueAssessmentSave(save("ev-1", 7));
    await enqueueAssessmentSave(save("ev-2", 4));
    const send = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    const result = await flushAssessmentQueue("ev-1", send);

    expect(result).toEqual({ succeeded: 0, remaining: 1 });
    expect(await getPendingAssessmentSaves("ev-2")).toHaveLength(1);
  });

  it("only queues network errors, never a rejection from the server", () => {
    expect(shouldQueueOffline(new TypeError("Failed to fetch"))).toBe(true);
    expect(shouldQueueOffline(new HttpResponseError(400, "Bad Request"))).toBe(
      false
    );
    expect(shouldQueueOffline(new HttpResponseError(409, "Completed"))).toBe(
      false
    );
  });
});
