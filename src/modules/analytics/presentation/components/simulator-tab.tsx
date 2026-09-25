import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import { useAuth } from "@/modules/auth/application/auth-context";
import {
  fetchOrganizationalEvaluation,
  fetchOrganizationalEvaluations,
} from "@/modules/organizational-tool/infrastructure/organizational-api";
import {
  fetchCapacityEvaluation,
  fetchCapacityEvaluations,
} from "@/modules/capacity-tool/infrastructure/capacity-api";
import {
  fetchRiskEvaluation,
  fetchRiskEvaluations,
} from "@/modules/risk-tool/infrastructure/risk-api";
import type {
  AssessmentEvaluationData,
  AssessmentEvaluationListItem,
} from "@/modules/assessment-core/infrastructure/assessment-api";
import { Gauge } from "@/modules/assessment-core/presentation/components/gauge";
import { Button } from "@/shared/ui/button";
import { scoreColor } from "@/shared/design/score-colors";
import {
  marginalGain,
  simulate,
  type SimSection,
} from "../../domain/simulator";
import type { AnalyticsTool } from "../../infrastructure/analytics-api";
import { ToolTabs, TOOL_COLOR, fmt } from "./analytics-ui";
import { KeyFindings, MethodCard, Note, TabHeader } from "./analytics-layout";
import { cn } from "@/shared/lib/utils";
import { useTranslation } from "@/shared/i18n/i18n";

const LIST: Record<
  AnalyticsTool,
  (org: string, token?: string) => Promise<AssessmentEvaluationListItem[]>
> = {
  ORGANIZATIONAL: fetchOrganizationalEvaluations,
  CAPACITY: fetchCapacityEvaluations,
  RISK: fetchRiskEvaluations,
};
const DETAIL: Record<
  AnalyticsTool,
  (org: string, id: string, token?: string) => Promise<AssessmentEvaluationData>
> = {
  ORGANIZATIONAL: fetchOrganizationalEvaluation,
  CAPACITY: fetchCapacityEvaluation,
  RISK: fetchRiskEvaluation,
};

