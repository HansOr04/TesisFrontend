import { useMemo, useState } from "react";
import { ChevronDown, Flame, Info, Trophy, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { scoreColor } from "@/shared/design/score-colors";
import { RingGauge } from "./ring-gauge";

export interface ImpactPriorityDisplayItem {
  indicatorId: string;
  code: string;
  name: string;
  score: number;
  impactScore: number;
  sectionLabel: string;
  weight?: number;
}

interface ImpactPriorityPanelProps {
  items: ImpactPriorityDisplayItem[];
  t: (key: string) => string;
  /** Abre el plan para crear la medida de este KPI. */
  onPlanMeasure?: (item: ImpactPriorityDisplayItem) => void;
}

const INITIAL_VISIBLE = 8;
const PODIUM_STYLE = [
  { ring: "ring-warning/60", badge: "bg-warning text-white", label: "1" },
  {
    ring: "ring-muted-foreground/30",
    badge: "bg-muted-foreground/70 text-white",
    label: "2",
  },
  { ring: "ring-[#C67B3C]/50", badge: "bg-[#C67B3C] text-white", label: "3" },
];

// Ranking de KPI críticos por impacto (peso × brecha bajo el umbral): podio
// con los 3 primeros, barras relativas al máximo, filtro por sección y lista
// colapsable para no abrumar cuando hay decenas de KPI.
export function ImpactPriorityPanel({
  items,
  t,
  onPlanMeasure,
}: ImpactPriorityPanelProps) {
  const [sectionFilter, setSectionFilter] = useState<string | "all">("all");
  const [showAll, setShowAll] = useState(false);

  const maxImpact = useMemo(
    () => Math.max(1, ...items.map((i) => i.impactScore)),
    [items]
  );
  const sections = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of items)
      map.set(i.sectionLabel, (map.get(i.sectionLabel) ?? 0) + 1);
    return [...map.entries()].sort((a, b) =>
      a[0].localeCompare(b[0], undefined, { numeric: true })
    );
  }, [items]);

  const ranked = useMemo(
    () => [...items].sort((a, b) => b.impactScore - a.impactScore),
    [items]
  );
  const filtered = useMemo(
    () =>
      sectionFilter === "all"
        ? ranked
        : ranked.filter((i) => i.sectionLabel === sectionFilter),
    [ranked, sectionFilter]
  );
  const podium = sectionFilter === "all" ? ranked.slice(0, 3) : [];
  const rest = sectionFilter === "all" ? filtered.slice(3) : filtered;
  const visible = showAll ? rest : rest.slice(0, INITIAL_VISIBLE);
  const rankOf = (item: ImpactPriorityDisplayItem) =>
    ranked.findIndex((r) => r.indicatorId === item.indicatorId) + 1;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/12 text-warning">
              <Flame className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-extrabold leading-tight">
                {t("app.assessment.common.impactPriority")}{" "}
                <span className="text-muted-foreground font-semibold">
                  ({items.length})
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("app.assessment.common.impactPrioritySubtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-muted/70 px-3 py-2 text-[11px] text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            {t("app.assessment.impact.formula")}
          </div>
        </div>
        {sections.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSectionFilter("all")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                sectionFilter === "all"
                  ? "bg-warning text-white"
                  : "bg-muted text-muted-foreground hover:bg-warning/10 hover:text-warning"
              )}
            >
              {t("app.assessment.critical.all")} · {items.length}
            </button>
            {sections.map(([label, count]) => (
              <button
                key={label}
                type="button"
                title={label}
                onClick={() =>
                  setSectionFilter(sectionFilter === label ? "all" : label)
                }
                className={cn(
                  "max-w-[240px] truncate rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  sectionFilter === label
                    ? "bg-warning text-white"
                    : "bg-muted text-muted-foreground hover:bg-warning/10 hover:text-warning"
                )}
              >
                {label} · {count}
              </button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t("app.assessment.common.impactPriorityEmpty")}
          </p>
        ) : (
          <>
            {podium.length > 0 && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {podium.map((item, idx) => {
                  const style = PODIUM_STYLE[idx];
                  return (
                    <div
                      key={item.indicatorId}
                      className={cn(
                        "relative rounded-2xl bg-gradient-to-br from-warning/10 to-card p-4 ring-2 animate-fade-up",
                        style.ring
                      )}
                    >
                      <span
                        className={cn(
                          "absolute -top-2.5 left-4 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold shadow",
                          style.badge
                        )}
                      >
                        {idx === 0 ? (
                          <Trophy className="h-3.5 w-3.5" />
                        ) : (
                          style.label
                        )}
                      </span>
                      <div className="flex items-start justify-between gap-2 pt-1">
                        <span className="rounded-md bg-card px-1.5 py-0.5 font-mono text-[11px] font-bold shadow-sm">
                          {item.code}
                        </span>
                        <span className="inline-flex items-center gap-1 text-lg font-extrabold tabular-nums text-warning">
                          <Flame className="h-4 w-4" />
                          {item.impactScore.toFixed(1)}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug">
                        {item.name}
                      </p>
                      <p className="mt-1 truncate text-[11px] text-muted-foreground">
                        {item.sectionLabel}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ background: scoreColor(item.score) }}
                          />
                          {t("app.assessment.common.impactPriorityScore")}:{" "}
                          <b>{item.score}/10</b>
                        </span>
                        {onPlanMeasure && (
                          <Button
                            size="sm"
                            className="h-7 px-2 text-[11px]"
                            onClick={() => onPlanMeasure(item)}
                          >
                            <Wrench className="h-3 w-3" />
                            {t("app.assessment.critical.planMeasure")}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {rest.length > 0 && (
              <ul className="space-y-1.5">
                {visible.map((item) => {
                  const rank = rankOf(item);
                  const pct = (item.impactScore / maxImpact) * 100;
                  return (
                    <li
                      key={item.indicatorId}
                      className="group flex items-center gap-3 rounded-xl border border-border/70 bg-card px-3 py-2.5 transition-all hover:border-warning/40 hover:shadow-card"
                    >
                      <span className="w-7 shrink-0 text-center text-xs font-extrabold tabular-nums text-muted-foreground">
                        #{rank}
                      </span>
                      <RingGauge
                        value={item.score}
                        size={40}
                        strokeWidth={4}
                        color={scoreColor(item.score)}
                        integer
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10.5px] font-bold text-foreground/80">
                            {item.code}
                          </span>
                          <p className="truncate text-sm font-semibold">
                            {item.name}
                          </p>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-warning to-danger"
                              style={{ width: `${Math.max(pct, 3)}%` }}
                            />
                          </div>
                          <span className="w-10 shrink-0 text-right text-xs font-bold tabular-nums text-warning">
                            {item.impactScore.toFixed(1)}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {item.sectionLabel}
                        </p>
                      </div>
                      {onPlanMeasure && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 shrink-0 text-xs opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                          onClick={() => onPlanMeasure(item)}
                        >
                          <Wrench className="h-3.5 w-3.5" />
                          {t("app.assessment.critical.planMeasure")}
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {rest.length > INITIAL_VISIBLE && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-muted/60 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                {showAll
                  ? t("app.assessment.impact.showLess")
                  : `${t("app.assessment.impact.showAll")} (${rest.length - INITIAL_VISIBLE})`}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    showAll && "rotate-180"
                  )}
                />
              </button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
