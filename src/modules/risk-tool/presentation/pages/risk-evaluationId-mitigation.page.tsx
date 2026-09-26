import { routeKeys } from "@/shared/config/route-keys";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/application/auth-context";
import { useTranslation } from "@/shared/i18n/i18n";
import { toast } from "@/shared/ui/use-toast";
import { useSetPageHeaderName } from "@/shared/components/page-header-context";
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
  ShieldAlert,
  ClipboardCheck,
  ClipboardList,
  Sparkles,
  Loader2,
  CheckCircle2,
  Info,
  Flame,
  User,
  Calendar,
} from "lucide-react";
import {
  createRiskMeasure,
  updateRiskMeasureProgress,
  suggestRiskMeasuresForEvaluation,
} from "@/modules/risk-tool/infrastructure/risk-api";
import { riskQueries } from "@/modules/risk-tool/application/risk-queries";
import type {
  AssessmentRiskData,
  AssessmentMitigationMeasureData,
} from "@/modules/risk-tool/infrastructure/risk-api";
import type { AssessmentMeasureStatus } from "@/modules/assessment-core/infrastructure/assessment-api";
import { RingGauge } from "@/modules/assessment-core/presentation/components/ring-gauge";
import { GanttChart } from "@/modules/assessment-core/presentation/components/gantt-chart";
import {
  MeasureProgressDialog,
  type MeasureProblem,
  type MeasureProgressValues,
  type MeasureSolution,
} from "@/modules/assessment-core/presentation/components/measure-progress-dialog";
import { gaugeColor } from "@/modules/assessment-core/presentation/components/gauge";
import { cn } from "@/shared/lib/utils";

interface SuggestionDraft {
  riskId: string;
  indicatorId: string;
  code: string;
  score: number;
  impactScore: number;
  sectionNumber: number;
  sectionName: string;
  description: string;
  responsible: string;
  startWeek: string;
  durationDays: string;
  resources: string;
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

export function RiskMitigationPage() {
  const { evaluationId } = useParams({ from: routeKeys.riskToolMitigation });
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate({
    from: "/assessments/risk/$evaluationId/mitigation",
  });

  const statusLabel = useCallback(
    (status: string) => {
      if (status === "PENDING")
        return t("app.assessment.organizational.measurePending");
      if (status === "IN_PROGRESS")
        return t("app.assessment.organizational.measureInProgress");
      return t("app.assessment.organizational.measureDone");
    },
    [t]
  );

  const org = auth.organisations?.current;
  const token = auth.currentUser?.accessToken;

  const queryClient = useQueryClient();
  const evaluationQuery = useQuery(riskQueries.evaluation(org, evaluationId));
  const risksQuery = useQuery(riskQueries.measures(org, evaluationId));
  const ganttQuery = useQuery(riskQueries.gantt(org, evaluationId));
  const evaluation = evaluationQuery.data ?? null;
  useSetPageHeaderName(evaluation?.profile.name);
  const risks = useMemo(() => risksQuery.data ?? [], [risksQuery.data]);
  const gantt = useMemo(() => ganttQuery.data ?? [], [ganttQuery.data]);
  const loading =
    evaluationQuery.isLoading || risksQuery.isLoading || ganttQuery.isLoading;

  const [showNewMeasure, setShowNewMeasure] = useState(false);
  const [selectedRiskId, setSelectedRiskId] = useState("");
  const [description, setDescription] = useState("");
  const [responsible, setResponsible] = useState("");
  const [support, setSupport] = useState("");
  const [startWeek, setStartWeek] = useState("");
  const [durationDays, setDurationDays] = useState("14");
  const [resources, setResources] = useState("");
  const [budgetUsd, setBudgetUsd] = useState("");
  const [verificationLink, setVerificationLink] = useState("");
  const [saving, setSaving] = useState(false);

  const [progressMeasureId, setProgressMeasureId] = useState<string | null>(
    null
  );

  const [showAiDialog, setShowAiDialog] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionsFailed, setSuggestionsFailed] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionDraft[]>([]);

