import { useState } from "react";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import { gaugeColor } from "./gauge";
import { KpiHelpRubricButtons } from "./kpi-help-rubric-buttons";

// FE3-B03: tarjeta de indicador — colapsada muestra número + nombre + descripción;
// al expandir muestra 10 botones de calificación (1-10) y la observación
// obligatoria (UCA-04). Sin botón de guardado individual: el padre agrega los
// cambios de toda la dimensión y los guarda con un solo botón "Guardar".
interface KpiScoreRowProps {
  indicatorId: string;
  number: number;
  code: string;
  name: string;
  description?: string;
  helpText?: string;
  scoringRubric?: string;
  score: number | null;
  observation: string;
  t: (key: string) => string;
  onChange: (
    indicatorId: string,
    score: number | null,
    observation: string
  ) => void;
  onImproveObservation?: () => void;
  improvingObservation?: boolean;
}

const SCORE_BUTTONS = Array.from({ length: 10 }, (_, i) => i + 1);

export function KpiScoreRow({
  indicatorId,
  number,
  name,
  description,
  helpText,
  scoringRubric,
  score,
  observation,
  t,
  onChange,
  onImproveObservation,
  improvingObservation,
}: KpiScoreRowProps) {
  const [expanded, setExpanded] = useState(false);
  const isAnswered = score !== null;
  const showObservationWarning =
    score !== null && observation.trim().length === 0;

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
                    onChange(indicatorId, n, observation);
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
              onChange(indicatorId, score, e.target.value);
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
        </div>
      )}
    </div>
  );
}
