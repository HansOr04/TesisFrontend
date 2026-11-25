const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})/;

export function parseDateOnly(value: string): Date {
  const match = DATE_ONLY.exec(value);
  if (!match) return new Date(NaN);
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

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

export function toInputDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
