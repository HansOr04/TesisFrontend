import { KpiScoreRow } from "./kpi-score-row";
import type { AssessmentIndicatorData } from "@/modules/assessment-core/infrastructure/assessment-api";

export interface DraftResponse {
  score: number | null;
  observation: string;
}

// FE3-B03/B04: vista de UNA dimensión a la vez (wizard), replicando el diseño de
// Figma  — nada de acordeón con las 6 dimensiones abiertas
// a la vez.
interface DimensionViewProps {
  number: number;
  name: string;
  indicators: AssessmentIndicatorData[];
  responses: Record<string, DraftResponse>;
  t: (key: string) => string;
  onChangeKpi: (
    indicatorId: string,
    score: number | null,
    observation: string
  ) => void;
  onImproveObservation?: (indicatorId: string) => void;
  improvingIndicatorId?: string | null;
  /** Sobrescribe las etiquetas específicas de Organizational ("Dimensión", "KPI completados")
   * para reutilizar este componente en Capacity ("Área") sin duplicarlo. */
  labels?: { dimension: string; indicatorsCompleted: string };
}

export function DimensionView({
  number,
  name,
  indicators,
  responses,
  t,
  onChangeKpi,
  onImproveObservation,
  improvingIndicatorId,
  labels,
}: DimensionViewProps) {
  const answered = indicators.filter(
    (i) => responses[i.id]?.score != null
  ).length;
  const dimensionLabel =
    labels?.dimension ?? t("app.assessment.organizational.dimension");
  const indicatorsCompletedLabel =
    labels?.indicatorsCompleted ??
    t("app.assessment.organizational.indicatorsCompleted");

  return (
    <div>
      <h2
        className="text-xl font-extrabold uppercase tracking-tight"
        style={{ color: "var(--color-brand)" }}
      >
        {dimensionLabel} {number}: {name}
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        {answered} / {indicators.length} {indicatorsCompletedLabel}
      </p>
      <div className="space-y-2">
        {indicators.map((indicator, idx) => (
          <KpiScoreRow
            key={indicator.id}
            indicatorId={indicator.id}
            number={idx + 1}
            code={indicator.code}
            name={indicator.name}
            description={indicator.description}
            helpText={indicator.helpText}
            scoringRubric={indicator.scoringRubric}
            score={responses[indicator.id]?.score ?? null}
            observation={responses[indicator.id]?.observation ?? ""}
            t={t}
            onChange={onChangeKpi}
            onImproveObservation={
              onImproveObservation
                ? () => {
                    onImproveObservation(indicator.id);
                  }
                : undefined
            }
            improvingObservation={improvingIndicatorId === indicator.id}
          />
        ))}
      </div>
    </div>
  );
}
