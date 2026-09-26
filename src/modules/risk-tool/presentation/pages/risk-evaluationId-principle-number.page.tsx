import { routeKeys } from "@/shared/config/route-keys";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/application/auth-context";
import { useTranslation } from "@/shared/i18n/i18n";
import { toast } from "@/shared/ui/use-toast";
import { useSetPageHeaderName } from "@/shared/components/page-header-context";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import {
  ArrowLeft,
  ShieldAlert,
  BarChart3,
  ListChecks,
  Sparkles,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  suggestRiskMeasuresForPrinciple,
  createRiskMeasure,
} from "@/modules/risk-tool/infrastructure/risk-api";
import { riskQueries } from "@/modules/risk-tool/application/risk-queries";
import type {
  AssessmentIndicatorData,
  AssessmentResponseData,
} from "@/modules/assessment-core/infrastructure/assessment-api";
import type { AssessmentRiskData } from "@/modules/risk-tool/infrastructure/risk-api";
import {
  Gauge,
  gaugeColor,
} from "@/modules/assessment-core/presentation/components/gauge";
import { cn } from "@/shared/lib/utils";

interface SuggestionDraft {
  riskId: string;
  indicatorId: string;
  code: string;
  kpiName: string;
  description: string;
  responsible: string;
  startWeek: string;
  durationDays: string;
  resources: string;
  created: boolean;
  saving: boolean;
}

function statusChipClasses(
  isNonNegligible: boolean,
  hasResponse: boolean
): string {
  if (isNonNegligible) return "bg-danger/10 text-danger";
  if (hasResponse) return "bg-success/10 text-success";
  return "bg-muted text-muted-foreground";
}

function capacityLevel(score: number, t: (key: string) => string): string {
  if (score <= 5) return t("app.assessment.organizational.capacityLow");
  if (score < 7) return t("app.assessment.organizational.capacityMedium");
  return t("app.assessment.organizational.capacityHigh");
}

