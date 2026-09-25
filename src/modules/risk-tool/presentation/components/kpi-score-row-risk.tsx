import { useState } from "react";
import { Textarea } from "@/shared/ui/textarea";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import { gaugeColor } from "@/modules/assessment-core/presentation/components/gauge";
import { KpiHelpRubricButtons } from "@/modules/assessment-core/presentation/components/kpi-help-rubric-buttons";

// RF-05: misma tarjeta de indicador que Organizational (kpi-score-row.tsx), más los dos
// campos de riesgo obligatorios/opcionales que exige la Herramienta de Riesgos
// (riskDescription obligatoria, riskType opcional) — el servicio clasifica el
// riesgo y crea/actualiza AssessmentRisk a partir de estos dos campos al guardar.
interface KpiScoreRowRiskProps {
  indicatorId: string;
  number: number;
  name: string;
  description?: string;
  helpText?: string;
  scoringRubric?: string;
  score: number | null;
  observation: string;
  riskDescription: string;
  riskType: string;
  t: (key: string) => string;
  onChange: (
    indicatorId: string,
    score: number | null,
    observation: string,
    riskDescription: string,
    riskType: string
  ) => void;
  onImproveObservation?: () => void;
  improvingObservation?: boolean;
}

const SCORE_BUTTONS = Array.from({ length: 10 }, (_, i) => i + 1);

export function KpiScoreRowRisk({
  indicatorId,
  number,
  name,
  description,
  helpText,
  scoringRubric,
  score,
  observation,
  riskDescription,
  riskType,
  t,
  onChange,
  onImproveObservation,
  improvingObservation,
}: KpiScoreRowRiskProps) {
  const [expanded, setExpanded] = useState(false);
  const isAnswered = score !== null;
  const showObservationWarning =
    score !== null && observation.trim().length === 0;
  const showRiskWarning = score !== null && riskDescription.trim().length === 0;

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card transition-all",
        expanded
          ? "border-brand/40 shadow-card"
          : "border-border/70 hover:border-brand/30 hover:shadow-card"
      )}
    >
      <div
        role="button"
        tabIndex={0}
        className="w-full flex items-start gap-3 p-4 text-left cursor-pointer"
        onClick={() => {
          setExpanded((prev) => !prev);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((prev) => !prev);
          }
        }}
      >
        <span className="shrink-0 mt-0.5 rounded-lg bg-brand/8 px-2 py-1 text-xs font-bold text-brand-deep tabular-nums">
          {String(number).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="text-base font-semibold leading-snug">{name}</p>
            <KpiHelpRubricButtons
              helpText={helpText}
              scoringRubric={scoringRubric}
              t={t}
            />
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-2">
              {description}
            </p>
          )}
        </div>
        {isAnswered && (
          <span
            className="shrink-0 rounded-full h-7 w-7 flex items-center justify-center text-sm font-bold text-white"
            style={{ backgroundColor: gaugeColor(score) }}
          >
            {score}
          </span>
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {SCORE_BUTTONS.map((n) => {
              const isLow = n <= 5;
              const selected = score === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    onChange(
                      indicatorId,
                      n,
                      observation,
                      riskDescription,
                      riskType
                    );
                  }}
                  className={cn(
                    "h-10 w-10 rounded-md text-base font-semibold border transition-all",
                    isLow
                      ? "border-danger/30 text-danger bg-danger/5"
                      : "border-success/30 text-success bg-success/5",
                    selected &&
                      (isLow
                        ? "border-danger/30 ring-2 ring-red-300"
                        : "border-success/30 ring-2 ring-green-300")
                  )}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <Textarea
            value={observation}
            onChange={(e) => {
              onChange(
                indicatorId,
                score,
                e.target.value,
                riskDescription,
                riskType
              );
            }}
            placeholder={t(
              "app.assessment.organizational.observationPlaceholder"
            )}
            className="text-base min-h-[80px] border-warning/40 focus-visible:ring-brand"
            rows={3}
          />
          {onImproveObservation &&
            score !== null &&
            observation.trim().length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-sm text-muted-foreground"
                disabled={improvingObservation}
                onClick={(e) => {
                  e.stopPropagation();
                  onImproveObservation();
                }}
              >
                {improvingObservation ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-1" />
                )}
                {improvingObservation
                  ? t("app.assessment.organizational.improvingObservation")
                  : t("app.assessment.organizational.improveObservation")}
              </Button>
            )}
          {showObservationWarning && (
            <p
              className="flex items-center gap-1 text-sm"
              style={{ color: "var(--color-warning)" }}
            >
              <AlertTriangle className="h-4 w-4" />
              {t("app.assessment.organizational.observationRequired")}
            </p>
          )}

          <div className="pt-3 border-t space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">
              {t("app.assessment.risk.riskSectionTitle")}
            </p>
            <Textarea
              value={riskDescription}
              onChange={(e) => {
                onChange(
                  indicatorId,
                  score,
                  observation,
                  e.target.value,
                  riskType
                );
              }}
              placeholder={t("app.assessment.risk.riskDescriptionPlaceholder")}
              className="text-base min-h-[64px] border-danger/30 focus-visible:ring-red-300"
              rows={2}
            />
            <Input
              value={riskType}
              onChange={(e) => {
                onChange(
                  indicatorId,
                  score,
                  observation,
                  riskDescription,
                  e.target.value
                );
              }}
              placeholder={t("app.assessment.risk.riskTypePlaceholder")}
              className="text-base h-9"
            />
            {showRiskWarning && (
              <p
                className="flex items-center gap-1 text-sm"
                style={{ color: "var(--color-warning)" }}
              >
                <AlertTriangle className="h-4 w-4" />
                {t("app.assessment.risk.riskDescriptionRequired")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
