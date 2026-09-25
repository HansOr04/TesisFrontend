import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Users, AlertTriangle, BarChart3, Folder } from "lucide-react";
import { Gauge, gaugeColor } from "./gauge";
import { CriticalKpiPanel } from "./critical-kpi-panel";
import type {
  AssessmentCriticalIndicator,
  AssessmentIndicatorData,
  AssessmentResponseData,
  AssessmentSectionScore,
} from "@/modules/assessment-core/infrastructure/assessment-api";

// FE3-B05: resumen ejecutivo — velocímetros de aguja por dimensión, puntaje
// global, tabla de resumen por dimensión y botón "Completar evaluación"
// .
interface EvaluatedSection {
  id: string;
  number: number;
  name: string;
  indicators: AssessmentIndicatorData[];
}

interface ExecutiveSummaryLabels {
  title: string;
  subtitle: string;
  statCriticalKpi: string;
  statDimensionsAssessed: string;
  summaryByDimension: string;
  colDimension: string;
  criticalIndicators: string;
  completeEvaluation: string;
}

interface ExecutiveSummaryProps {
  globalScore: number;
  sectionScores: AssessmentSectionScore[];
  sections: EvaluatedSection[];
  responses: AssessmentResponseData[];
  criticalIndicators: AssessmentCriticalIndicator[];
  completed: boolean;
  completing?: boolean;
  missingMessage?: string | null;
  t: (key: string) => string;
  onComplete: () => void;
  onDimensionClick?: (number: number) => void;
  /** Sobrescribe las etiquetas específicas de Organizational (título, "Dimensión", etc.)
   * para reutilizar este componente en Risk ("Principio") sin duplicarlo. */
  labels?: Partial<ExecutiveSummaryLabels>;
  /** Abre el plan de acción/mitigación para planificar una medida de este KPI. */
  onPlanMeasure?: (indicator: AssessmentCriticalIndicator) => void;
  /** KPI que ya cuentan con una medida registrada. */
  indicatorsWithMeasure?: Set<string>;
}

function capacityLevel(score: number, t: (key: string) => string): string {
  if (score <= 5) return t("app.assessment.organizational.capacityLow");
  if (score < 7) return t("app.assessment.organizational.capacityMedium");
  return t("app.assessment.organizational.capacityHigh");
}

function statusBadge(score: number, t: (key: string) => string) {
  if (score <= 5)
    return {
      label: t("app.assessment.organizational.statusNeedsAttention"),
      variant: "destructive" as const,
    };
  if (score < 7)
    return {
      label: t("app.assessment.organizational.statusMediumCapacity"),
      variant: "secondary" as const,
    };
  return {
    label: t("app.assessment.organizational.statusGoodCapacity"),
    variant: "default" as const,
  };
}

