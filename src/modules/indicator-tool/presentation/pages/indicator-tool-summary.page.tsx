import { useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/application/auth-context";
import { useTranslation } from "@/shared/i18n/i18n";
import { toast } from "@/shared/ui/use-toast";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
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
  ClipboardList,
  FileSpreadsheet,
  Presentation,
  Sparkles,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { HttpResponseError } from "@/shared/lib/http-response-error";
import { ExecutiveSummary } from "@/modules/assessment-core/presentation/components/executive-summary";
import { ImpactPriorityPanel } from "@/modules/assessment-core/presentation/components/impact-priority-panel";
import { EvolutionHistory } from "@/modules/assessment-core/presentation/components/evolution-history";
import {
  PlanMeasureDialog,
  type AiMeasureSuggestion,
  type PlanMeasureValues,
} from "@/modules/assessment-core/presentation/components/plan-measure-dialog";
import type { MeasureProblem } from "@/modules/assessment-core/presentation/components/measure-progress-dialog";
import type { IndicatorToolUi } from "../../domain/indicator-tool-ui";
import type {
  AssessmentInconsistencyFinding,
  NarrativeTone,
} from "../../infrastructure/indicator-tool-api";

export function IndicatorToolSummaryPage({ def }: { def: IndicatorToolUi }) {
  const { evaluationId } = useParams({
    from: def.routeKeys.summary,
  });
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const org = auth.organisations?.current;
  const token = auth.currentUser?.accessToken;

  const queryClient = useQueryClient();
  const evaluationQuery = useQuery(def.queries.evaluation(org, evaluationId));
  const evaluation = evaluationQuery.data ?? null;
  const loading = evaluationQuery.isLoading;
  const [completing, setCompleting] = useState(false);
  const [missingMessage, setMissingMessage] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const [checkingInconsistencies, setCheckingInconsistencies] = useState(false);
  const [inconsistencyFindings, setInconsistencyFindings] = useState<
    AssessmentInconsistencyFinding[]
  >([]);
  const [showInconsistencyDialog, setShowInconsistencyDialog] = useState(false);

  const [narrativeTone, setNarrativeTone] =
    useState<NarrativeTone>("technical");
  const [narrative, setNarrative] = useState<string | null>(null);
  const [generatingNarrative, setGeneratingNarrative] = useState(false);

  // Determinístico, sin costo de IA — se carga junto al resumen.
  const impactQuery = useQuery(def.queries.impactPriority(org, evaluationId));
  const impactPriorityItems = useMemo(
    () => impactQuery.data?.items ?? [],
    [impactQuery.data]
  );
  const historyQuery = useQuery(
    def.queries.history(org, evaluation?.profile.id)
  );
  const evaluationHistory = useMemo(
    () => historyQuery.data ?? [],
    [historyQuery.data]
  );

  // Tras completar o planificar: refresca evaluación, prioridad, historial y panel.
  const loadEvaluation = useCallback(async () => {
    if (!org) return;
    await Promise.all([
      def.queries.invalidateEvaluation(queryClient, org, evaluationId),
      queryClient.invalidateQueries({
        queryKey: def.queries.keys.impact(org, evaluationId),
      }),
    ]);
  }, [def, queryClient, org, evaluationId]);
  const reloadImpactPriority = loadEvaluation;

  const runComplete = useCallback(async () => {
    if (!org || !token) return;
    setCompleting(true);
    setMissingMessage(null);
    try {
      const refreshedToken = token;
      await def.api.completeEvaluation(org, evaluationId, refreshedToken);
      toast({
        title: t("app.common.success"),
        description: t("app.assessments.assessmentCompleted"),
        variant: "success",
      });
      await loadEvaluation();
    } catch (err: unknown) {
      if (err instanceof HttpResponseError && err.status === 422) {
        setMissingMessage(t(`${def.i18n}.missingResponses`));
      } else {
        const message = err instanceof Error ? err.message : "Unknown error";
        toast({
          title: t("app.common.error"),
          description: message,
          variant: "destructive",
        });
      }
    } finally {
      setCompleting(false);
    }
  }, [def, org, token, evaluationId, t, loadEvaluation]);

  // Antes de completar, el módulo de IA revisa si hay contradicciones entre
  // KPI relacionados (S9 del cronograma de tesis). Si no encuentra nada, no
  // agrega fricción y completa directo.
  const handleComplete = useCallback(async () => {
    if (!org || !token) return;
    setCheckingInconsistencies(true);
    try {
      const refreshedToken = token;
      const { findings } = await def.api.detectInconsistencies(
        org,
        evaluationId,
        refreshedToken
      );
      if (findings.length > 0) {
        setInconsistencyFindings(findings);
        setShowInconsistencyDialog(true);
        return;
      }
      await runComplete();
    } catch {
      // AI consistency check is an assist, not a gate — if it errors (e.g.
      // provider timeout/malformed response), don't block completion.
      toast({
        title: t("app.common.warning"),
        description: t("app.assessment.common.inconsistencyCheckSkipped"),
        variant: "default",
      });
      await runComplete();
    } finally {
      setCheckingInconsistencies(false);
    }
  }, [def, org, token, evaluationId, t, runComplete]);

  const handleCompleteAnyway = useCallback(() => {
    setShowInconsistencyDialog(false);
    void runComplete();
  }, [runComplete]);

  const handleGenerateNarrative = useCallback(async () => {
    if (!org || !token) return;
    setGeneratingNarrative(true);
    try {
      const refreshedToken = token;
      const { narrative: text } = await def.api.generateExecutiveNarrative(
        org,
        evaluationId,
        narrativeTone,
        refreshedToken
      );
      setNarrative(text);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: t("app.common.error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setGeneratingNarrative(false);
    }
  }, [def, org, token, evaluationId, narrativeTone, t]);

  const handleExport = useCallback(async () => {
    if (!org || !token) return;
    setExporting(true);
    try {
      const refreshedToken = token;
      await def.api.exportSummary(org, evaluationId, refreshedToken);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: t("app.common.error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  }, [def, org, token, evaluationId, t]);

  const handleExportPptx = useCallback(async () => {
    if (!org || !token) return;
    setExporting(true);
    try {
      const refreshedToken = token;
      await def.api.exportSummaryPptx(
        org,
        evaluationId,
        narrative,
        refreshedToken
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: t("app.common.error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  }, [def, org, token, evaluationId, narrative, t]);

  const criticalIndicators = useMemo(() => {
    if (!evaluation) return [];
    return evaluation.responses
      .filter((r) => r.isCritical)
      .map((r) => ({
        indicatorId: r.indicatorId,
        code: r.indicator.code,
        name: r.indicator.name,
        score: r.score,
        observation: r.observation,
      }));
  }, [evaluation]);

  // ── Planificar medida desde un KPI crítico (popup con el problema cargado) ──
  const [planIndicatorId, setPlanIndicatorId] = useState<string | null>(null);
  const [planSaving, setPlanSaving] = useState(false);

  const planProblem = useMemo<MeasureProblem | null>(() => {
    if (!planIndicatorId || !evaluation) return null;
    const section = evaluation.template.sections.find((sec) =>
      sec.indicators.some((i) => i.id === planIndicatorId)
    );
    const indicator = section?.indicators.find((i) => i.id === planIndicatorId);
    const response = evaluation.responses.find(
      (r) => r.indicatorId === planIndicatorId
    );
    if (!indicator) return null;
    return {
      code: indicator.code,
      name: indicator.name,
      score: response?.score,
      observation: response?.observation,
      sectionLabel: section
        ? `${t(`${def.i18n}.colSection`)} ${section.number}: ${section.name}`
        : undefined,
    };
  }, [def, planIndicatorId, evaluation, t]);

  const planSectionNumber = useMemo(() => {
    if (!planIndicatorId || !evaluation) return null;
    return (
      evaluation.template.sections.find((sec) =>
        sec.indicators.some((i) => i.id === planIndicatorId)
      )?.number ?? null
    );
  }, [planIndicatorId, evaluation]);

  const handleSuggestMeasure =
    async (): Promise<AiMeasureSuggestion | null> => {
      if (!org || !token || !planIndicatorId || planSectionNumber === null)
        return null;
      const { suggestions } = await def.api.suggestMeasuresForSection(
        org,
        evaluationId,
        planSectionNumber,
        token
      );
      const match = suggestions.find(
        (sug) => sug.indicatorId === planIndicatorId
      );
      return match
        ? { name: match.name, description: match.description }
        : null;
    };

  const handleCreatePlannedMeasure = async (values: PlanMeasureValues) => {
    if (!org || !token || !planIndicatorId) return;
    setPlanSaving(true);
    try {
      await def.api.createMeasure(
        org,
        evaluationId,
        {
          indicatorId: planIndicatorId,
          name: values.name ?? values.description.slice(0, 80),
          description: values.description,
          responsible: values.responsible,
          support: values.support,
          startDate: values.startDate,
          endDate: values.endDate,
          budgetUsd: values.budgetUsd,
          verificationLink: values.verificationLink,
          expectedResult: values.expectedResult,
        },
        token
      );
      setPlanIndicatorId(null);
      toast({
        title: t("app.common.success"),
        description: t("app.assessment.plan.created"),
        variant: "success",
      });
      void reloadImpactPriority();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: t("app.common.error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setPlanSaving(false);
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

  const isCompleted = evaluation.status === "COMPLETED";

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("app.common.back")}
          onClick={() =>
            void navigate({
              to: def.routes.evaluation,
              params: { evaluationId },
            })
          }
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 flex items-center justify-between flex-wrap gap-3">
          <div>
            <span
              className="text-lg font-bold"
              style={{ color: "var(--color-brand)" }}
            >
              {evaluation.profile.name}
            </span>
            <span className="text-sm text-muted-foreground ml-2">
              — {t(`${def.i18n}.executiveSummary`)}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={isCompleted ? "default" : "secondary"}>
              {isCompleted
                ? t(`${def.i18n}.statusCompleted`)
                : evaluation.status === "IN_PROGRESS"
                  ? t(`${def.i18n}.statusInProgress`)
                  : t(`${def.i18n}.statusDraft`)}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              disabled={exporting}
              onClick={() => void handleExport()}
              className="rounded-full border-teal text-teal hover:bg-teal/10 hover:text-teal"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4 mr-1" />
              )}
              {t("app.assessment.common.exportExcel")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={exporting}
              onClick={() => void handleExportPptx()}
              className="rounded-full border-teal text-teal hover:bg-teal/10 hover:text-teal"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Presentation className="h-4 w-4 mr-1" />
              )}
              {t("app.assessment.common.exportReport")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                void navigate({
                  to: def.routes.actionPlan,
                  params: { evaluationId },
                })
              }
            >
              <ClipboardList className="h-4 w-4 mr-1" />
              {t(`${def.i18n}.actionPlan`)}
            </Button>
          </div>
        </div>
      </div>

      <ExecutiveSummary
        globalScore={evaluation.globalScore}
        sectionScores={evaluation.sectionScores}
        sections={evaluation.template.sections}
        responses={evaluation.responses}
        criticalIndicators={criticalIndicators}
        completed={isCompleted}
        completing={completing || checkingInconsistencies}
        missingMessage={missingMessage}
        t={t}
        onComplete={() => void handleComplete()}
        onPlanMeasure={(ind) => setPlanIndicatorId(ind.indicatorId)}
        onDimensionClick={(number) =>
          void navigate({
            to: def.routes.section,
            params: { evaluationId, number: String(number) },
          })
        }
        labels={{
          title: t(`${def.i18n}.title`),
          subtitle: t(`${def.i18n}.subtitle`),
          statCriticalKpi: t(`${def.i18n}.statCriticalKpi`),
          statDimensionsAssessed: t(`${def.i18n}.statSectionsAssessed`),
          summaryByDimension: t(`${def.i18n}.summaryBySection`),
          colDimension: t(`${def.i18n}.colSection`),
          criticalIndicators: t(`${def.i18n}.criticalIndicators`),
          completeEvaluation: t(`${def.i18n}.completeEvaluation`),
        }}
      />

      <PlanMeasureDialog
        open={planIndicatorId !== null}
        onOpenChange={(open) => {
          if (!open) setPlanIndicatorId(null);
        }}
        problem={planProblem}
        scheduleMode="dates"
        requireName={true}
        saving={planSaving}
        onSave={handleCreatePlannedMeasure}
        onSuggest={handleSuggestMeasure}
        blockedReason={null}
        t={t}
      />

      <EvolutionHistory history={evaluationHistory} t={t} />

      <ImpactPriorityPanel
        items={impactPriorityItems.map((item) => ({
          indicatorId: item.indicatorId,
          code: item.code,
          name: item.name,
          score: item.score,
          impactScore: item.impactScore,
          weight: item.weight,
          sectionLabel: `${item.sectionNumber}. ${item.sectionName}`,
        }))}
        onPlanMeasure={(ind) => setPlanIndicatorId(ind.indicatorId)}
        t={t}
      />

      <Card>
        <CardContent className="py-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p
              className="flex items-center gap-2 text-base font-bold"
              style={{ color: "var(--color-brand)" }}
            >
              <Sparkles className="h-4 w-4" />
              {t("app.assessment.common.executiveNarrative")}
            </p>
            <div className="flex items-center gap-2">
              <Select
                value={narrativeTone}
                onValueChange={(v) => {
                  setNarrativeTone(v as NarrativeTone);
                }}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">
                    {t("app.assessment.common.narrativeToneTechnical")}
                  </SelectItem>
                  <SelectItem value="informative">
                    {t("app.assessment.common.narrativeToneInformative")}
                  </SelectItem>
                  <SelectItem value="formal">
                    {t("app.assessment.common.narrativeToneFormal")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                disabled={generatingNarrative}
                onClick={() => void handleGenerateNarrative()}
                style={{ backgroundColor: "var(--color-accent)" }}
              >
                {generatingNarrative ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-1" />
                )}
                {generatingNarrative
                  ? t("app.assessment.common.generatingNarrative")
                  : t("app.assessment.common.generateNarrative")}
              </Button>
            </div>
          </div>
          {narrative && (
            <p className="rounded-md border border-[var(--color-track)] bg-muted/30 p-3 text-sm text-muted-foreground whitespace-pre-line">
              {narrative}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={showInconsistencyDialog}
        onOpenChange={setShowInconsistencyDialog}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle
              className="flex items-center gap-2"
              style={{ color: "var(--color-warning)" }}
            >
              <AlertTriangle className="h-5 w-5" />
              {t("app.assessment.common.inconsistenciesFoundTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("app.assessment.common.inconsistenciesFoundSubtitle")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {inconsistencyFindings.map((finding, idx) => (
              <div
                key={idx}
                className="rounded-md border border-warning/40 bg-warning/8 p-3 text-sm"
              >
                <p className="font-semibold mb-1">
                  {finding.indicators.map((i) => i.code).join(" · ")}
                </p>
                <p className="text-muted-foreground">{finding.description}</p>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowInconsistencyDialog(false);
              }}
            >
              {t("app.assessment.common.reviewAgain")}
            </Button>
            <Button
              onClick={handleCompleteAnyway}
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              {t("app.assessment.common.completeAnyway")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
