import type { AssessmentIndicatorData } from "@/modules/assessment-core/infrastructure/assessment-api";

/**
 * Promedio de una sección ponderado por el peso de cada KPI, el mismo que
 * calcula el servidor para el resumen y el historial. Solo cuentan los KPI ya
 * calificados; sin ninguno, el promedio es 0.
 *
 * El peso llega del servidor como texto («7»), porque Prisma serializa los
 * Decimal así aunque el tipo diga number. Sin el Number() la suma de pesos
 * concatena («0777…») y el promedio queda en 0.0 con la sección calificada.
 */
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
