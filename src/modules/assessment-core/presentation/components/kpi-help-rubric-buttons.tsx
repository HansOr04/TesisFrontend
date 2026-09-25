import { HelpCircle, ListChecks } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { gaugeColor } from "./gauge";

interface KpiHelpRubricButtonsProps {
  helpText?: string;
  scoringRubric?: string;
  t: (key: string) => string;
}

interface RubricBand {
  range: string;
  description: string;
  color: string;
}

const RUBRIC_LINE = /^(\d{1,2}(?:\s*-\s*\d{1,2})?)\s*=\s*(.+)$/;

// Rúbrica analítica: scoringRubric guarda un JSON `{"criteria": ["...", ...]}`
// con 3-5 criterios verificables específicos del KPI (no una sola descripción
// holística por puntaje). Se muestran como checklist; el puntaje 1-10 depende
// de cuántos criterios se cumplen (leyenda genérica, no repetida por KPI).
function parseRubricCriteria(text: string): string[] | null {
  try {
    const parsed: unknown = JSON.parse(text);
    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray((parsed as { criteria?: unknown }).criteria)
    ) {
      const criteria = (parsed as { criteria: unknown[] }).criteria.filter(
        (c): c is string => typeof c === "string" && c.length > 0
      );
      return criteria.length > 0 ? criteria : null;
    }
  } catch {
    // No es JSON: puede ser una rúbrica antigua en formato "10 = ...".
  }
  return null;
}

// Formato legado "10 = descripción.\n7-8 = descripción...." — se mantiene como
// fallback para cualquier KPI que aún no se haya migrado a criterios.
function parseRubricBands(text: string): RubricBand[] | null {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const bands: RubricBand[] = [];
  for (const line of lines) {
    const match = RUBRIC_LINE.exec(line);
    if (!match) return null;
    const range = match[1].replace(/\s*-\s*/, "-");
    const high = Math.max(...range.split("-").map(Number));
    bands.push({ range, description: match[2], color: gaugeColor(high) });
  }
  return bands.length > 0 ? bands : null;
}

const RUBRIC_BANDS = [1, 2, 3, 4, 5] as const;

const SCORE_LEGEND = [
  { key: "All", color: gaugeColor(10) },
  { key: "Most", color: gaugeColor(8) },
  { key: "Half", color: gaugeColor(6) },
  { key: "One", color: gaugeColor(4) },
  { key: "None", color: gaugeColor(1) },
] as const;

// FE3-B03 (rediseño): dos botones ícono junto al nombre del KPI, siempre
// visibles — Ayuda (qué documento/proceso debe existir) y Rúbrica (cómo
// interpretar la escala 1-10). Compartido por Organizativa/Capacidades (kpi-score-row.tsx)
// y Risk (kpi-score-row-risk.tsx) para no duplicar el Dialog.
export function KpiHelpRubricButtons({
  helpText,
  scoringRubric,
  t,
}: KpiHelpRubricButtonsProps) {
  const criteria = scoringRubric ? parseRubricCriteria(scoringRubric) : null;
  const bands =
    scoringRubric && !criteria ? parseRubricBands(scoringRubric) : null;

  return (
    <span className="inline-flex items-center gap-0.5">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground shrink-0"
            title={t("app.assessment.organizational.kpiHelpLabel")}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <HelpCircle className="h-4 w-4" />
            <span className="sr-only">
              {t("app.assessment.organizational.kpiHelpLabel")}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent
          className="max-w-md max-h-[80vh] overflow-y-auto"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {t("app.assessment.organizational.kpiHelpTitle")}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {helpText || t("app.assessment.organizational.kpiHelpFallback")}
          </p>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground shrink-0"
            title={t("app.assessment.organizational.kpiRubricLabel")}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <ListChecks className="h-4 w-4" />
            <span className="sr-only">
              {t("app.assessment.organizational.kpiRubricLabel")}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent
          className="max-w-xl max-h-[80vh] overflow-y-auto"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {t("app.assessment.organizational.kpiRubricDialogTitle")}
            </DialogTitle>
          </DialogHeader>
          {criteria ? (
            <div>
              <p className="font-semibold text-sm mb-3">
                {t("app.assessment.organizational.kpiRubricCriteriaTitle")}
              </p>
              <div className="space-y-3">
                {criteria.map((criterion, i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-xl border border-border/70 bg-muted/20 p-4"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-6 text-foreground/90">
                      {criterion}
                    </p>
                  </div>
                ))}
              </div>
              <p className="font-semibold text-sm mt-6 mb-3">
                {t("app.assessment.organizational.kpiRubricScoringGuideTitle")}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {SCORE_LEGEND.map((row) => (
                  <div
                    key={row.key}
                    className="flex items-center gap-2.5 text-sm rounded-xl px-3 py-2.5"
                    style={{ backgroundColor: `${row.color}14` }}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: row.color }}
                    />
                    <span className="text-muted-foreground">
                      {t(
                        `app.assessment.organizational.kpiRubricLegend${row.key}`
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : bands ? (
            <div className="space-y-2">
              {bands.map((band) => (
                <div
                  key={band.range}
                  className="flex gap-3 rounded-xl border p-3"
                  style={{
                    borderColor: `${band.color}55`,
                    backgroundColor: `${band.color}14`,
                  }}
                >
                  <span
                    className="shrink-0 h-9 w-12 rounded-md flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: band.color }}
                  >
                    {band.range}
                  </span>
                  <p className="text-sm leading-relaxed pt-1">
                    {band.description}
                  </p>
                </div>
              ))}
            </div>
          ) : scoringRubric ? (
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {scoringRubric}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("app.assessment.organizational.kpiRubricNoneYet")}
            </p>
          )}
          <details className="pt-3 border-t text-sm">
            <summary className="cursor-pointer font-semibold text-muted-foreground">
              {t("app.assessment.organizational.kpiRubricGenericTitle")}
            </summary>
            <p className="text-sm text-muted-foreground mt-2">
              {t("app.assessment.organizational.kpiRubricIntro")}
            </p>
            <div className="space-y-2 mt-2">
              {RUBRIC_BANDS.map((band) => (
                <div key={band} className="flex gap-3 text-sm">
                  <span className="shrink-0 font-semibold text-muted-foreground w-14">
                    {t(
                      `app.assessment.organizational.kpiRubricBand${band}Title`
                    )}
                  </span>
                  <span className="text-muted-foreground leading-relaxed">
                    {t(
                      `app.assessment.organizational.kpiRubricBand${band}Description`
                    )}
                  </span>
                </div>
              ))}
            </div>
          </details>
        </DialogContent>
      </Dialog>
    </span>
  );
}
