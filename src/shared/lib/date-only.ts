// Fechas de calendario (inicio y fin de una medida, semana de inicio de una
// mitigación): el servidor las guarda como medianoche UTC
// («2026-11-10T00:00:00.000Z»). Leídas con `new Date()`, en Ecuador (UTC−5)
// esa medianoche cae a las 19:00 del día anterior y la pantalla mostraba un
// día menos. Aquí se toman solo el año, el mes y el día, en la hora local.

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})/;

export function parseDateOnly(value: string): Date {
  const match = DATE_ONLY.exec(value);
  if (!match) return new Date(NaN);
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/** Fecha de calendario lista para mostrar; «—» si no es válida. */
export function formatDateOnly(
  value: string,
  locale?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = parseDateOnly(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(locale, options);
}

/** Día local en el formato de `<input type="date">` (AAAA-MM-DD). */
export function toInputDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
