import type { AssessmentIndicatorData } from "@/modules/assessment-core/infrastructure/assessment-api";

export function weightedSectionAverage(
  indicators: Pick<AssessmentIndicatorData, "id" | "weight">[],
  scores: Record<string, { score: number | null } | undefined>
): number {
  let totalWeight = 0;
  let weightedSum = 0;
  for (const indicator of indicators) {
    const score = scores[indicator.id]?.score;
    if (score == null) continue;
    const weight = Number(indicator.weight);
    totalWeight += weight;
    weightedSum += weight * score;
  }
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}
