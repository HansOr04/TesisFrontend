export const SCORE_COLORS = {
  critical: "#DC3D43",
  medium: "#F28C0F",
  high: "#1F9D5B",
  track: "#E3EBE6",
  ink: "#12241C",
} as const;

export function scoreColor(value: number): string {
  if (value <= 5) return SCORE_COLORS.critical;
  if (value < 7) return SCORE_COLORS.medium;
  return SCORE_COLORS.high;
}
