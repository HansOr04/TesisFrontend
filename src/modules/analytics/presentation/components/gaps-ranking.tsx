import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  ChevronDown,
  Search,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import { scoreColor } from "@/shared/design/score-colors";
import { RingGauge } from "@/modules/assessment-core/presentation/components/ring-gauge";
import type {
  AnalyticsTool,
  GapsResponse,
  SystemicGap,
} from "../../infrastructure/analytics-api";
import { TOOL_COLOR, fmt, pct } from "./analytics-ui";
import { useTranslation } from "@/shared/i18n/i18n";

type SortKey = "priority" | "criticalRate" | "coverage" | "avgScore";

const SORT_KEY: Record<SortKey, string> = {
  priority: "app.analytics.ranking.sortPriority",
  criticalRate: "app.analytics.ranking.sortCriticalRate",
  coverage: "app.analytics.ranking.sortCoverage",
  avgScore: "app.analytics.ranking.sortAvgScore",
};

// Ranking visual de brechas sistémicas: cada KPI es una fila-tarjeta con
// barras (frecuencia crítica, prioridad), anillo de promedio, cobertura de
// medidas y un detalle expandible con las organizaciones afectadas.
export function GapsRanking({
  data,
  tool,
}: {
  data: GapsResponse;
  tool: AnalyticsTool;
}) {
  const { t, tr } = useTranslation();
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<number | "all">("all");
  const [onlyUncovered, setOnlyUncovered] = useState(false);
  const [sort, setSort] = useState<SortKey>("priority");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const maxPriority = Math.max(1, ...data.gaps.map((g) => g.priority));
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = data.gaps.filter((g) => {
      if (g.criticalCount === 0) return false;
      if (section !== "all" && g.sectionNumber !== section) return false;
      if (onlyUncovered && g.measureCoverage >= 0.5) return false;
      if (
        q &&
        !`${g.code} ${g.name} ${g.sectionName}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
    const by: Record<SortKey, (a: SystemicGap, b: SystemicGap) => number> = {
      priority: (a, b) => b.priority - a.priority,
      criticalRate: (a, b) =>
        b.criticalRate - a.criticalRate || b.priority - a.priority,
      coverage: (a, b) =>
        a.measureCoverage - b.measureCoverage || b.priority - a.priority,
      avgScore: (a, b) => a.avgScore - b.avgScore || b.priority - a.priority,
    };
    return [...list].sort(by[sort]);
  }, [data.gaps, query, section, onlyUncovered, sort]);
  const visible = showAll ? rows : rows.slice(0, 12);
  const rankOf = (g: SystemicGap) =>
    data.gaps.findIndex((x) => x.code === g.code) + 1;

  return (
    <div className="surface p-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("app.analytics.ranking.search")}
            className="h-10 w-64 pl-9"
          />
        </div>
        <div className="inline-flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSection("all")}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-semibold",
              section === "all"
                ? "text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
            style={
              section === "all" ? { background: TOOL_COLOR[tool] } : undefined
            }
          >
            {t("app.analytics.ranking.all")}
          </button>
          {data.sections.map((s) => (
            <button
              key={s.number}
              type="button"
              title={s.name}
              onClick={() =>
                setSection(section === s.number ? "all" : s.number)
              }
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-semibold",
                section === s.number
                  ? "text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
              style={
                section === s.number
                  ? { background: TOOL_COLOR[tool] }
                  : undefined
              }
            >
              S{s.number}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOnlyUncovered((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold",
              onlyUncovered
                ? "border-danger/40 bg-danger/8 text-danger"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <ShieldOff className="h-4 w-4" />{" "}
            {t("app.analytics.ranking.uncovered")}
          </button>
          <button
            type="button"
            onClick={() =>
              setSort(
                (k) =>
                  (
                    [
                      "priority",
                      "criticalRate",
                      "coverage",
                      "avgScore",
                    ] as SortKey[]
                  )[
                    ((
                      [
                        "priority",
                        "criticalRate",
                        "coverage",
                        "avgScore",
                      ] as SortKey[]
                    ).indexOf(k) +
                      1) %
                      4
                  ]
              )
            }
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowUpDown className="h-4 w-4" /> {t(SORT_KEY[sort])}
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {visible.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t("app.analytics.ranking.empty")}
          </p>
        )}
        {visible.map((g) => {
          const isOpen = expanded === g.code;
          const rank = rankOf(g);
          return (
            <div
              key={g.code}
              className={cn(
                "rounded-3xl border transition-all",
                isOpen
                  ? "border-brand/40 shadow-card"
                  : "border-border/70 hover:border-brand/30 hover:shadow-card"
              )}
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : g.code)}
                className="w-full p-6 text-left"
              >
                <div className="flex items-start gap-5">
                  <span
                    className={cn(
                      "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-extrabold",
                      rank <= 3
                        ? "bg-danger/10 text-danger"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-muted px-2.5 py-1 font-mono text-sm font-bold">
                        {g.code}
                      </span>
                      <span
                        className="rounded-lg px-2.5 py-1 text-sm font-semibold text-white"
                        style={{ background: TOOL_COLOR[tool] }}
                      >
                        {g.sectionNumber}. {g.sectionName}
                      </span>
                      <span className="rounded-lg bg-muted px-2.5 py-1 text-sm text-muted-foreground">
                        {t("app.analytics.ranking.weight", { w: g.weight })}
                      </span>
                    </div>
                    <p className="mt-3 text-xl font-bold leading-snug">
                      {g.name}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "mt-2 h-6 w-6 shrink-0 text-muted-foreground transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
                  <div className="rounded-2xl bg-muted/50 p-5">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t("app.analytics.ranking.criticalIn")}
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold tabular-nums text-danger">
                        {g.criticalCount}
                      </span>
                      <span className="text-base text-muted-foreground">
                        {t("app.analytics.ranking.ofOrganisations", {
                          n: g.evaluated,
                        })}
                      </span>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-danger"
                        style={{ width: `${g.criticalRate * 100}%` }}
                      />
                    </div>
                    <div className="mt-1.5 text-sm text-muted-foreground">
                      {t("app.analytics.ranking.ofEvaluated", {
                        pct: pct(g.criticalRate),
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-2xl bg-muted/50 p-5">
                    <RingGauge
                      value={g.avgScore}
                      size={84}
                      strokeWidth={8}
                      color={scoreColor(g.avgScore)}
                    />
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {t("app.analytics.ranking.mean")}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {g.avgScore <= 5
                          ? t("app.analytics.ranking.zoneCritical")
                          : g.avgScore < 7
                            ? t("app.analytics.ranking.zoneMedium")
                            : t("app.analytics.ranking.zoneHigh")}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-muted/50 p-5">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t("app.analytics.ranking.coverage")}
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-3xl font-extrabold tabular-nums",
                          g.measureCoverage >= 0.5
                            ? "text-success"
                            : "text-warning"
                        )}
                      >
                        {g.measureCoverage >= 0.5 ? (
                          <ShieldCheck className="h-6 w-6" />
                        ) : (
                          <AlertTriangle className="h-6 w-6" />
                        )}
                        {g.withMeasure}
                      </span>
                      <span className="text-base text-muted-foreground">
                        {t("app.analytics.ranking.withMeasure", {
                          n: g.criticalCount,
                        })}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-1">
                      {Array.from({ length: g.criticalCount }, (_, i) => (
                        <span
                          key={i}
                          className={cn(
                            "h-3 flex-1 rounded-sm",
                            i < g.withMeasure ? "bg-success" : "bg-muted"
                          )}
                        />
                      ))}
                    </div>
                    <div className="mt-1.5 text-sm text-muted-foreground">
                      {t("app.analytics.ranking.covered", {
                        pct: pct(g.measureCoverage),
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-muted/50 p-5">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t("app.analytics.ranking.priority")}
                    </div>
                    <div
                      className="mt-2 text-3xl font-extrabold tabular-nums"
                      style={{ color: TOOL_COLOR[tool] }}
                    >
                      {g.priority.toFixed(2)}
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(g.priority / maxPriority) * 100}%`,
                          background: TOOL_COLOR[tool],
                        }}
                      />
                    </div>
                    <div className="mt-1.5 text-sm text-muted-foreground">
                      {t("app.analytics.ranking.ofMax", {
                        pct: Math.round((g.priority / maxPriority) * 100),
                      })}
                    </div>
                  </div>
                </div>
              </button>
              {isOpen && (
                <div className="border-t px-6 py-6 animate-fade-up">
                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.4fr]">
                    <div className="rounded-2xl bg-muted/50 p-6 text-[15px] leading-relaxed">
                      <p className="text-base font-bold">
                        {t("app.analytics.ranking.reading")}
                      </p>
                      <p className="mt-1 text-foreground/80">
                        {tr("app.analytics.ranking.readingBase", {
                          critical: g.criticalCount,
                          evaluated: g.evaluated,
                          rate: pct(g.criticalRate),
                          avg: fmt(g.avgScore),
                          weight: g.weight,
                          tail:
                            g.withMeasure === 0
                              ? t("app.analytics.ranking.readingNone")
                              : g.measureCoverage < 0.5
                                ? t("app.analytics.ranking.readingFew", {
                                    n: g.withMeasure,
                                  })
                                : t("app.analytics.ranking.readingMost"),
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="mb-3 text-base font-bold">
                        {t("app.analytics.ranking.affected")}
                      </p>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {(g.criticalOrganisations ?? []).map((o) => (
                          <div
                            key={o.profileId}
                            className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card px-4 py-3"
                          >
                            <span
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-extrabold text-white"
                              style={{ background: scoreColor(o.score) }}
                            >
                              {o.score}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[15px] font-semibold">
                                {o.profileName.replace(/^Demo — /, "")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {o.hasMeasure
                                  ? t("app.analytics.ranking.measureStatus", {
                                      status: t(
                                        `app.analytics.ranking.status${o.measureStatus ?? "PENDING"}`
                                      ),
                                      progress: o.measureProgress ?? 0,
                                    })
                                  : t("app.analytics.ranking.noMeasure")}
                              </p>
                            </div>
                            {o.hasMeasure ? (
                              <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
                            ) : (
                              <ShieldOff className="h-4 w-4 shrink-0 text-warning" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {rows.length > 12 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-muted/60 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          {showAll
            ? t("app.analytics.ranking.showLess")
            : t("app.analytics.ranking.showAll", { n: rows.length })}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              showAll && "rotate-180"
            )}
          />
        </button>
      )}
    </div>
  );
}