  // Tras crear/actualizar medidas: refresca riesgos, Gantt, evaluación y panel.
  const loadData = useCallback(async () => {
    if (!org) return;
    await riskQueries.invalidateEvaluation(queryClient, org, evaluationId);
  }, [queryClient, org, evaluationId]);

  const nonNegligibleCount = useMemo(
    () => risks.filter((r) => r.class === "NON_NEGLIGIBLE").length,
    [risks]
  );
  const allMeasures = useMemo(() => risks.flatMap((r) => r.measures), [risks]);

  const progressMeasure = useMemo(
    () => allMeasures.find((m) => m.id === progressMeasureId) ?? null,
    [allMeasures, progressMeasureId]
  );
  const progressProblem = useMemo<MeasureProblem | null>(() => {
    if (!progressMeasure || !evaluation) return null;
    const risk = risks.find((r) => r.id === progressMeasure.riskId);
    if (!risk) return null;
    const section = evaluation.template.sections.find((sec) =>
      sec.indicators.some((i) => i.id === risk.indicatorId)
    );
    const indicator = section?.indicators.find(
      (i) => i.id === risk.indicatorId
    );
    const response = evaluation.responses.find(
      (r) => r.indicatorId === risk.indicatorId
    );
    return {
      code: indicator?.code ?? "",
      name: indicator?.name ?? "",
      score: response?.score,
      observation: response?.observation,
      sectionLabel: section
        ? `${t("app.assessment.risk.colPrinciple")} ${section.number}`
        : undefined,
      riskDescription: risk.description,
      riskType: risk.riskType,
      riskClass:
        risk.class === "NON_NEGLIGIBLE"
          ? t("app.assessment.risk.classNonNegligible")
          : t("app.assessment.risk.classNegligible"),
    };
  }, [progressMeasure, evaluation, risks, t]);
  const progressSolution = useMemo<MeasureSolution | null>(() => {
    if (!progressMeasure) return null;
    return {
      title: progressMeasure.description,
      responsible: progressMeasure.responsible,
      support: progressMeasure.support,
      startDate: progressMeasure.startWeek,
      endDate: progressMeasure.endDate,
      budgetUsd: progressMeasure.budgetUsd,
      verificationLink: progressMeasure.verificationLink,
      progressPct: progressMeasure.progressPct,
      status: progressMeasure.status,
      expectedResult: progressMeasure.expectedResult,
      appliedImprovements: progressMeasure.appliedImprovements,
    };
  }, [progressMeasure]);
  const overallProgressPct = useMemo(() => {
    if (allMeasures.length === 0) return 0;
    const sum = allMeasures.reduce((acc, m) => acc + m.progressPct, 0);
    return sum / allMeasures.length / 10;
  }, [allMeasures]);

  const riskByMeasureId = useMemo(() => {
    const map: Record<string, AssessmentRiskData> = {};
    for (const risk of risks) {
      for (const measure of risk.measures) {
        map[measure.id] = risk;
      }
    }
    return map;
  }, [risks]);

  const kpiByIndicatorId = useMemo(() => {
    const map: Record<string, { code: string; score: number }> = {};
    if (!evaluation) return map;
    for (const r of evaluation.responses) {
      map[r.indicatorId] = { code: r.indicator.code, score: r.score };
    }
    return map;
  }, [evaluation]);

  const measuresByStatus = useMemo(() => {
    return {
      PENDING: allMeasures.filter((m) => m.status === "PENDING"),
      IN_PROGRESS: allMeasures.filter((m) => m.status === "IN_PROGRESS"),
      DONE: allMeasures.filter((m) => m.status === "DONE"),
    };
  }, [allMeasures]);

  const nonNegligibleRisks = useMemo(
    () => risks.filter((r) => r.class === "NON_NEGLIGIBLE"),
    [risks]
  );

  const openNewMeasure = () => {
    setSelectedRiskId("");
    setDescription("");
    setResponsible("");
    setSupport("");
    setStartWeek("");
    setDurationDays("14");
    setResources("");
    setBudgetUsd("");
    setVerificationLink("");
    setShowNewMeasure(true);
  };