export function SimulatorTab({
  tool,
  onToolChange,
}: {
  tool: AnalyticsTool;
  onToolChange: (t: AnalyticsTool) => void;
}) {
  const auth = useAuth();
  const { t, tr } = useTranslation();
  const org = auth.organisations?.current;
  const token = auth.currentUser?.accessToken;
  const [evaluations, setEvaluations] = useState<
    AssessmentEvaluationListItem[]
  >([]);
  const [selectedId, setSelectedId] = useState("");
  const [evaluation, setEvaluation] = useState<AssessmentEvaluationData | null>(
    null
  );
  const [targets, setTargets] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!org || !token) return;
    LIST[tool](org, token)
      .then((list) => {
        // Una por organización (la más reciente con respuestas).
        const seen = new Set<string>();
        const unique = list.filter((e) =>
          seen.has(e.profile.id) ? false : (seen.add(e.profile.id), true)
        );
        setEvaluations(unique);
        setSelectedId(unique[0]?.id ?? "");
      })
      .catch(() => setEvaluations([]));
  }, [org, token, tool]);

  useEffect(() => {
    if (!org || !token || !selectedId) {
      setEvaluation(null);
      return;
    }
    setLoading(true);
    DETAIL[tool](org, selectedId, token)
      .then((e) => {
        setEvaluation(e);
        setTargets({});
      })
      .catch(() => setEvaluation(null))
      .finally(() => setLoading(false));
  }, [org, token, tool, selectedId]);

  const sections = useMemo<SimSection[]>(() => {
    if (!evaluation) return [];
    const scoreById = new Map(
      evaluation.responses.map((r) => [r.indicatorId, r.score])
    );
    return evaluation.template.sections.map((s) => ({
      number: s.number,
      name: s.name,
      weight: Number(s.weight),
      indicators: s.indicators
        .filter((i) => i.active !== false && scoreById.has(i.id))
        .map((i) => ({
          id: i.id,
          code: i.code,
          name: i.name,
          weight: Number(i.weight),
          score: Number(scoreById.get(i.id)),
        })),
    }));
  }, [evaluation]);

  const base = useMemo(() => simulate(sections, {}), [sections]);
  const result = useMemo(
    () => simulate(sections, targets),
    [sections, targets]
  );
  const critical = useMemo(
    () =>
      sections
        .flatMap((s) =>
          s.indicators
            .filter((i) => i.score <= 5)
            .map((i) => ({
              ...i,
              section: s,
              gain: marginalGain(sections, i.id),
            }))
        )
        .sort((a, b) => b.gain * (10 - a.score) - a.gain * (10 - b.score)),
    [sections]
  );
  const changed = Object.keys(targets).length;
  const bestFive = critical.slice(0, 5);

  const applyPreset = (score: number, only?: string[]) => {
    const next: Record<string, number> = {};
    for (const c of critical)
      if (!only || only.includes(c.id)) next[c.id] = Math.max(c.score, score);
    setTargets(next);
  };

  return (
    <div className="space-y-8">
      <TabHeader
        title={t("app.analytics.sim.title")}
        question={t("app.analytics.sim.question")}
      >
        <ToolTabs value={tool} onChange={onToolChange} />
      </TabHeader>

      <MethodCard
        compute={tr("app.analytics.sim.compute")}
        read={tr("app.analytics.sim.read")}
        lookFor={tr("app.analytics.sim.lookFor")}
      />
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="h-9 rounded-xl border border-border bg-card px-3 text-sm"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {evaluations.length === 0 && (
            <option value="">{t("app.analytics.sim.noEvaluations")}</option>
          )}
          {evaluations.map((e) => (
            <option key={e.id} value={e.id}>
              {e.profile.name.replace(/^Demo — /, "")} ·{" "}
              {e.status === "COMPLETED"
                ? t("app.analytics.sim.statusCompleted")
                : t("app.analytics.sim.statusInProgress")}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            applyPreset(
              6,
              bestFive.map((c) => c.id)
            )
          }
          disabled={!critical.length}
        >
          <Sparkles className="h-4 w-4" /> {t("app.analytics.sim.presetTop5")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => applyPreset(6)}
          disabled={!critical.length}
        >
          {t("app.analytics.sim.presetAll6")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => applyPreset(8)}
          disabled={!critical.length}
        >
          {t("app.analytics.sim.presetAll8")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTargets({})}
          disabled={!changed}
        >
          <RotateCcw className="h-4 w-4" /> {t("app.analytics.sim.reset")}
        </Button>
      </div>

      {loading || !evaluation ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {loading
            ? t("app.analytics.sim.loading")
            : t("app.analytics.sim.select")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
          <div className="min-w-0 space-y-3">
            {bestFive.length > 0 && (
              <KeyFindings
                items={[
                  tr("app.analytics.sim.findingLever", {
                    code: bestFive[0].code,
                    name: bestFive[0].name,
                    gain: bestFive[0].gain.toFixed(3),
                  }),
                  tr("app.analytics.sim.findingTop5", {
                    codes: bestFive.map((c) => c.code).join(", "),
                    from: fmt(base.globalScore),
                    to: fmt(
                      simulate(
                        sections,
                        Object.fromEntries(
                          bestFive.map((c) => [c.id, Math.max(c.score, 6)])
                        )
                      ).globalScore
                    ),
                  }),
                  tr("app.analytics.sim.findingCeiling", {
                    score: fmt(
                      simulate(
                        sections,
                        Object.fromEntries(
                          critical.map((c) => [c.id, Math.max(c.score, 8)])
                        )
                      ).globalScore
                    ),
                  }),
                ]}
              />
            )}
            <div className="surface divide-y">
              {critical.length === 0 && (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  {t("app.analytics.sim.noCritical")}
                </p>
              )}
              {critical.map((c) => {
                const target = targets[c.id] ?? c.score;
                return (
                  <div key={c.id} className="flex items-center gap-4 p-4">
                    <span className="w-14 rounded-md bg-muted px-1.5 py-0.5 text-center font-mono text-[11px] font-bold">
                      {c.code}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-medium"
                        title={c.name}
                      >
                        {c.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {t("app.analytics.sim.rowMeta", {
                          section: c.section.number,
                          weight: c.weight,
                          gain: c.gain.toFixed(3),
                        })}
                      </p>
                    </div>
                    <span
                      className="w-6 text-center text-xs font-bold"
                      style={{ color: scoreColor(c.score) }}
                    >
                      {c.score}
                    </span>
                    <input
                      type="range"
                      min={c.score}
                      max={10}
                      step={1}
                      value={target}
                      onChange={(e) =>
                        setTargets((prev) => ({
                          ...prev,
                          [c.id]: Number(e.target.value),
                        }))
                      }
                      className="w-48 accent-[hsl(var(--brand))]"
                    />
                    <span
                      className={cn(
                        "w-8 text-center text-sm font-extrabold tabular-nums",
                        target > c.score
                          ? "text-brand-deep"
                          : "text-muted-foreground"
                      )}
                    >
                      {target}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="min-w-0 space-y-4">
            <div className="surface p-8 text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("app.analytics.sim.projected")}
              </div>
              <div className="mt-2 flex justify-center">
                <Gauge value={result.globalScore} size="lg" />
              </div>
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">
                  {t("app.analytics.sim.current", {
                    score: fmt(base.globalScore),
                  })}
                </span>
                <span className="mx-2">→</span>
                <span
                  className="text-2xl font-extrabold"
                  style={{ color: scoreColor(result.globalScore) }}
                >
                  {fmt(result.globalScore)}
                </span>
                {changed > 0 && (
                  <span className="ml-2 rounded-full bg-success/12 px-2 py-0.5 text-xs font-bold text-success">
                    +{(result.globalScore - base.globalScore).toFixed(2)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("app.analytics.sim.changed", { n: changed })}
              </p>
            </div>
            <div className="surface p-6">
              <h3 className="text-lg font-extrabold">
                {t("app.analytics.sim.bySection")}
              </h3>
              <Note>{t("app.analytics.sim.bySectionNote")}</Note>
              <ul className="mt-3 space-y-3">
                {result.sections.map((s) => (
                  <li key={s.number} className="text-sm">
                    <div className="flex justify-between">
                      <span className="truncate">
                        {s.number}. {s.name}
                      </span>
                      <span className="tabular-nums">
                        <span className="text-muted-foreground">
                          {fmt(s.before)}
                        </span>{" "}
                        →{" "}
                        <b style={{ color: scoreColor(s.after) }}>
                          {fmt(s.after)}
                        </b>
                      </span>
                    </div>
                    <div className="relative mt-1.5 h-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className="absolute h-full rounded-full opacity-40"
                        style={{
                          width: `${s.before * 10}%`,
                          background: TOOL_COLOR[tool],
                        }}
                      />
                      <div
                        className="absolute h-full rounded-full"
                        style={{
                          width: `${s.after * 10}%`,
                          background: TOOL_COLOR[tool],
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
