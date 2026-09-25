import { useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/application/auth-context";
import { useTranslation } from "@/shared/i18n/i18n";
import { toast } from "@/shared/ui/use-toast";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Info,
  User,
  Calendar,
  ClipboardList,
  ClipboardCheck,
  ShieldAlert,
  Sparkles,
  Loader2,
  CheckCircle2,
  Flame,
} from "lucide-react";
import type { AssessmentMeasureStatus } from "@/modules/assessment-core/infrastructure/assessment-api";
import type { AssessmentGanttItem } from "@/modules/assessment-core/infrastructure/assessment-api";
import { gaugeColor } from "@/modules/assessment-core/presentation/components/gauge";
import { GanttChart } from "@/modules/assessment-core/presentation/components/gantt-chart";
import { RingGauge } from "@/modules/assessment-core/presentation/components/ring-gauge";
import {
  MeasureProgressDialog,
  type MeasureProblem,
  type MeasureProgressValues,
  type MeasureSolution,
} from "@/modules/assessment-core/presentation/components/measure-progress-dialog";
import { cn } from "@/shared/lib/utils";
import type { IndicatorToolUi } from "../../domain/indicator-tool-ui";
import type { IndicatorToolMeasure } from "../../infrastructure/indicator-tool-api";

interface SuggestionDraft {
  indicatorId: string;
  code: string;
  kpiName: string;
  score: number;
  impactScore: number;
  sectionNumber: number;
  sectionName: string;
  name: string;
  description: string;
  responsible: string;
  startDate: string;
  endDate: string;
  created: boolean;
  saving: boolean;
}

const COLUMNS: {
  status: AssessmentMeasureStatus;
  headerText: string;
  headerBg: string;
  headerDot: string;
  bar: string;
}[] = [
  {
    status: "PENDING",
    headerText: "text-muted-foreground",
    headerBg: "bg-muted",
    headerDot: "bg-muted-foreground/40",
    bar: "bg-muted-foreground/40",
  },
  {
    status: "IN_PROGRESS",
    headerText: "text-warning",
    headerBg: "bg-warning/8",
    headerDot: "bg-warning",
    bar: "bg-warning",
  },
  {
    status: "DONE",
    headerText: "text-success",
    headerBg: "bg-success/5",
    headerDot: "bg-teal",
    bar: "bg-teal",
  },
];

