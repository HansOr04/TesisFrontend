// Colores semánticos de puntaje, en hex para usarlos en SVG/canvas y estilos
// inline (los tokens HSL de index.css tienen el mismo tono).
export const SCORE_COLORS = {
  critical: "#DC3D43", // 0–5
  medium: "#F28C0F", // 5–7
  high: "#1F9D5B", // 7–10
  track: "#E3EBE6",
  ink: "#12241C",
} as const;

export function scoreColor(value: number): string {
  if (value <= 5) return SCORE_COLORS.critical;
  if (value < 7) return SCORE_COLORS.medium;
  return SCORE_COLORS.high;
}