export function RiskPrincipleAnalysisPage() {
  const { evaluationId, number } = useParams({
    from: routeKeys.riskToolPrincipleAnalysis,
  });
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate({
    from: "/assessments/risk/$evaluationId/principle/$number",
  });

  const org = auth.organisations?.current;
  const token = auth.currentUser?.accessToken;
  const principleNumber = Number(number);

  const queryClient = useQueryClient();
  const evaluationQuery = useQuery(riskQueries.evaluation(org, evaluationId));
  const risksQuery = useQuery(riskQueries.measures(org, evaluationId));
  const evaluation = evaluationQuery.data ?? null;
  useSetPageHeaderName(evaluation?.profile.name);
  const risks = useMemo(() => risksQuery.data ?? [], [risksQuery.data]);
  const loading = evaluationQuery.isLoading || risksQuery.isLoading;
  const [activeIndicator, setActiveIndicator] =
    useState<AssessmentIndicatorData | null>(null);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionsFailed, setSuggestionsFailed] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionDraft[]>([]);

  const loadData = useCallback(async () => {
    if (!org) return;
    await riskQueries.invalidateEvaluation(queryClient, org, evaluationId);
  }, [queryClient, org, evaluationId]);

  const section = useMemo(
    () =>
      evaluation?.template.sections.find((s) => s.number === principleNumber),
    [evaluation, principleNumber]
  );
  const sectionScore = useMemo(
    () => evaluation?.sectionScores.find((s) => s.number === principleNumber),
    [evaluation, principleNumber]
  );
  const responsesByIndicator = useMemo(() => {
    if (!evaluation) return {};
    return Object.fromEntries(
      evaluation.responses.map((r) => [r.indicatorId, r])
    );
  }, [evaluation]);
  const risksByIndicator = useMemo(() => {
    return Object.fromEntries(risks.map((r) => [r.indicatorId, r]));
  }, [risks]);

  const nonNegligibleCount = useMemo(() => {
    if (!section) return 0;
    return section.indicators.filter(
      (ind) => risksByIndicator[ind.id]?.class === "NON_NEGLIGIBLE"
    ).length;
  }, [section, risksByIndicator]);

  const pendingRiskCount = useMemo(() => {
    if (!section) return 0;
    return section.indicators.filter((ind) => {
      const risk = risksByIndicator[ind.id];
      return risk?.class === "NON_NEGLIGIBLE" && risk.measures.length === 0;
    }).length;
  }, [section, risksByIndicator]);

  const answeredCount = useMemo(() => {
    if (!section) return 0;
    return section.indicators.filter((ind) => responsesByIndicator[ind.id])
      .length;
  }, [section, responsesByIndicator]);

  const activeResponse: AssessmentResponseData | undefined = activeIndicator
    ? responsesByIndicator[activeIndicator.id]
    : undefined;
  const activeRisk: AssessmentRiskData | undefined = activeIndicator
    ? risksByIndicator[activeIndicator.id]
    : undefined;

  const handleOpenAiSuggestions = useCallback(async () => {
    if (!org || !token || !section) return;
    setShowAiDialog(true);
    setLoadingSuggestions(true);
    setSuggestions([]);
    setSuggestionsFailed(false);
    try {
      const refreshedToken = token;
      const { suggestions: aiSuggestions } =
        await suggestRiskMeasuresForPrinciple(
          org,
          evaluationId,
          section.number,
          refreshedToken
        );
      const indicatorsById = Object.fromEntries(
        section.indicators.map((ind) => [ind.id, ind])
      );
      setSuggestions(
        aiSuggestions.map((s) => ({
          riskId: s.riskId,
          indicatorId: s.indicatorId,
          code: indicatorsById[s.indicatorId]?.code ?? "",
          kpiName: indicatorsById[s.indicatorId]?.name ?? "",
          description: s.description,
          responsible: "",
          startWeek: "",
          durationDays: "14",
          resources: "",
          created: false,
          saving: false,
        }))
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setSuggestionsFailed(true);
      toast({
        title: t("app.common.error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoadingSuggestions(false);
    }
  }, [org, token, section, evaluationId, t]);

  const updateSuggestion = useCallback(
    (indicatorId: string, patch: Partial<SuggestionDraft>) => {
      setSuggestions((prev) =>
        prev.map((s) =>
          s.indicatorId === indicatorId ? { ...s, ...patch } : s
        )
      );
    },
    []
  );

  const handleCreateSuggestion = useCallback(
    async (suggestion: SuggestionDraft) => {
      if (!org || !token) return;
      updateSuggestion(suggestion.indicatorId, { saving: true });
      try {
        const refreshedToken = token;
        await createRiskMeasure(
          org,
          suggestion.riskId,
          {
            description: suggestion.description,
            responsible: suggestion.responsible,
            startWeek: suggestion.startWeek,
            durationDays: Number(suggestion.durationDays),
            resources: suggestion.resources || undefined,
          },
          refreshedToken
        );
        updateSuggestion(suggestion.indicatorId, {
          created: true,
          saving: false,
        });
        await loadData();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        toast({
          title: t("app.common.error"),
          description: message,
          variant: "destructive",
        });
        updateSuggestion(suggestion.indicatorId, { saving: false });
      }
    },
    [org, token, updateSuggestion, t, loadData]
  );

  if (loading) {
    return (
      <div className="container mx-auto py-6 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!evaluation || !section) {
    return (
      <div className="container mx-auto py-6 text-center text-muted-foreground">
        Evaluation not found
      </div>
    );
  }

  const score = sectionScore?.weightedAvg ?? 0;
  const color = gaugeColor(score);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("app.common.back")}
            onClick={() =>
              void navigate({
                to: "/assessments/risk/$evaluationId/summary",
                params: { evaluationId },
              })
            }
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <span
              className="text-lg font-bold"
              style={{ color: "var(--color-brand)" }}
            >
              {evaluation.profile.name}
            </span>
            <span className="text-sm text-muted-foreground ml-2">
              — {t("app.assessment.risk.principle")} {section.number}:{" "}
              {section.name}
            </span>
          </div>
        </div>
        {pendingRiskCount > 0 && (
          <Button
            variant="outline"
            onClick={() => void handleOpenAiSuggestions()}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            {t("app.assessment.organizational.suggestMeasuresAi")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 py-5">
            <span
              className="flex items-center justify-center h-11 w-11 rounded-full shrink-0"
              style={{ backgroundColor: `${color}22` }}
            >
              <BarChart3 className="h-5 w-5" style={{ color }} />
            </span>
            <div>
              <div className="text-xs uppercase text-muted-foreground font-semibold">
                {t("app.assessment.risk.principleAverage")}
              </div>
              <div className="text-lg font-bold mt-0.5" style={{ color }}>
                {score.toFixed(1)} · {capacityLevel(score, t)}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 py-5">
            <span
              className={cn(
                "flex items-center justify-center h-11 w-11 rounded-full shrink-0",
                nonNegligibleCount > 0 ? "bg-danger/10" : "bg-muted"
              )}
            >
              <ShieldAlert
                className={cn(
                  "h-5 w-5",
                  nonNegligibleCount > 0
                    ? "text-danger"
                    : "text-muted-foreground"
                )}
              />
            </span>
            <div>
              <div className="text-xs uppercase text-muted-foreground font-semibold">
                {t("app.assessment.risk.statCriticalRisks")}
              </div>
              <div
                className={cn(
                  "text-lg font-bold mt-0.5",
                  nonNegligibleCount > 0 && "text-danger"
                )}
              >
                {nonNegligibleCount}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 py-5">
            <span className="flex items-center justify-center h-11 w-11 rounded-full shrink-0 bg-brand/5">
              <ListChecks className="h-5 w-5 text-brand" />
            </span>
            <div>
              <div className="text-xs uppercase text-muted-foreground font-semibold">
                {t("app.assessment.organizational.statIndicatorsAssessed")}
              </div>
              <div className="text-lg font-bold mt-0.5">
                {answeredCount} / {section.indicators.length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 h-fit border-0 shadow-sm">
          <CardContent className="flex flex-col items-center py-6">
            <p
              className="text-sm font-semibold text-center"
              style={{ color: "var(--color-brand)" }}
            >
              {section.name}
            </p>
            <Gauge value={score} size="lg" />
            <span
              className="text-xs font-semibold mt-2 rounded-full px-3 py-1"
              style={{ color, backgroundColor: `${color}1F` }}
            >
              {nonNegligibleCount > 0
                ? t("app.assessment.organizational.statusNeedsAttention")
                : t("app.assessment.organizational.statusGoodCapacity")}
            </span>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {section.indicators.map((indicator) => {
            const response = responsesByIndicator[indicator.id];
            const risk = risksByIndicator[indicator.id];
            const isNonNegligible = risk?.class === "NON_NEGLIGIBLE";
            const kpiColor = response
              ? gaugeColor(response.score)
              : "hsl(var(--border))";
            const pct = response ? (response.score / 10) * 100 : 0;
            return (
              <button
                key={indicator.id}
                type="button"
                className={cn(
                  "text-left rounded-2xl border-0 shadow-sm bg-white p-4 transition-shadow hover:shadow-md",
                  isNonNegligible && "ring-1 ring-red-200"
                )}
                onClick={() => {
                  setActiveIndicator(indicator);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted-foreground">
                    {indicator.code}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      statusChipClasses(isNonNegligible, response !== undefined)
                    )}
                  >
                    {isNonNegligible
                      ? t("app.assessment.risk.classNonNegligible")
                      : response !== undefined
                        ? t("app.assessment.risk.classNegligible")
                        : t("app.assessment.organizational.statusDraft")}
                  </span>
                </div>
                <p className="text-sm font-semibold leading-snug line-clamp-2 min-h-[2.5rem]">
                  {indicator.name}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span
                    className="text-2xl font-bold"
                    style={{
                      color: response
                        ? kpiColor
                        : "hsl(var(--muted-foreground))",
                    }}
                  >
                    {response !== undefined ? response.score : "–"}
                    <span className="text-xs text-muted-foreground font-medium">
                      /10
                    </span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: kpiColor }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Dialog
        open={activeIndicator !== null}
        onOpenChange={(open) => {
          if (!open) setActiveIndicator(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          {activeIndicator && (
            <>
              <DialogHeader>
                <DialogTitle style={{ color: "var(--color-brand)" }}>
                  {activeIndicator.code} — {activeIndicator.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {activeResponse !== undefined && (
                  <span
                    className="inline-block rounded-full px-3 py-1 text-sm font-semibold text-white"
                    style={{
                      backgroundColor: gaugeColor(activeResponse.score),
                    }}
                  >
                    {activeResponse.score}/10
                  </span>
                )}
                {activeIndicator.description && (
                  <p className="text-sm text-muted-foreground">
                    {activeIndicator.description}
                  </p>
                )}
                {activeResponse?.observation && (
                  <p className="text-sm italic border-l-2 border-muted pl-3 text-muted-foreground">
                    &ldquo;{activeResponse.observation}&rdquo;
                  </p>
                )}
                {activeRisk && (
                  <div className="border-t pt-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase text-muted-foreground">
                        {t("app.assessment.risk.riskSectionTitle")}
                      </span>
                      <Badge
                        variant={
                          activeRisk.class === "NON_NEGLIGIBLE"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {activeRisk.class === "NON_NEGLIGIBLE"
                          ? t("app.assessment.risk.classNonNegligible")
                          : t("app.assessment.risk.classNegligible")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activeRisk.description}
                    </p>
                    {activeRisk.riskType && (
                      <p className="text-xs text-muted-foreground">
                        {activeRisk.riskType}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: "var(--color-brand)" }}>
              {t("app.assessment.organizational.aiSuggestionsTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("app.assessment.organizational.aiSuggestionsSubtitle")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 bg-brand/5 border border-brand/20 rounded-md p-3 text-xs text-brand-deep">
            <Info className="h-4 w-4 shrink-0 text-brand-deep mt-0.5" />
            <span>{t("app.assessment.organizational.aiDisclaimer")}</span>
          </div>

          {loadingSuggestions ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              {t("app.assessment.organizational.generatingSuggestions")}
            </div>
          ) : suggestionsFailed ? (
            <p
              className="text-center text-sm py-6"
              style={{ color: "var(--color-warning)" }}
            >
              {t("app.assessment.common.aiSuggestionsFailed")}
            </p>
          ) : suggestions.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">
              {t("app.assessment.risk.noAiSuggestionsForPrinciple")}
            </p>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.indicatorId}
                  className={cn(
                    "rounded-xl border p-4 space-y-3",
                    suggestion.created
                      ? "border-success/30 bg-success/5/50"
                      : "border-[var(--color-track)]"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded bg-brand/5 border border-brand/20 text-brand-deep text-[11px] font-mono px-1.5 py-0.5">
                      {suggestion.code}
                    </span>
                    {suggestion.created && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t("app.assessment.organizational.suggestionCreated")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {suggestion.kpiName}
                  </p>
                  <div>
                    <Label className="text-xs uppercase text-muted-foreground font-semibold">
                      {t("app.assessment.organizational.measureDescription")}
                    </Label>
                    <Textarea
                      value={suggestion.description}
                      disabled={suggestion.created}
                      onChange={(e) => {
                        updateSuggestion(suggestion.indicatorId, {
                          description: e.target.value,
                        });
                      }}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase text-muted-foreground font-semibold">
                      {t("app.assessment.organizational.measureResponsible")}
                    </Label>
                    <Input
                      value={suggestion.responsible}
                      disabled={suggestion.created}
                      onChange={(e) => {
                        updateSuggestion(suggestion.indicatorId, {
                          responsible: e.target.value,
                        });
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs uppercase text-muted-foreground font-semibold">
                        {t("app.assessment.risk.colStartWeek")}
                      </Label>
                      <Input
                        type="date"
                        value={suggestion.startWeek}
                        disabled={suggestion.created}
                        onChange={(e) => {
                          updateSuggestion(suggestion.indicatorId, {
                            startWeek: e.target.value,
                          });
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs uppercase text-muted-foreground font-semibold">
                        {t("app.assessment.risk.colDuration")}
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={suggestion.durationDays}
                        disabled={suggestion.created}
                        onChange={(e) => {
                          updateSuggestion(suggestion.indicatorId, {
                            durationDays: e.target.value,
                          });
                        }}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      disabled={
                        suggestion.created ||
                        suggestion.saving ||
                        !suggestion.responsible ||
                        !suggestion.startWeek ||
                        !suggestion.durationDays
                      }
                      onClick={() => void handleCreateSuggestion(suggestion)}
                      style={{ backgroundColor: "var(--color-accent)" }}
                    >
                      {suggestion.saving && (
                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                      )}
                      {t("app.common.create")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
