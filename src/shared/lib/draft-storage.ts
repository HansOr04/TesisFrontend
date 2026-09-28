// Borradores persistidos en localStorage: si la sesión se cierra por accidente
// (token vencido, pestaña cerrada, refresh) mientras se llena el wizard de una
// organización o se puntúa una evaluación, los datos no capturados por el
// servidor todavía se recuperan al volver a entrar. `localStorage` puede no
// estar disponible (modo privado, cuota llena) — nunca debe romper la app.
const PREFIX = "assessment.draft.";

export function loadDraft<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveDraft<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // localStorage lleno o inaccesible: el borrador simplemente no persiste.
  }
}

export function clearDraft(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // ignorar
  }
}
