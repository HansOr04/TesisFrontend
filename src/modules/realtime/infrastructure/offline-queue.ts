import { createStore, del, get, keys, set } from "idb-keyval";
import { HttpResponseError } from "@/shared/lib/http-response-error";

const store = createStore("assessment-offline-queue", "pending-saves");

export function shouldQueueOffline(error: unknown): boolean {
  return !(error instanceof HttpResponseError);
}

export interface AssessmentQueuedSave<TResponses> {
  id: string;
  tool: "organizational" | "capacity" | "risk";
  org: string;
  evaluationId: string;
  responses: TResponses;
  token: string;
  createdAt: number;
}

export async function enqueueAssessmentSave<TResponses>(
  item: Omit<AssessmentQueuedSave<TResponses>, "id" | "createdAt">
): Promise<string> {
  const id = `${item.tool}-${item.evaluationId}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
  const queued: AssessmentQueuedSave<TResponses> = {
    ...item,
    id,
    createdAt: Date.now(),
  };
  await set(id, queued, store);
  return id;
}

export async function getPendingAssessmentSaves<TResponses>(
  evaluationId: string
): Promise<AssessmentQueuedSave<TResponses>[]> {
  const allKeys = await keys(store);
  const items = await Promise.all(
    allKeys.map((key) => get<AssessmentQueuedSave<TResponses>>(key, store))
  );
  return items.filter(
    (item): item is AssessmentQueuedSave<TResponses> =>
      !!item && item.evaluationId === evaluationId
  );
}

export async function removeAssessmentSave(id: string): Promise<void> {
  await del(id, store);
}

export async function flushAssessmentQueue<TResponses>(
  evaluationId: string,
  send: (item: AssessmentQueuedSave<TResponses>) => Promise<void>
): Promise<{ succeeded: number; remaining: number }> {
  const pending = await getPendingAssessmentSaves<TResponses>(evaluationId);
  const outcomes = await Promise.allSettled(
    pending.map(async (item) => {
      await send(item);
      await removeAssessmentSave(item.id);
    })
  );
  const succeeded = outcomes.filter((o) => o.status === "fulfilled").length;
  const remaining = await getPendingAssessmentSaves<TResponses>(evaluationId);
  return { succeeded, remaining: remaining.length };
}