export function IndicatorToolActionPlanPage({ def }: { def: IndicatorToolUi }) {
  const { evaluationId } = useParams({
    from: def.routeKeys.actionPlan,
  });
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const org = auth.organisations?.current;
  const token = auth.currentUser?.accessToken;

  const queryClient = useQueryClient();
  const evaluationQuery = useQuery(def.queries.evaluation(org, evaluationId));
  const measuresQuery = useQuery(def.queries.measures(org, evaluationId));
  const evaluation = evaluationQuery.data ?? null;
  const measures = useMemo(
    () => measuresQuery.data ?? [],
    [measuresQuery.data]
  );
  const loading = evaluationQuery.isLoading || measuresQuery.isLoading;
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const [indicatorId, setIndicatorId] = useState("");
  const [name, setName] = useState("");
  const [responsible, setResponsible] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const [showAiDialog, setShowAiDialog] = useState(false);
  const [progressMeasureId, setProgressMeasureId] = useState<string | null>(
    null
  );
  const [savingProgress, setSavingProgress] = useState(false);

  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionsFailed, setSuggestionsFailed] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionDraft[]>([]);

  // Tras crear/actualizar medidas: refresca medidas, evaluación y panel.
  const loadData = useCallback(async () => {
    if (!org) return;
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: def.queries.keys.measures(org, evaluationId),
      }),
      def.queries.invalidateEvaluation(queryClient, org, evaluationId),
    ]);
  }, [def, queryClient, org, evaluationId]);

  const criticalIndicators = useMemo(() => {
    if (!evaluation) return [];
    return evaluation.responses
      .filter((r) => r.isCritical)
      .map((r) => ({
        id: r.indicatorId,
        code: r.indicator.code,
        name: r.indicator.name,
      }));
  }, [evaluation]);

  const scoreByIndicatorId = useMemo(() => {
    if (!evaluation) return {};
    return Object.fromEntries(
      evaluation.responses.map((r) => [r.indicatorId, r.score])
    );
  }, [evaluation]);

  const byPriority = useCallback(
    (a: IndicatorToolMeasure, b: IndicatorToolMeasure) => {
      const scoreA = scoreByIndicatorId[a.indicatorId] ?? 999;
      const scoreB = scoreByIndicatorId[b.indicatorId] ?? 999;
      return scoreA - scoreB;
    },
    [scoreByIndicatorId]
  );

  const measuresByStatus = useMemo(() => {
    return {
      PENDING: measures.filter((m) => m.status === "PENDING").sort(byPriority),
      IN_PROGRESS: measures
        .filter((m) => m.status === "IN_PROGRESS")
        .sort(byPriority),
      DONE: measures.filter((m) => m.status === "DONE").sort(byPriority),
    };
  }, [measures, byPriority]);

  const ganttItems: AssessmentGanttItem[] = useMemo(
    () =>
      measures.map((m) => ({
        measureId: m.id,
        description: m.name,
        responsible: m.responsible,
        start: m.startDate,
        end: m.endDate,
        progressPct: m.progressPct,
        status: m.status,
      })),
    [measures]
  );

  const overallProgressPct = useMemo(() => {
    if (measures.length === 0) return 0;
    const sum = measures.reduce((acc, m) => acc + m.progressPct, 0);
    return sum / measures.length / 10;
  }, [measures]);

  const statusLabel = useCallback(
    (status: string) => {
      if (status === "PENDING") return t(`${def.i18n}.measurePending`);
      if (status === "IN_PROGRESS") return t(`${def.i18n}.measureInProgress`);
      return t(`${def.i18n}.measureDone`);
    },
    [def, t]
  );

  const handleCreate = async () => {
    if (
      !org ||
      !token ||
      !indicatorId ||
      !name ||
      !responsible ||
      !startDate ||
      !endDate
    )
      return;
    setSaving(true);
    try {
      const refreshedToken = token;
      await def.api.createMeasure(
        org,
        evaluationId,
        {
          indicatorId,
          name,
          responsible,
          startDate,
          endDate,
          description: description || undefined,
        },
        refreshedToken
      );
      setShowNew(false);
      setIndicatorId("");
      setName("");
      setResponsible("");
      setStartDate("");
      setEndDate("");
      setDescription("");
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: t("app.common.error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateActionPlan = useCallback(async () => {
    if (!org || !token) return;
    setShowAiDialog(true);
    setLoadingSuggestions(true);
    setSuggestions([]);
    setSuggestionsFailed(false);
    try {
      const refreshedToken = token;
      const { suggestions: aiSuggestions } =
        await def.api.suggestMeasuresForEvaluation(
          org,
          evaluationId,
          refreshedToken
        );
      setSuggestions(
        aiSuggestions.map((s) => ({
          indicatorId: s.indicatorId,
          code: s.code,
          kpiName: s.name,
          score: s.score,
          impactScore: s.impactScore,
          sectionNumber: s.sectionNumber,
          sectionName: s.sectionName,
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
  }, [def, org, token, evaluationId, t]);

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
    [def, org, token, evaluationId, updateSuggestion, t, loadData]
  );

  const progressMeasure = useMemo(
    () => measures.find((m) => m.id === progressMeasureId) ?? null,
    [measures, progressMeasureId]
  );
  const progressProblem = useMemo<MeasureProblem | null>(() => {
    if (!progressMeasure || !evaluation) return null;
    const section = evaluation.template.sections.find((sec) =>
      sec.indicators.some((i) => i.id === progressMeasure.indicatorId)
    );
    const response = evaluation.responses.find(
      (r) => r.indicatorId === progressMeasure.indicatorId
    );
    return {
      code: progressMeasure.indicator.code,
      name: progressMeasure.indicator.name,
      score: response?.score,
      observation: response?.observation,
      sectionLabel: section
        ? `${t(`${def.i18n}.colSection`)} ${section.number}`
        : undefined,
    };
  }, [def, progressMeasure, evaluation, t]);
  const progressSolution = useMemo<MeasureSolution | null>(() => {
    if (!progressMeasure) return null;
    return {
      title: progressMeasure.name,
      description: progressMeasure.description,
      responsible: progressMeasure.responsible,
      support: progressMeasure.support,
      startDate: progressMeasure.startDate,
      endDate: progressMeasure.endDate,
      budgetUsd: progressMeasure.budgetUsd,
      verificationLink: progressMeasure.verificationLink,
      progressPct: progressMeasure.progressPct,
      status: progressMeasure.status,
      expectedResult: progressMeasure.expectedResult,
      appliedImprovements: progressMeasure.appliedImprovements,
    };
  }, [progressMeasure]);

  const handleSaveProgress = async (values: MeasureProgressValues) => {
    if (!org || !token || !progressMeasureId) return;
    setSavingProgress(true);
    try {
      const updated = await def.api.updateMeasureProgress(
        org,
        progressMeasureId,
        values,
        token
      );
      queryClient.setQueryData(
        def.queries.keys.measures(org, evaluationId),
        (prev: IndicatorToolMeasure[] | undefined) =>
          (prev ?? []).map((m) => (m.id === updated.id ? updated : m))
      );
      void loadData();
      setProgressMeasureId(null);
      toast({
        title: t("app.common.success"),
        description: t(`${def.i18n}.updateProgress`),
        variant: "success",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: t("app.common.error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setSavingProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="container mx-auto py-6 text-center text-muted-foreground">
        Evaluation not found
      </div>
    );
  }

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
              — {t(`${def.i18n}.actionPlan`)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => void handleGenerateActionPlan()}
            disabled={criticalIndicators.length === 0}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            {t(`${def.i18n}.generateActionPlan`)}
          </Button>
          <Button
            onClick={() => {
              setShowNew(true);
            }}
            disabled={criticalIndicators.length === 0}
          >
            <Plus className="h-4 w-4 mr-1" />
            {t(`${def.i18n}.newMeasure`)}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-danger/30 bg-danger/5">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <div className="text-xs uppercase text-danger font-semibold">
                {t("app.assessment.risk.statPlanning")}
              </div>
              <div className="text-lg font-bold mt-1 text-danger">
                {criticalIndicators.length}{" "}
                {t(`${def.i18n}.statCriticalKpisSuffix`)}
              </div>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger">
              <ShieldAlert className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <div className="text-xs uppercase text-muted-foreground font-semibold">
                {t("app.assessment.risk.statCurrentState")}
              </div>
              <div className="text-lg font-bold mt-1">
                {measures.length}{" "}
                {t("app.assessment.risk.statMeasuresRegistered")}
              </div>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/8 text-brand">
              <ClipboardCheck className="h-5 w-5" />
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center py-4">
            <div className="text-xs uppercase text-muted-foreground font-semibold self-start">
              {t("app.assessment.risk.statCompliance")}
            </div>
            <RingGauge
              value={overallProgressPct}
              label={t("app.assessment.risk.statOverallProgress")}
              size={90}
            />
          </CardContent>
        </Card>
      </div>

      {measures.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground border rounded-2xl">
          <ClipboardList className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
          {t(`${def.i18n}.noMeasures`)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {COLUMNS.map((col) => {
            const items = measuresByStatus[col.status];
            return (
              <div key={col.status} className="space-y-3">
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2",
                    col.headerBg
                  )}
                >
                  <span
                    className={cn("h-2.5 w-2.5 rounded-full", col.headerDot)}
                  />
                  <span
                    className={cn(
                      "text-xs font-bold uppercase",
                      col.headerText
                    )}
                  >
                    {col.status === "PENDING"
                      ? t(`${def.i18n}.measurePending`)
                      : col.status === "IN_PROGRESS"
                        ? t(`${def.i18n}.measureInProgress`)
                        : t(`${def.i18n}.measureDone`)}
                  </span>
                  <span className="ml-auto text-xs font-semibold text-muted-foreground">
                    {items.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {items.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
                      —
                    </div>
                  ) : (
                    items.map((measure) => {
                      const kpiScore = scoreByIndicatorId[measure.indicatorId];
                      const priorityColor =
                        kpiScore !== undefined
                          ? gaugeColor(kpiScore)
                          : "hsl(var(--muted-foreground))";
                      return (
                        <button
                          key={measure.id}
                          type="button"
                          className="w-full text-left rounded-xl border-0 shadow-sm bg-white p-3.5 transition-shadow hover:shadow-md border-l-4"
                          style={{ borderLeftColor: priorityColor }}
                          onClick={() => setProgressMeasureId(measure.id)}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="inline-block rounded bg-brand/5 border border-brand/20 text-brand-deep text-[11px] font-mono px-1.5 py-0.5">
                              {measure.indicator.code}
                            </span>
                            {kpiScore !== undefined && (
                              <span
                                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                                style={{ backgroundColor: priorityColor }}
                              >
                                {kpiScore}/10
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold leading-snug line-clamp-2">
                            {measure.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-muted shrink-0">
                              <User className="h-3 w-3" />
                            </span>
                            <span className="truncate">
                              {measure.responsible}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1.5">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span>
                              {new Date(measure.startDate).toLocaleDateString()}
                              {" → "}
                              {new Date(measure.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden mt-3 border border-black/5">
                            <div
                              className={cn("h-full rounded-full", col.bar)}
                              style={{
                                width: `${Math.max(measure.progressPct, 4)}%`,
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-end mt-1">
                            <span className="text-[11px] font-semibold text-muted-foreground">
                              {measure.progressPct}%
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {measures.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm font-semibold mb-3">
              {t(`${def.i18n}.actionPlanSchedule`)}
            </p>
            <GanttChart
              measures={ganttItems}
              statusLabel={statusLabel}
              emptyLabel={t(`${def.i18n}.noMeasures`)}
              todayLabel={t(`${def.i18n}.ganttToday`)}
              overdueSuffix={t(`${def.i18n}.ganttOverdueSuffix`)}
              daysLeftSuffix={t(`${def.i18n}.ganttDaysLeftSuffix`)}
            />
          </CardContent>
        </Card>
      )}

      <MeasureProgressDialog
        open={progressMeasureId !== null}
        onOpenChange={(open) => {
          if (!open) setProgressMeasureId(null);
        }}
        problem={progressProblem}
        solution={progressSolution}
        saving={savingProgress}
        onSave={handleSaveProgress}
        t={t}
      />

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="border-b pb-4">
            <DialogTitle style={{ color: "var(--color-brand)" }}>
              {t(`${def.i18n}.newMeasure`)}
            </DialogTitle>
            <DialogDescription>
              {t(`${def.i18n}.measureDialogSubtitle`)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase text-muted-foreground font-semibold">
                {t(`${def.i18n}.measureName`)}
              </Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground font-semibold">
                {t(`${def.i18n}.measureCriticalKpi`)}
              </Label>
              <Select value={indicatorId} onValueChange={setIndicatorId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {criticalIndicators.map((ind) => (
                    <SelectItem key={ind.id} value={ind.id}>
                      {ind.code} — {ind.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground font-semibold">
                {t(`${def.i18n}.measureResponsible`)}
              </Label>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="flex items-center justify-center h-9 w-9 shrink-0 rounded-full bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </span>
                <Input
                  value={responsible}
                  onChange={(e) => {
                    setResponsible(e.target.value);
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase text-muted-foreground font-semibold">
                  {t(`${def.i18n}.measureStartDate`)}
                </Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                  }}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs uppercase text-muted-foreground font-semibold">
                  {t(`${def.i18n}.measureEndDate`)}
                </Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                  }}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground font-semibold">
                {t(`${def.i18n}.measureDescription`)}
              </Label>
              <Textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
                className="mt-1.5"
                rows={3}
              />
            </div>
            <div className="flex gap-2 bg-brand/5 border border-brand/20 rounded-md p-3 text-xs text-brand-deep">
              <Info className="h-4 w-4 shrink-0 text-brand-deep mt-0.5" />
              <span>{t(`${def.i18n}.measureInfo`)}</span>
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowNew(false);
              }}
            >
              {t("app.common.cancel")}
            </Button>
            <Button
              onClick={() => void handleCreate()}
              disabled={
                saving ||
                !indicatorId ||
                !name ||
                !responsible ||
                !startDate ||
                !endDate
              }
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              {t(`${def.i18n}.saveMeasure`)}
            </Button>
          </DialogFooter>
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
              {t(`${def.i18n}.generatingActionPlan`)}
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
              {t(`${def.i18n}.noActionPlanSuggestions`)}
            </p>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion) => {
                const priorityColor = gaugeColor(suggestion.score);
                return (
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
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-brand/5 border border-brand/20 text-brand-deep text-[11px] font-mono px-1.5 py-0.5">
                          {suggestion.code}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {t(`${def.i18n}.section`)} {suggestion.sectionNumber}:{" "}
                          {suggestion.sectionName}
                        </span>
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                          style={{ backgroundColor: priorityColor }}
                        >
                          {suggestion.score}/10
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-warning/40 bg-warning/8 px-2 py-0.5 text-[11px] font-medium text-warning">
                          <Flame className="h-3 w-3" />
                          {t("app.assessment.common.impactPriority")}:{" "}
                          {suggestion.impactScore.toFixed(1)}
                        </span>
                      </div>
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
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
