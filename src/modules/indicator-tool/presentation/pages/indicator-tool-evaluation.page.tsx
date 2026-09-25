import { useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/modules/auth/application/auth-context";
import { useTranslation } from "@/shared/i18n/i18n";
import { toast } from "@/shared/ui/use-toast";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import type {
  AssessmentEvaluationData,
  AssessmentKpiResponseInput,
} from "@/modules/assessment-core/infrastructure/assessment-api";
import {
  DimensionView,
  type DraftResponse,
} from "@/modules/assessment-core/presentation/components/section-panel";
import { RingGauge } from "@/modules/assessment-core/presentation/components/ring-gauge";
import { useAssessmentSession } from "@/modules/realtime/application/use-assessment-session";
import { HttpResponseError } from "@/shared/lib/http-response-error";
import {
  enqueueAssessmentSave,
  flushAssessmentQueue,
} from "@/modules/realtime/infrastructure/offline-queue";
import type { IndicatorToolUi } from "../../domain/indicator-tool-ui";

function areDraftsEqual(
  a: Record<string, DraftResponse>,
  b: Record<string, DraftResponse>
): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if (
      a[key]?.score !== b[key]?.score ||
      a[key]?.observation !== b[key]?.observation
    ) {
      return false;
    }
  }
  return true;
}

