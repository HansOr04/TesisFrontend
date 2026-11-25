import type { AssessmentEvaluationStatus } from "@/modules/assessment-core/infrastructure/assessment-api";

const STATUS_KEYS: Record<AssessmentEvaluationStatus, string> = {
  DRAFT: "app.assessment.organizational.statusDraft",
  IN_PROGRESS: "app.assessment.organizational.statusInProgress",
  COMPLETED: "app.assessment.organizational.statusCompleted",
  ARCHIVED: "app.assessment.organizational.statusArchived",
};

/** Clave de traducción del estado de una evaluación (las tres herramientas). */
export function evaluationStatusKey(
  status: AssessmentEvaluationStatus
): string {
  return STATUS_KEYS[status];
}