export function ExecutiveSummary({
  globalScore,
  sectionScores,
  sections,
  responses,
  criticalIndicators,
  completed,
  completing,
  missingMessage,
  t,
  onComplete,
  onDimensionClick,
  labels,
  onPlanMeasure,
  indicatorsWithMeasure,
}: ExecutiveSummaryProps) {
  const label = {
    title: labels?.title ?? t("app.assessment.organizational.title"),
    subtitle: labels?.subtitle ?? t("app.assessment.organizational.subtitle"),
    statCriticalKpi:
      labels?.statCriticalKpi ??
      t("app.assessment.organizational.statCriticalKpi"),
    statDimensionsAssessed:
      labels?.statDimensionsAssessed ??
      t("app.assessment.organizational.statDimensionsAssessed"),
    summaryByDimension:
      labels?.summaryByDimension ??
      t("app.assessment.organizational.summaryByDimension"),
    colDimension:
      labels?.colDimension ?? t("app.assessment.organizational.colDimension"),
    criticalIndicators:
      labels?.criticalIndicators ??
      t("app.assessment.organizational.criticalIndicators"),
    completeEvaluation:
      labels?.completeEvaluation ??
      t("app.assessment.organizational.completeEvaluation"),
  };

  const totalIndicators = sections.reduce(
    (sum, s) => sum + s.indicators.length,
    0
  );
  const answeredIndicators = responses.length;
  const answeredSections = sections.filter((s) =>
    s.indicators.some((i) => responses.some((r) => r.indicatorId === i.id))
  ).length;
  const weightTotal = sectionScores.reduce((sum, s) => sum + s.weight, 0) || 1;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <div className="text-xs uppercase text-muted-foreground font-semibold">
                {t("app.assessment.organizational.globalScore")}
              </div>
              <div className="text-lg font-bold mt-1">
                {globalScore.toFixed(1)} · {capacityLevel(globalScore, t)}
              </div>
            </div>
            <BarChart3
              className="h-8 w-8"
              style={{ color: gaugeColor(globalScore) }}
            />
          </CardContent>
        </Card>
        <Card className="border-danger/30 bg-danger/5">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <div className="text-xs uppercase text-danger font-semibold">
                {label.statCriticalKpi}
              </div>
              <div className="text-lg font-bold mt-1 text-danger">
                {criticalIndicators.length}
              </div>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger">
              <AlertTriangle className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <div className="text-xs uppercase text-muted-foreground font-semibold">
                {t("app.assessment.organizational.statIndicatorsAssessed")}
              </div>
              <div className="text-lg font-bold mt-1">
                {answeredIndicators} / {totalIndicators}
              </div>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/8 text-brand">
              <Users className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <div className="text-xs uppercase text-muted-foreground font-semibold">
                {label.statDimensionsAssessed}
              </div>
              <div className="text-lg font-bold mt-1">
                {answeredSections} / {sections.length}
              </div>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/8 text-brand">
              <Folder className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle
              className="text-base"
              style={{ color: "var(--color-brand)" }}
            >
              {label.title}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{label.subtitle}</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <Gauge value={globalScore} size="lg" />
            <Badge
              className="text-white"
              style={{ backgroundColor: gaugeColor(globalScore) }}
            >
              {t("app.assessment.organizational.capacityLevel")}:{" "}
              {capacityLevel(globalScore, t)}
            </Badge>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-danger" /> 0–5{" "}
                {t("app.assessment.organizational.capacityLow")}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-warning" /> 5–7{" "}
                {t("app.assessment.organizational.capacityMedium")}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-success" /> 7–10{" "}
                {t("app.assessment.organizational.capacityHigh")}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {sectionScores.map((section) => (
            <Card
              key={section.sectionId}
              className={
                onDimensionClick
                  ? "cursor-pointer hover:border-primary transition-colors"
                  : undefined
              }
              onClick={() => onDimensionClick?.(section.number)}
            >
              <CardContent className="flex flex-col items-center py-4">
                <p className="text-xs font-semibold text-center mb-1">
                  {section.number}. {section.name}
                </p>
                <Gauge
                  value={section.weightedAvg}
                  weightLabel={`${t("app.assessment.organizational.colWeight").toUpperCase()} ${Math.round(
                    (section.weight / weightTotal) * 100
                  )}%`}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {label.summaryByDimension}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th scope="col" className="text-left py-2 px-4">
                  {label.colDimension}
                </th>
                <th scope="col" className="text-center py-2 px-4">
                  {t("app.assessment.organizational.colWeight")}
                </th>
                <th scope="col" className="text-center py-2 px-4">
                  {t("app.assessment.organizational.colAverage")}
                </th>
                <th scope="col" className="text-center py-2 px-4">
                  {t("app.assessment.organizational.colKpiAssessed")}
                </th>
                <th scope="col" className="text-center py-2 px-4">
                  {t("app.assessment.organizational.colKpiCritical")}
                </th>
                <th scope="col" className="text-center py-2 px-4">
                  {t("app.assessment.organizational.colStatus")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sectionScores.map((section) => {
                const sectionDef = sections.find(
                  (s) => s.id === section.sectionId
                );
                const indicatorIds = new Set(
                  sectionDef?.indicators.map((i) => i.id)
                );
                const sectionResponses = responses.filter((r) =>
                  indicatorIds.has(r.indicatorId)
                );
                const badge = statusBadge(section.weightedAvg, t);
                return (
                  <tr
                    key={section.sectionId}
                    className={`border-t ${onDimensionClick ? "cursor-pointer hover:bg-muted/40" : ""}`}
                    onClick={() => onDimensionClick?.(section.number)}
                  >
                    <td className="py-2 px-4 font-medium">
                      {section.number}. {section.name}
                    </td>
                    <td className="text-center py-2 px-4">
                      {Math.round((section.weight / weightTotal) * 100)}%
                    </td>
                    <td
                      className="text-center py-2 px-4 font-semibold"
                      style={{ color: gaugeColor(section.weightedAvg) }}
                    >
                      {section.weightedAvg.toFixed(1)}
                    </td>
                    <td className="text-center py-2 px-4">
                      {sectionResponses.length} /{" "}
                      {sectionDef?.indicators.length ?? 0}
                    </td>
                    <td className="text-center py-2 px-4">
                      {sectionResponses.filter((r) => r.isCritical).length}
                    </td>
                    <td className="text-center py-2 px-4">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <CriticalKpiPanel
        criticalIndicators={criticalIndicators}
        sections={sections}
        sectionLabel={label.colDimension}
        title={label.criticalIndicators}
        t={t}
        onSectionClick={onDimensionClick}
        onPlanMeasure={onPlanMeasure}
        indicatorsWithMeasure={indicatorsWithMeasure}
      />

      {!completed && (
        <div className="flex flex-col items-end gap-2">
          {missingMessage && (
            <p className="text-sm text-destructive">{missingMessage}</p>
          )}
          <Button onClick={onComplete} disabled={completing}>
            {label.completeEvaluation}
          </Button>
        </div>
      )}
    </div>
  );
}
