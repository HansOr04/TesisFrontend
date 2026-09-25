import { useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/application/auth-context";
import { useTranslation } from "@/shared/i18n/i18n";
import { toast } from "@/shared/ui/use-toast";
import { Button } from "@/shared/ui/button";
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
  AlertTriangle,
  BarChart3,
  ListChecks,
  Sparkles,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react";
import type {
  AssessmentIndicatorData,
  AssessmentResponseData,
} from "@/modules/assessment-core/infrastructure/assessment-api";
import {
  Gauge,
  gaugeColor,
} from "@/modules/assessment-core/presentation/components/gauge";
import { cn } from "@/shared/lib/utils";
import type { IndicatorToolUi } from "../../domain/indicator-tool-ui";

interface SuggestionDraft {
  indicatorId: string;
  code: string;
  kpiName: string;
  name: string;
  description: string;
  responsible: string;
  startDate: string;
  endDate: string;
  created: boolean;
  saving: boolean;
}

function statusChipClasses(isCritical: boolean, hasResponse: boolean): string {
  if (isCritical) return "bg-danger/10 text-danger";
  if (hasResponse) return "bg-success/10 text-success";
  return "bg-muted text-muted-foreground";
}

function capacityLevel(
  def: IndicatorToolUi,
  score: number,
  t: (key: string) => string
): string {
  if (score <= 5) return t(`${def.i18n}.capacityLow`);
  if (score < 7) return t(`${def.i18n}.capacityMedium`);
  return t(`${def.i18n}.capacityHigh`);
}

export function IndicatorToolSectionPage({ def }: { def: IndicatorToolUi }) {
  const { evaluationId, number } = useParams({
    from: def.routeKeys.section,
  });
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const org = auth.organisations?.current;
  const token = auth.currentUser?.accessToken;
  const dimensionNumber = Number(number);

  const evaluationQuery = useQuery(def.queries.evaluation(org, evaluationId));
  const evaluation = evaluationQuery.data ?? null;
  const loading = evaluationQuery.isLoading;
  const [activeIndicator, setActiveIndicator] =
    useState<AssessmentIndicatorData | null>(null);
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionsFailed, setSuggestionsFailed] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionDraft[]>([]);

  const section = useMemo(
    () =>
      evaluation?.template.sections.find((s) => s.number === dimensionNumber),
    [evaluation, dimensionNumber]
  );
  const sectionScore = useMemo(
    () => evaluation?.sectionScores.find((s) => s.number === dimensionNumber),
    [evaluation, dimensionNumber]
  );
  const responsesByIndicator = useMemo(() => {
    if (!evaluation) return {};
    return Object.fromEntries(
      evaluation.responses.map((r) => [r.indicatorId, r])
    );
  }, [evaluation]);

  const criticalCount = useMemo(() => {
    if (!section) return 0;
    return section.indicators.filter(
      (ind) => responsesByIndicator[ind.id]?.isCritical
    ).length;
  }, [section, responsesByIndicator]);

  const answeredCount = useMemo(() => {
    if (!section) return 0;
    return section.indicators.filter((ind) => responsesByIndicator[ind.id])
      .length;
  }, [section, responsesByIndicator]);

  const activeResponse: AssessmentResponseData | undefined = activeIndicator
    ? responsesByIndicator[activeIndicator.id]
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
        await def.api.suggestMeasuresForSection(
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
          indicatorId: s.indicatorId,
          code: indicatorsById[s.indicatorId]?.code ?? "",
          kpiName: indicatorsById[s.indicatorId]?.name ?? "",
          name: s.name,
          description: s.description,
          responsible: "",
          startDate: "",
          endDate: "",
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
  }, [def, org, token, section, evaluationId, t]);

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
        await def.api.createMeasure(
          org,
          evaluationId,
          {
            indicatorId: suggestion.indicatorId,
            name: suggestion.name,
            description: suggestion.description,
            responsible: suggestion.responsible,
            startDate: suggestion.startDate,
            endDate: suggestion.endDate,
          },
          refreshedToken
        );
        updateSuggestion(suggestion.indicatorId, {
          created: true,
          saving: false,
        });
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
    [def, org, token, evaluationId, updateSuggestion, t]
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
                to: def.routes.summary,
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
              — {t(`${def.i18n}.section`)} {section.number}: {section.name}
            </span>
          </div>
        </div>
        {criticalCount > 0 && (
          <Button
            variant="outline"
            onClick={() => void handleOpenAiSuggestions()}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            {t(`${def.i18n}.suggestMeasuresAi`)}
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
                {t(`${def.i18n}.sectionAverage`)}
              </div>
              <div className="text-lg font-bold mt-0.5" style={{ color }}>
                {score.toFixed(1)} · {capacityLevel(def, score, t)}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 py-5">
            <span
              className={cn(
                "flex items-center justify-center h-11 w-11 rounded-full shrink-0",
                criticalCount > 0 ? "bg-danger/10" : "bg-muted"
              )}
            >
              <AlertTriangle
                className={cn(
                  "h-5 w-5",
                  criticalCount > 0 ? "text-danger" : "text-muted-foreground"
                )}
              />
            </span>
            <div>
              <div className="text-xs uppercase text-muted-foreground font-semibold">
                {t(`${def.i18n}.statCriticalKpi`)}
              </div>
              <div
                className={cn(
                  "text-lg font-bold mt-0.5",
                  criticalCount > 0 && "text-danger"
                )}
              >
                {criticalCount}
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
                {t(`${def.i18n}.statIndicatorsAssessed`)}
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
              {criticalCount > 0
                ? t(`${def.i18n}.statusNeedsAttention`)
                : t(`${def.i18n}.statusGoodCapacity`)}
            </span>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {section.indicators.map((indicator) => {
            const response = responsesByIndicator[indicator.id];
            const isCritical = Boolean(response?.isCritical);
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
                  isCritical && "ring-1 ring-red-200"
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
                      statusChipClasses(isCritical, response !== undefined)
                    )}
                  >
                    {isCritical
                      ? t(`${def.i18n}.statusNeedsAttention`)
                      : response !== undefined
                        ? t(`${def.i18n}.statusGoodCapacity`)
                        : t(`${def.i18n}.statusDraft`)}
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
                {activeResponse?.isCritical && (
                  <p className="flex items-center gap-1 text-xs font-semibold text-danger">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {t(`${def.i18n}.statusNeedsAttention`)}
                  </p>
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
              {t(`${def.i18n}.aiSuggestionsTitle`)}
            </DialogTitle>
            <DialogDescription>
              {t(`${def.i18n}.aiSuggestionsSubtitle`)}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 bg-brand/5 border border-brand/20 rounded-md p-3 text-xs text-brand-deep">
            <Info className="h-4 w-4 shrink-0 text-brand-deep mt-0.5" />
            <span>{t(`${def.i18n}.aiDisclaimer`)}</span>
          </div>

          {loadingSuggestions ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              {t(`${def.i18n}.generatingSuggestions`)}
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
              {t(`${def.i18n}.noAiSuggestions`)}
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
                        {t(`${def.i18n}.suggestionCreated`)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {suggestion.kpiName}
                  </p>
                  <div>
                    <Label className="text-xs uppercase text-muted-foreground font-semibold">
                      {t(`${def.i18n}.measureName`)}
                    </Label>
                    <Input
                      value={suggestion.name}
                      disabled={suggestion.created}
                      onChange={(e) => {
                        updateSuggestion(suggestion.indicatorId, {
                          name: e.target.value,
                        });
                      }}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase text-muted-foreground font-semibold">
                      {t(`${def.i18n}.measureDescription`)}
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
                      {t(`${def.i18n}.measureResponsible`)}
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
                        {t(`${def.i18n}.measureStartDate`)}
                      </Label>
                      <Input
                        type="date"
                        value={suggestion.startDate}
                        disabled={suggestion.created}
                        onChange={(e) => {
                          updateSuggestion(suggestion.indicatorId, {
                            startDate: e.target.value,
                          });
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs uppercase text-muted-foreground font-semibold">
                        {t(`${def.i18n}.measureEndDate`)}
                      </Label>
                      <Input
                        type="date"
                        value={suggestion.endDate}
                        disabled={suggestion.created}
                        onChange={(e) => {
                          updateSuggestion(suggestion.indicatorId, {
                            endDate: e.target.value,
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
                        !suggestion.name ||
                        !suggestion.responsible ||
                        !suggestion.startDate ||
                        !suggestion.endDate
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
