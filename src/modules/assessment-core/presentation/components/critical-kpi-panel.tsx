import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  ChevronDown,
  ExternalLink,
  ListChecks,
  Search,
  Wrench,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import { SCORE_COLORS, scoreColor } from "@/shared/design/score-colors";
import type {
  AssessmentCriticalIndicator,
  AssessmentIndicatorData,
} from "@/modules/assessment-core/infrastructure/assessment-api";
import { RingGauge } from "./ring-gauge";

interface SectionRef {
  id: string;
  number: number;
  name: string;
  indicators: Pick<AssessmentIndicatorData, "id">[];
}

interface CriticalKpiPanelProps {
  criticalIndicators: AssessmentCriticalIndicator[];
  sections: SectionRef[];
  /** Etiqueta de la sección: "Dimensión" | "Área" | "Principio". */
  sectionLabel: string;
  title: string;
  t: (key: string) => string;
  onSectionClick?: (number: number) => void;
  /** Si se pasa, cada tarjeta ofrece "Planificar medida". */
  onPlanMeasure?: (indicator: AssessmentCriticalIndicator) => void;
  /** Ids de indicadores que ya tienen una medida registrada. */
  indicatorsWithMeasure?: Set<string>;
}

type SortMode = "score" | "code";

// Panel interactivo de KPI críticos: filtro por sección, búsqueda, orden
// por severidad, distribución de puntajes y tarjetas expandibles con la
// observación completa y acciones (ir a la sección, planificar medida).
export function CriticalKpiPanel({
  criticalIndicators,
  sections,
  sectionLabel,
  title,
  t,
  onSectionClick,
  onPlanMeasure,
  indicatorsWithMeasure,
}: CriticalKpiPanelProps) {
  const [sectionFilter, setSectionFilter] = useState<number | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("score");
  const [expanded, setExpanded] = useState<string | null>(null);

  const sectionByIndicator = useMemo(() => {
    const map = new Map<string, SectionRef>();
    for (const section of sections) {
      for (const ind of section.indicators) map.set(ind.id, section);
    }
    return map;
  }, [sections]);

  const countBySection = useMemo(() => {
    const counts = new Map<number, number>();
    for (const ind of criticalIndicators) {
      const s = sectionByIndicator.get(ind.indicatorId);
      if (s) counts.set(s.number, (counts.get(s.number) ?? 0) + 1);
    }
    return counts;
  }, [criticalIndicators, sectionByIndicator]);

  const distribution = useMemo(() => {
    const bands = [
      { label: "1–2", min: 0, max: 2, color: SCORE_COLORS.critical },
      { label: "3–4", min: 3, max: 4, color: "#E8683A" },
      { label: "5", min: 5, max: 5, color: SCORE_COLORS.medium },
    ];
    return bands.map((b) => ({
      ...b,
      count: criticalIndicators.filter(
        (i) => i.score >= b.min && i.score <= b.max
      ).length,
    }));
  }, [criticalIndicators]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = criticalIndicators.filter((ind) => {
      const s = sectionByIndicator.get(ind.indicatorId);
      if (sectionFilter !== "all" && s?.number !== sectionFilter) return false;
      if (!q) return true;
      return (
        ind.code.toLowerCase().includes(q) ||
        ind.name.toLowerCase().includes(q) ||
        ind.observation.toLowerCase().includes(q)
      );
    });
    return [...list].sort((a, b) =>
      sort === "score"
        ? a.score - b.score || a.code.localeCompare(b.code)
        : a.code.localeCompare(b.code, undefined, { numeric: true })
    );
  }, [criticalIndicators, sectionByIndicator, sectionFilter, query, sort]);

  if (criticalIndicators.length === 0) return null;
  const total = criticalIndicators.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-danger/10 text-danger">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-extrabold leading-tight">
                {title} <span className="text-danger">({total})</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("app.assessment.critical.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {distribution.map((b) => (
              <div key={b.label} className="text-center">
                <div
                  className="text-lg font-extrabold tabular-nums"
                  style={{ color: b.color }}
                >
                  {b.count}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {b.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted flex">
          {distribution.map((b) =>
            b.count > 0 ? (
              <div
                key={b.label}
                className="h-full transition-all"
                style={{
                  width: `${(b.count / total) * 100}%`,
                  background: b.color,
                }}
                title={`${b.label}: ${b.count}`}
              />
            ) : null
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSectionFilter("all")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
              sectionFilter === "all"
                ? "bg-danger text-white"
                : "bg-muted text-muted-foreground hover:bg-danger/10 hover:text-danger"
            )}
          >
            {t("app.assessment.critical.all")} · {total}
          </button>
          {sections
            .filter((s) => (countBySection.get(s.number) ?? 0) > 0)
            .map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() =>
                  setSectionFilter(
                    sectionFilter === s.number ? "all" : s.number
                  )
                }
                className={cn(
                  "max-w-[220px] truncate rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  sectionFilter === s.number
                    ? "bg-danger text-white"
                    : "bg-muted text-muted-foreground hover:bg-danger/10 hover:text-danger"
                )}
                title={s.name}
              >
                {sectionLabel} {s.number} · {countBySection.get(s.number)}
              </button>
            ))}
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("app.assessment.critical.searchPlaceholder")}
                className="h-8 w-52 pl-8 text-xs"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setSort(sort === "score" ? "code" : "score")}
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              {sort === "score"
                ? t("app.assessment.critical.sortBySeverity")
                : t("app.assessment.critical.sortByCode")}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t("app.assessment.critical.noResults")}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {visible.map((ind) => {
              const section = sectionByIndicator.get(ind.indicatorId);
              const color = scoreColor(ind.score);
              const isOpen = expanded === ind.indicatorId;
              const hasMeasure =
                indicatorsWithMeasure?.has(ind.indicatorId) ?? false;
              return (
                <div
                  key={ind.indicatorId}
                  className={cn(
                    "group rounded-2xl border bg-card p-4 transition-all animate-fade-up",
                    isOpen
                      ? "border-danger/40 shadow-card"
                      : "border-border/70 hover:border-danger/30 hover:shadow-card"
                  )}
                >
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 text-left"
                    onClick={() => setExpanded(isOpen ? null : ind.indicatorId)}
                  >
                    <RingGauge
                      value={ind.score}
                      size={52}
                      strokeWidth={5}
                      color={color}
                      integer
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-bold text-foreground/80">
                          {ind.code}
                        </span>
                        {section && (
                          <span className="rounded-md bg-brand/8 px-1.5 py-0.5 text-[11px] font-semibold text-brand-deep">
                            {sectionLabel} {section.number}
                          </span>
                        )}
                        {hasMeasure && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-success/10 px-1.5 py-0.5 text-[11px] font-semibold text-success">
                            <ListChecks className="h-3 w-3" />
                            {t("app.assessment.critical.hasMeasure")}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-semibold leading-snug">
                        {ind.name}
                      </p>
                      <p
                        className={cn(
                          "mt-1 text-xs text-muted-foreground",
                          !isOpen && "line-clamp-1"
                        )}
                      >
                        {ind.observation}
                      </p>
                    </div>
                    <ChevronDown
                      className={cn(
                        "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                      <span className="text-xs text-muted-foreground">
                        {section
                          ? `${sectionLabel} ${section.number}: ${section.name}`
                          : ""}
                      </span>
                      <div className="flex gap-2">
                        {onSectionClick && section && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => onSectionClick(section.number)}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {t("app.assessment.critical.goToSection")}
                          </Button>
                        )}
                        {onPlanMeasure && (
                          <Button
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => onPlanMeasure(ind)}
                          >
                            <Wrench className="h-3.5 w-3.5" />
                            {hasMeasure
                              ? t("app.assessment.critical.viewPlan")
                              : t("app.assessment.critical.planMeasure")}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
