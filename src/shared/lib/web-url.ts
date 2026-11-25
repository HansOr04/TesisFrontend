export function webUrl(text: string | null | undefined): string | null {
  try {
    const url = new URL((text ?? "").trim());
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}