export function IndicatorToolEvaluationPage({ def }: { def: IndicatorToolUi }) {
  const { evaluationId } = useParams({
    from: def.routeKeys.evaluation,
  });
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const org = auth.organisations?.current;
  const token = auth.currentUser?.accessToken;

  const [evaluation, setEvaluation] = useState<AssessmentEvaluationData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Record<string, DraftResponse>>({});
  const [savedDraft, setSavedDraft] = useState<Record<string, DraftResponse>>(
    {}
  );
  const [dimensionIndex, setDimensionIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [improvingIndicatorId, setImprovingIndicatorId] = useState<
    string | null
  >(null);

  const loadEvaluation = useCallback(
    async (silent = false) => {
      if (!org || !token) return;
      if (!silent) setLoading(true);
      try {
        const refreshedToken = token;
        const data = await def.api.fetchEvaluation(
          org,
          evaluationId,
          refreshedToken
        );
        setEvaluation(data);
        const initialDraft: Record<string, DraftResponse> = {};
        for (const r of data.responses) {
          initialDraft[r.indicatorId] = {
            score: r.score,
            observation: r.observation,
          };
        }
        setDraft(initialDraft);
        setSavedDraft(initialDraft);
      } catch (err: unknown) {
        console.error("Failed to load Organizational evaluation", err);
        const message = err instanceof Error ? err.message : "Unknown error";
        toast({
          title: t("app.common.error"),
          description: message,
          variant: "destructive",
        });
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [def, org, token, evaluationId, t]
  );

  useEffect(() => {
    void loadEvaluation();
  }, [loadEvaluation]);

  const sections = useMemo(
    () => evaluation?.template.sections ?? [],
    [evaluation]
  );
  const totalIndicators = useMemo(
    () =>
      sections.reduce(
        (sum, s) =>
          sum + s.indicators.filter((i) => i.applicable !== false).length,
        0
      ),
    [sections]
  );
  const answeredCount = useMemo(
    () => Object.values(draft).filter((r) => r.score !== null).length,
    [draft]
  );
  const hasUnsavedChanges = useMemo(
    () => !areDraftsEqual(draft, savedDraft),
    [draft, savedDraft]
  );

  // FE7-B01: sesión colaborativa — si otro facilitador califica un KPI de
  // esta misma evaluación, la recargamos en vivo. Si el usuario actual tiene
  // cambios locales sin guardar, no la pisamos: solo avisamos (el fix de
  // "Unsaved changes" de esta misma sesión existe justamente para que ese
  // aviso sea confiable).
  const handleRemoteScoreUpdate = useCallback(() => {
    if (hasUnsavedChanges) {
      toast({
        description: t(`${def.i18n}.remoteUpdatePending`),
      });
      return;
    }
    void loadEvaluation(true);
  }, [def, hasUnsavedChanges, loadEvaluation, t]);

  useAssessmentSession(org, evaluationId, token, handleRemoteScoreUpdate);

  // RNF-03: reintenta lo que quedó pendiente en la cola local (por ejemplo,
  // de una sesión anterior sin red) apenas monta y cada vez que vuelve la
  // conexión — nunca se pierde una calificación por caída de red.
  const flushQueue = useCallback(async () => {
    if (!org || !token) return;
    const result = await flushAssessmentQueue<AssessmentKpiResponseInput[]>(
      evaluationId,
      async (item) => {
        await def.api.upsertResponses(
          item.org,
          item.evaluationId,
          item.responses,
          item.token
        );
      }
    );
    setPendingSyncCount(result.remaining);
    if (result.succeeded > 0) {
      void loadEvaluation(true);
    }
  }, [def, org, token, evaluationId, loadEvaluation]);

  useEffect(() => {
    void flushQueue();
    const handleOnline = () => void flushQueue();
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [flushQueue]);

  const handleChangeKpi = useCallback(
    (indicatorId: string, score: number | null, observation: string) => {
      setDraft((prev) => ({ ...prev, [indicatorId]: { score, observation } }));
    },
    []
  );

  const handleImproveObservation = useCallback(
    async (indicatorId: string) => {
      if (!org || !token) return;
      const entry = draft[indicatorId];
      if (!entry || entry.score == null || !entry.observation.trim()) return;
      setImprovingIndicatorId(indicatorId);
      try {
        const refreshedToken = token;
        const { improved } = await def.api.improveObservation(
          org,
          evaluationId,
          indicatorId,
          entry.score,
          entry.observation,
          refreshedToken
        );
        handleChangeKpi(indicatorId, entry.score, improved);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        toast({
          title: t("app.common.error"),
          description: message,
          variant: "destructive",
        });
      } finally {
        setImprovingIndicatorId(null);
      }
    },
    [def, org, token, draft, evaluationId, handleChangeKpi, t]
  );

  const saveDimension = useCallback(
    async (sectionIdx: number): Promise<boolean> => {
      if (!org || !token || !evaluation) return true;
      const section = sections[sectionIdx];
      if (!section) return true;

      const responses: AssessmentKpiResponseInput[] = section.indicators
        .map((ind) => ({ indicatorId: ind.id, entry: draft[ind.id] }))
        .filter(
          (
            x
          ): x is {
            indicatorId: string;
            entry: DraftResponse & { score: number };
          } => x.entry?.score != null
        )
        .map((x) => ({
          indicatorId: x.indicatorId,
          score: x.entry.score,
          observation: x.entry.observation,
        }));

      if (responses.length === 0) return true;

      const missingObservation = responses.find((r) => !r.observation.trim());
      if (missingObservation) {
        toast({
          title: t("app.common.error"),
          description: t(`${def.i18n}.observationRequired`),
          variant: "destructive",
        });
        return false;
      }

      setSaving(true);
      let refreshedToken: string = token;
      try {
        refreshedToken = token ?? token;
        const updated = await def.api.upsertResponses(
          org,
          evaluationId,
          responses,
          refreshedToken
        );
        setEvaluation(updated);
        setLastSaved(new Date());
        setSavedDraft(draft);
        return true;
      } catch (err: unknown) {
        // RNF-03: un error de red (no un rechazo del servidor) no debe
        // frenar el taller — se guarda localmente y se reintenta solo.
        if (!(err instanceof HttpResponseError)) {
          await enqueueAssessmentSave<AssessmentKpiResponseInput[]>({
            tool: "organizational",
            org,
            evaluationId,
            responses,
            token: refreshedToken,
          });
          setPendingSyncCount((count) => count + 1);
          setSavedDraft(draft);
          toast({
            title: t(`${def.i18n}.offlineQueuedTitle`),
            description: t(`${def.i18n}.offlineQueuedDescription`),
          });
          return true;
        }
        const message = err instanceof Error ? err.message : "Unknown error";
        toast({
          title: t("app.common.error"),
          description: message,
          variant: "destructive",
        });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [def, org, token, evaluation, sections, draft, evaluationId, t]
  );

  const handleSaveClick = useCallback(() => {
    void saveDimension(dimensionIndex);
  }, [saveDimension, dimensionIndex]);

  // No se puede avanzar de dimensión (ni ver el resumen) si falta calificar
  // algún KPI aplicable — los marcados applicable=false por la aplicabilidad
  // del perfil se excluyen y no bloquean el avance. El botón "Guardar" sigue
  // permitiendo progreso parcial: esta validación solo aplica a "Siguiente".
  const missingApplicableKpi = useCallback(
    (sectionIdx: number): boolean => {
      const section = sections[sectionIdx];
      if (!section) return false;
      return section.indicators
        .filter((ind) => ind.applicable !== false)
        .some((ind) => draft[ind.id]?.score == null);
    },
    [sections, draft]
  );

  const handleNext = useCallback(async () => {
    if (missingApplicableKpi(dimensionIndex)) {
      toast({
        title: t("app.common.error"),
        description: t(`${def.i18n}.missingResponses`),
        variant: "destructive",
      });
      return;
    }
    const ok = await saveDimension(dimensionIndex);
    if (!ok) return;
    if (dimensionIndex >= sections.length - 1) {
      void navigate({
        to: def.routes.summary,
        params: { evaluationId },
      });
    } else {
      setDimensionIndex((prev) => prev + 1);
    }
  }, [
    def,
    saveDimension,
    dimensionIndex,
    sections.length,
    navigate,
    evaluationId,
    missingApplicableKpi,
    t,
  ]);

  const handlePrevious = useCallback(async () => {
    await saveDimension(dimensionIndex);
    setDimensionIndex((prev) => Math.max(prev - 1, 0));
  }, [saveDimension, dimensionIndex]);

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
  const currentSection = sections[dimensionIndex];
  const currentSectionIndicators =
    currentSection?.indicators.filter((ind) => ind.applicable !== false) ?? [];

  const currentSectionAverage = currentSection
    ? (() => {
        const scores = currentSectionIndicators
          .map((ind) => draft[ind.id]?.score)
          .filter((s): s is number => s !== null && s !== undefined);
        return scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;
      })()
    : 0;

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("app.common.back")}
          onClick={() => void navigate({ to: def.routes.list })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 flex items-center justify-between">
          <div>
            <span
              className="text-lg font-bold"
              style={{ color: "var(--color-brand)" }}
            >
              {evaluation.profile.name}
            </span>
            <span className="text-sm text-muted-foreground ml-2">
              — {t(`${def.i18n}.title`)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isCompleted ? "default" : "secondary"}>
              {isCompleted
                ? t(`${def.i18n}.statusCompleted`)
                : evaluation.status === "IN_PROGRESS"
                  ? t(`${def.i18n}.statusInProgress`)
                  : t(`${def.i18n}.statusDraft`)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {answeredCount} / {totalIndicators}{" "}
              {t(`${def.i18n}.indicatorsCompleted`)}
            </span>
          </div>
        </div>
      </div>

      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-brand transition-all"
          style={{
            width: `${totalIndicators > 0 ? (answeredCount / totalIndicators) * 100 : 0}%`,
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {currentSection && (
            <DimensionView
              number={currentSection.number}
              name={currentSection.name}
              indicators={currentSectionIndicators}
              responses={draft}
              t={t}
              onChangeKpi={handleChangeKpi}
              onImproveObservation={(indicatorId) =>
                void handleImproveObservation(indicatorId)
              }
              improvingIndicatorId={improvingIndicatorId}
              labels={{
                dimension: t(`${def.i18n}.section`),
                indicatorsCompleted: t(`${def.i18n}.indicatorsCompleted`),
              }}
            />
          )}

          <div className="flex items-center justify-between mt-6">
            <span className="text-xs text-muted-foreground">
              {pendingSyncCount > 0
                ? `${t(`${def.i18n}.pendingSync`)} (${pendingSyncCount})`
                : hasUnsavedChanges
                  ? t(`${def.i18n}.unsavedChanges`)
                  : lastSaved
                    ? `${t(`${def.i18n}.autoSaved`)} ${lastSaved.toLocaleTimeString()}`
                    : null}
            </span>
            <div className="flex gap-2">
              {dimensionIndex > 0 && (
                <Button
                  variant="outline"
                  onClick={() => void handlePrevious()}
                  disabled={saving}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t(`${def.i18n}.previousSection`)}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleSaveClick}
                disabled={saving}
              >
                {t(`${def.i18n}.save`)}
              </Button>
              <Button onClick={() => void handleNext()} disabled={saving}>
                {dimensionIndex === sections.length - 1
                  ? t(`${def.i18n}.viewSummary`)
                  : t(`${def.i18n}.nextSection`)}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border rounded-xl p-4 flex flex-col items-center">
            <RingGauge
              value={currentSectionAverage}
              label={t(`${def.i18n}.sectionAverage`)}
            />
          </div>
          <div className="border rounded-xl p-4">
            <p className="text-xs uppercase text-muted-foreground font-semibold text-center">
              {t(`${def.i18n}.globalScore`)}
            </p>
            <p className="text-2xl font-bold text-center mt-1">
              {evaluation.globalScore.toFixed(1)}
            </p>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-brand"
                style={{ width: `${(evaluation.globalScore / 10) * 100}%` }}
              />
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              void navigate({
                to: def.routes.summary,
                params: { evaluationId },
              })
            }
          >
            {t(`${def.i18n}.viewSummary`)}
          </Button>
        </div>
      </div>
    </div>
  );
}