  const handleCreateMeasure = async () => {
    if (
      !org ||
      !token ||
      !selectedRiskId ||
      !description ||
      !responsible ||
      !startWeek ||
      !durationDays
    )
      return;
    setSaving(true);
    try {
      const refreshedToken = token;
      await createRiskMeasure(
        org,
        selectedRiskId,
        {
          description,
          responsible,
          support: support || undefined,
          startWeek,
          durationDays: Number(durationDays),
          resources: resources || undefined,
          budgetUsd: budgetUsd.trim() ? Number(budgetUsd) : undefined,
          verificationLink: verificationLink || undefined,
        },
        refreshedToken
      );
      setShowNewMeasure(false);
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

  const openProgress = (measure: AssessmentMitigationMeasureData) => {
    setProgressMeasureId(measure.id);
  };

  const handleSaveProgress = async (values: MeasureProgressValues) => {
    if (!org || !token || !progressMeasureId) return;
    setSaving(true);
    try {
      const refreshedToken = token;
      await updateRiskMeasureProgress(
        org,
        progressMeasureId,
        values,
        refreshedToken
      );
      setProgressMeasureId(null);
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

  const handleGenerateMitigationPlan = useCallback(async () => {
    if (!org || !token) return;
    setShowAiDialog(true);
    setLoadingSuggestions(true);
    setSuggestions([]);
    setSuggestionsFailed(false);
    try {
      const refreshedToken = token;
      const { suggestions: aiSuggestions } =
        await suggestRiskMeasuresForEvaluation(
          org,
          evaluationId,
          refreshedToken
        );
      setSuggestions(
        aiSuggestions.map((s) => ({
          riskId: s.riskId,
          indicatorId: s.indicatorId,
          code: s.code,
          score: s.score,
          impactScore: s.impactScore,
          sectionNumber: s.sectionNumber,
          sectionName: s.sectionName,
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
  }, [org, token, evaluationId, t]);

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
              — {t("app.assessment.risk.mitigationPlan")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => void handleGenerateMitigationPlan()}
            disabled={nonNegligibleCount === 0}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            {t("app.assessment.risk.generateMitigationPlan")}
          </Button>
          <Button onClick={openNewMeasure} disabled={nonNegligibleCount === 0}>
            <Plus className="h-4 w-4 mr-1" />
            {t("app.assessment.risk.newMeasure")}
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
                {nonNegligibleCount}{" "}
                {t("app.assessment.risk.statNonNegligibleRisks")}
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
                {allMeasures.length}{" "}
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

      {allMeasures.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground border rounded-2xl">
          <ClipboardList className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
          {risks.length === 0
            ? t("app.assessment.risk.noRisks")
            : t("app.assessment.organizational.noMeasures")}
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
                      ? t("app.assessment.organizational.measurePending")
                      : col.status === "IN_PROGRESS"
                        ? t("app.assessment.organizational.measureInProgress")
                        : t("app.assessment.organizational.measureDone")}
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
                      const risk = riskByMeasureId[measure.id];
                      const kpi = risk
                        ? kpiByIndicatorId[risk.indicatorId]
                        : undefined;
                      const priorityColor =
                        kpi !== undefined
                          ? gaugeColor(kpi.score)
                          : "hsl(var(--muted-foreground))";
                      return (
                        <button
                          key={measure.id}
                          type="button"
                          className="w-full text-left rounded-xl border-0 shadow-sm bg-white p-3.5 transition-shadow hover:shadow-md border-l-4"
                          style={{ borderLeftColor: priorityColor }}
                          onClick={() => {
                            openProgress(measure);
                          }}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            {kpi ? (
                              <>
                                <span className="inline-block rounded bg-brand/5 border border-brand/20 text-brand-deep text-[11px] font-mono px-1.5 py-0.5">
                                  {kpi.code}
                                </span>
                                <span
                                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                                  style={{ backgroundColor: priorityColor }}
                                >
                                  {kpi.score}/10
                                </span>
                              </>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">
                                {t("app.assessment.risk.riskLabel")}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold leading-snug line-clamp-2">
                            {measure.description}
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
                              {new Date(measure.startWeek).toLocaleDateString()}
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

      <Card>
        <CardContent className="py-4">
          <p className="text-sm font-semibold mb-3">
            {t("app.assessment.risk.mitigationSchedule")}
          </p>
          <GanttChart
            measures={gantt}
            statusLabel={statusLabel}
            emptyLabel={t("app.assessment.risk.noGanttMeasures")}
            todayLabel={t("app.assessment.organizational.ganttToday")}
            overdueSuffix={t(
              "app.assessment.organizational.ganttOverdueSuffix"
            )}
            daysLeftSuffix={t(
              "app.assessment.organizational.ganttDaysLeftSuffix"
            )}
          />
        </CardContent>
      </Card>

      <Dialog
        open={showNewMeasure}
        onOpenChange={(open) => {
          setShowNewMeasure(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: "var(--color-brand)" }}>
              {t("app.assessment.risk.newMeasure")}
            </DialogTitle>
            <DialogDescription>
              {t("app.assessment.risk.measureDialogSubtitle")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase text-muted-foreground font-semibold">
                {t("app.assessment.risk.measureAssociatedRisk")}
              </Label>
              <Select value={selectedRiskId} onValueChange={setSelectedRiskId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {nonNegligibleRisks.map((risk) => (
                    <SelectItem key={risk.id} value={risk.id}>
                      {risk.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground font-semibold">
                {t("app.assessment.organizational.measureDescription")}
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
            <div>
              <Label className="text-xs uppercase text-muted-foreground font-semibold">
                {t("app.assessment.organizational.measureResponsible")}
              </Label>
              <Input
                value={responsible}
                onChange={(e) => {
                  setResponsible(e.target.value);
                }}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground font-semibold">
                {t("app.assessment.organizational.measureSupport")}
              </Label>
              <Input
                value={support}
                onChange={(e) => {
                  setSupport(e.target.value);
                }}
                placeholder={t(
                  "app.assessment.organizational.measureSupportPlaceholder"
                )}
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase text-muted-foreground font-semibold">
                  {t("app.assessment.risk.colStartWeek")}
                </Label>
                <Input
                  type="date"
                  value={startWeek}
                  onChange={(e) => {
                    setStartWeek(e.target.value);
                  }}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs uppercase text-muted-foreground font-semibold">
                  {t("app.assessment.risk.colDuration")}
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={durationDays}
                  onChange={(e) => {
                    setDurationDays(e.target.value);
                  }}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground font-semibold">
                {t("app.assessment.risk.resources")}
              </Label>
              <Input
                value={resources}
                onChange={(e) => {
                  setResources(e.target.value);
                }}
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase text-muted-foreground font-semibold">
                  {t("app.assessment.organizational.measureBudget")}
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={budgetUsd}
                  onChange={(e) => {
                    setBudgetUsd(e.target.value);
                  }}
                  placeholder="0"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs uppercase text-muted-foreground font-semibold">
                  {t("app.assessment.organizational.measureVerificationLink")}
                </Label>
                <Input
                  value={verificationLink}
                  onChange={(e) => {
                    setVerificationLink(e.target.value);
                  }}
                  placeholder={t(
                    "app.assessment.organizational.measureVerificationLinkPlaceholder"
                  )}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewMeasure(false);
              }}
            >
              {t("app.common.cancel")}
            </Button>
            <Button
              onClick={() => void handleCreateMeasure()}
              disabled={
                saving ||
                !selectedRiskId ||
                !description ||
                !responsible ||
                !startWeek ||
                !durationDays
              }
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              {t("app.assessment.organizational.saveMeasure")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MeasureProgressDialog
        open={progressMeasureId !== null}
        onOpenChange={(open) => {
          if (!open) setProgressMeasureId(null);
        }}
        problem={progressProblem}
        solution={progressSolution}
        saving={saving}
        onSave={handleSaveProgress}
        t={t}
      />

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
              {t("app.assessment.risk.generatingMitigationPlan")}
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
              {t("app.assessment.risk.noMitigationPlanSuggestions")}
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
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-brand/5 border border-brand/20 text-brand-deep text-[11px] font-mono px-1.5 py-0.5">
                        {suggestion.code}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {t("app.assessment.risk.principle")}{" "}
                        {suggestion.sectionNumber}: {suggestion.sectionName}
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
                        {t("app.assessment.organizational.suggestionCreated")}
                      </span>
                    )}
                  </div>
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
