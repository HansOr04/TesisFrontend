import { createStore, del, get, keys, set } from "idb-keyval";

// RNF-03 (F7-B03): las calificaciones del taller no deben perderse si la red
// se cae a mitad de guardar. Cada mutación que falla por un error de red (no
// por un rechazo del servidor) se persiste aquí en IndexedDB y se reintenta
// cuando vuelve la conexión — sin depender de que la pestaña siga abierta.
const store = createStore("assessment-offline-queue", "pending-saves");

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

// Reintenta cada item pendiente de esta evaluación; los que fallan de nuevo
// (seguimos sin red) quedan en la cola para el próximo intento.
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
