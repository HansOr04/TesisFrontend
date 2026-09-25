import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/application/auth-context";
import { useTranslation } from "@/shared/i18n/i18n";
import { toast } from "@/shared/ui/use-toast";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Progress } from "@/shared/ui/progress";
import { ArrowLeft, User, Calendar, AlertTriangle } from "lucide-react";
import type { AssessmentMeasureStatus } from "@/modules/assessment-core/infrastructure/assessment-api";
import { gaugeColor } from "@/modules/assessment-core/presentation/components/gauge";
import type { IndicatorToolUi } from "../../domain/indicator-tool-ui";
import type { IndicatorToolMeasure } from "../../infrastructure/indicator-tool-api";

const STATUS_BADGE: Record<AssessmentMeasureStatus, string> = {
  PENDING: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-warning/15 text-warning",
  DONE: "bg-success/10 text-success",
};

export function IndicatorToolMeasureDetailPage({
  def,
}: {
  def: IndicatorToolUi;
}) {
  const { evaluationId, measureId } = useParams({
    from: def.routeKeys.measureDetail,
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
  const measure = useMemo(
    () => measuresQuery.data?.find((m) => m.id === measureId) ?? null,
    [measuresQuery.data, measureId]
  );
  const loading = evaluationQuery.isLoading || measuresQuery.isLoading;
  const [progressInput, setProgressInput] = useState(0);
  const [supportInput, setSupportInput] = useState("");
  const [budgetInput, setBudgetInput] = useState("");
  const [verificationLinkInput, setVerificationLinkInput] = useState("");
  const [saving, setSaving] = useState(false);

  // El formulario se inicializa con la medida cargada (y al cambiar de medida).
  useEffect(() => {
    if (!measure) return;
    setProgressInput(measure.progressPct);
    setSupportInput(measure.support ?? "");
    setBudgetInput(measure.budgetUsd != null ? String(measure.budgetUsd) : "");
    setVerificationLinkInput(measure.verificationLink ?? "");
  }, [measure]);

  const response = useMemo(() => {
    if (!evaluation || !measure) return undefined;
    return evaluation.responses.find(
      (r) => r.indicatorId === measure.indicatorId
    );
  }, [evaluation, measure]);

  const handleSaveProgress = async () => {
    if (!org || !token || !measure) return;
    setSaving(true);
    try {
      const refreshedToken = token;
      const updated = await def.api.updateMeasureProgress(
        org,
        measure.id,
        {
          progressPct: progressInput,
          support: supportInput.trim() || undefined,
          budgetUsd: budgetInput.trim() ? Number(budgetInput) : undefined,
          verificationLink: verificationLinkInput.trim() || undefined,
        },
        refreshedToken
      );
      queryClient.setQueryData(
        def.queries.keys.measures(org, evaluationId),
        (prev: IndicatorToolMeasure[] | undefined) =>
          (prev ?? []).map((m) => (m.id === updated.id ? updated : m))
      );
      void def.queries.invalidateEvaluation(queryClient, org, evaluationId);
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
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!evaluation || !measure) {
    return (
      <div className="container mx-auto py-6 text-center text-muted-foreground">
        Evaluation not found
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("app.common.back")}
            onClick={() =>
              void navigate({
                to: def.routes.actionPlan,
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
              {measure.name}
            </span>
            <span className="text-sm text-muted-foreground ml-2">
              — {t(`${def.i18n}.measureDetail`)}
            </span>
          </div>
        </div>
        <Badge className={STATUS_BADGE[measure.status]}>
          {measure.status === "DONE"
            ? t(`${def.i18n}.measureDone`)
            : measure.status === "IN_PROGRESS"
              ? t(`${def.i18n}.measureInProgress`)
              : t(`${def.i18n}.measurePending`)}
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground uppercase font-semibold">
            {t(`${def.i18n}.associatedKpi`)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold">
              {measure.indicator.code} — {measure.indicator.name}
            </p>
            {response && (
              <span
                className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: gaugeColor(response.score) }}
              >
                {response.score}/10
              </span>
            )}
          </div>
          {measure.indicator.description && (
            <p className="text-xs text-muted-foreground">
              {measure.indicator.description}
            </p>
          )}
          {response?.observation && (
            <p className="text-xs italic border-l-2 border-muted pl-2 text-muted-foreground">
              &ldquo;{response.observation}&rdquo;
            </p>
          )}
          {response?.isCritical && (
            <p className="flex items-center gap-1 text-[11px] font-semibold text-danger">
              <AlertTriangle className="h-3 w-3" />
              {t(`${def.i18n}.statusNeedsAttention`)}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground uppercase font-semibold">
            {t(`${def.i18n}.measureTimeline`)}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6 text-sm">
          <span className="flex items-center gap-2">
            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-muted">
              <User className="h-4 w-4 text-muted-foreground" />
            </span>
            <span>
              <span className="block text-xs text-muted-foreground">
                {t(`${def.i18n}.measureResponsible`)}
              </span>
              {measure.responsible}
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-muted">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </span>
            <span>
              <span className="block text-xs text-muted-foreground">
                {t(`${def.i18n}.measureStartDate`)} →{" "}
                {t(`${def.i18n}.measureEndDate`)}
              </span>
              {new Date(measure.startDate).toLocaleDateString()} →{" "}
              {new Date(measure.endDate).toLocaleDateString()}
            </span>
          </span>
        </CardContent>
      </Card>

      {measure.description && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase font-semibold">
              {t(`${def.i18n}.measureDescription`)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{measure.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground uppercase font-semibold">
            {t(`${def.i18n}.measureAdditionalInfo`)}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              {t(`${def.i18n}.measureSupport`)}
            </label>
            <Input
              value={supportInput}
              onChange={(e) => {
                setSupportInput(e.target.value);
              }}
              placeholder={t(`${def.i18n}.measureSupportPlaceholder`)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              {t(`${def.i18n}.measureBudget`)}
            </label>
            <Input
              type="number"
              min={0}
              value={budgetInput}
              onChange={(e) => {
                setBudgetInput(e.target.value);
              }}
              placeholder="0"
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs text-muted-foreground">
              {t(`${def.i18n}.measureVerificationLink`)}
            </label>
            <Input
              value={verificationLinkInput}
              onChange={(e) => {
                setVerificationLinkInput(e.target.value);
              }}
              placeholder={t(`${def.i18n}.measureVerificationLinkPlaceholder`)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground uppercase font-semibold">
            {t(`${def.i18n}.measureProgress`)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Progress value={measure.progressPct} className="flex-1" />
            <span className="text-sm font-semibold w-12 text-right">
              {measure.progressPct}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={100}
              value={progressInput}
              onChange={(e) => {
                setProgressInput(
                  Math.max(0, Math.min(100, Number(e.target.value)))
                );
              }}
              className="w-24"
            />
            <Button onClick={() => void handleSaveProgress()} disabled={saving}>
              {t(`${def.i18n}.updateProgress`)}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
