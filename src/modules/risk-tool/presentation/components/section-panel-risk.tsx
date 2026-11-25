import { KpiScoreRowRisk } from "./kpi-score-row-risk";
import type { AssessmentIndicatorData } from "@/modules/assessment-core/infrastructure/assessment-api";

export interface DraftResponseRisk {
  score: number | null;
  observation: string;
  riskDescription: string;
  riskType: string;
  manualCritical: boolean;
}

interface PrincipleViewProps {
  number: number;
  name: string;
  indicators: AssessmentIndicatorData[];
  responses: Record<string, DraftResponseRisk>;
  t: (key: string) => string;
  onChangeKpi: (
    indicatorId: string,
    score: number | null,
    observation: string,
    riskDescription: string,
    riskType: string,
    manualCritical: boolean
  ) => void;
  onImproveObservation?: (indicatorId: string) => void;
  improvingIndicatorId?: string | null;
  readOnly?: boolean;
}

export function PrincipleView({
  number,
  name,
  indicators,
  responses,
  t,
  onChangeKpi,
  onImproveObservation,
  improvingIndicatorId,
  readOnly = false,
}: PrincipleViewProps) {
  const answered = indicators.filter(
    (i) => responses[i.id]?.score != null
  ).length;

  return (
    <div>
      <h2
        className="text-xl font-extrabold uppercase tracking-tight"
        style={{ color: "var(--color-brand)" }}
      >
        {t("app.assessment.risk.principle")} {number}: {name}
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        {answered} / {indicators.length}{" "}
        {t("app.assessment.organizational.indicatorsCompleted")}
      </p>
      <div className="space-y-2">
        {indicators.map((indicator, idx) => (
          <KpiScoreRowRisk
            key={indicator.id}
            indicatorId={indicator.id}
            number={idx + 1}
            name={indicator.name}
            description={indicator.description}
            helpText={indicator.helpText}
            scoringRubric={indicator.scoringRubric}
            score={responses[indicator.id]?.score ?? null}
            observation={responses[indicator.id]?.observation ?? ""}
            riskDescription={responses[indicator.id]?.riskDescription ?? ""}
            riskType={responses[indicator.id]?.riskType ?? ""}
            manualCritical={responses[indicator.id]?.manualCritical ?? false}
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
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}
