import type { AssessmentIndicatorData } from "@/modules/assessment-core/infrastructure/assessment-api";

export function countsInEvaluation(
  indicator: Pick<AssessmentIndicatorData, "active" | "applicable">
): boolean {
  return indicator.active !== false && indicator.applicable !== false;
}
