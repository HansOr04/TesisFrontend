import type { AssessmentIndicatorData } from "@/modules/assessment-core/infrastructure/assessment-api";

/**
 * Un KPI entra en la evaluación cuando se cumplen las dos condiciones, que
 * son independientes entre sí:
 *
 * - `active`: sigue vigente en la plantilla de la organización. Desactivarlo
 *   desde Administración lo apaga para todo el mundo, sin borrarlo.
 * - `applicable`: aplica a esta organización evaluada en concreto, según lo
 *   que se marcó en «KPI aplicables».
 *
 * El backend ya las usa juntas para puntuar y para exigir completitud; el
 * formulario tiene que mirar las mismas dos, o acabaría pidiendo calificar
 * un KPI que después no cuenta para nada.
 */
export function countsInEvaluation(
  indicator: Pick<AssessmentIndicatorData, "active" | "applicable">
): boolean {
  return indicator.active !== false && indicator.applicable !== false;
}
